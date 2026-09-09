import { afterEach, describe, expect, it, vi } from 'vitest'
import { SubscriptionExecutionError, SubscriptionOverflowError } from '..'
import { deferred, subscriptionFixture } from './multiplex-fixture'

const fixtures: Awaited<ReturnType<typeof subscriptionFixture>>[] = []

async function setup(options?: Parameters<typeof subscriptionFixture>[0]) {
  const fixture = await subscriptionFixture(options)
  fixtures.push(fixture)
  return fixture
}

afterEach(async () => {
  for (const fixture of fixtures.reverse()) await fixture.dispose()
  fixtures.length = 0
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Shared connection ownership', () => {
  it('shares one stream and releases only the canceled operation', async () => {
    const fixture = await setup()
    const first = fixture.subscribe('first')
    const second = fixture.subscribe('second')
    await fixture.waitForActive(2)

    first.dispose()
    await fixture.waitForActive(1)
    fixture.emit('second', 'still live')
    await fixture.waitForMessages(second, 1)

    expect(second.received).toEqual(['still live'])
    expect(fixture.streamsOpened).toBe(1)
    expect(fixture.activeStreams).toBe(1)
  })

  it('closes after the last release and stays closed when the network returns', async () => {
    const fixture = await setup()
    const lease = fixture.subscribe('only')
    await fixture.waitForActive(1)

    lease.dispose()
    await lease.done
    await fixture.waitForStreams(0)
    fixture.online()
    await fixture.settle()

    expect(fixture.activeStreams).toBe(0)
    expect(fixture.streamsOpened).toBe(1)
  })

  it('does no IO for a signal canceled before subscribing', async () => {
    const fixture = await setup()
    const controller = new AbortController()
    controller.abort()

    await fixture.subscribe('canceled', { signal: controller.signal }).done

    expect(fixture.requests).toEqual([])
  })

  it('treats normal operation completion as terminal', async () => {
    const fixture = await setup()
    const lease = fixture.subscribe('finite')
    await fixture.waitForActive(1)

    await fixture.complete('finite')
    await lease.done
    await fixture.waitForStreams(0)

    expect(fixture.starts('finite')).toHaveLength(1)
  })

  it('leaves other features connected when the dialogue engine is disposed', async () => {
    const fixture = await setup()
    const unrelated = fixture.subscribe('another-feature')
    const engine = fixture.startDialogueEngine()
    await fixture.waitForActive(2)

    engine.dispose()
    await fixture.waitForActive(1)
    fixture.emit('another-feature', 'still connected')
    await fixture.waitForMessages(unrelated, 1)

    expect(unrelated.received).toEqual(['still connected'])
    expect(fixture.streamsOpened).toBe(1)
  })
})

describe('Recovery from applied state', () => {
  it('waits for prior async application before reconnecting with a fresh cursor', async () => {
    const fixture = await setup()
    const apply = deferred()
    const applying = deferred()
    let cursor = 'snapshot'
    fixture.subscribe('first', {
      prepare: () => ({ scope: 'first', after: cursor }),
      next: async () => {
        applying.resolve()
        await apply.promise
        cursor = 'applied'
      },
    })
    fixture.subscribe('second')
    await fixture.waitForActive(2)
    fixture.emit('first', 'update')
    await applying.promise

    fixture.disconnect()
    await fixture.waitForStarts('second', 2)
    expect(fixture.starts('first')).toEqual(['snapshot'])
    apply.resolve()
    await fixture.waitForStarts('first', 2)

    expect(fixture.starts('first')).toEqual(['snapshot', 'applied'])
    expect(fixture.streamsOpened).toBe(2)
  })

  it('retries a failed snapshot locally without reconnecting other operations', async () => {
    const fixture = await setup()
    let attempts = 0
    fixture.subscribe('recovered', {
      prepare: () => {
        if (++attempts === 1) throw new Error('Temporary snapshot failure')
        return { scope: 'recovered', after: 'fresh' }
      },
      recover: () => true,
    })
    fixture.subscribe('healthy')
    await fixture.waitForActive(2)

    expect(attempts).toBe(2)
    expect(fixture.starts('recovered')).toEqual(['fresh'])
    expect(fixture.streamsOpened).toBe(1)
  })

  it('stops a permanently failing snapshot after the local recovery budget', async () => {
    const fixture = await setup()
    let attempts = 0
    const failing = fixture.subscribe('failing', {
      prepare: () => {
        attempts += 1
        throw new Error('Permanent snapshot failure')
      },
      recover: () => true,
    })

    await expect(failing.done).rejects.toThrow('Permanent snapshot failure')

    expect(attempts).toBe(4)
    expect(fixture.starts('failing')).toEqual([])
  })

  it('bounds shared reconnect attempts even when each connection briefly succeeds', async () => {
    const fixture = await setup({ retryAttempts: 1 })
    const lease = fixture.subscribe('active')
    await fixture.waitForActive(1)

    fixture.disconnect()
    await fixture.waitForStarts('active', 2)
    fixture.disconnect()

    await expect(lease.done).rejects.toThrow('exhausted')
    expect(fixture.streamsOpened).toBe(2)
    expect(lease.states.at(-1)?.status).toBe('Stopped')
  })

  it('reconnects when the persistent stream stops receiving heartbeat bytes', async () => {
    const fixture = await setup({ heartbeatTimeoutMs: 100 })
    fixture.subscribe('active')
    await fixture.waitForStarts('active', 2)

    expect(fixture.streamsOpened).toBeGreaterThan(1)
  })

  it('pauses offline and reconnects once when the network returns', async () => {
    const fixture = await setup()
    const lease = fixture.subscribe('active')
    await fixture.waitForActive(1)

    fixture.offline()
    await fixture.waitForStreams(0)
    await fixture.settle()
    expect(lease.states.at(-1)?.status).toBe('Offline')
    expect(fixture.streamsOpened).toBe(1)
    fixture.online()
    fixture.online()
    await fixture.waitForStarts('active', 2)

    expect(fixture.streamsOpened).toBe(2)
    expect(fixture.activeStreams).toBe(1)
  })
})

describe('Ordered delivery and cancellation', () => {
  it('applies each operation’s events sequentially', async () => {
    const fixture = await setup()
    const apply = deferred()
    const applying = deferred()
    let applyingCount = 0
    const lease = fixture.subscribe('ordered', {
      next: async () => {
        applyingCount += 1
        applying.resolve()
        await apply.promise
      },
    })
    const witness = fixture.subscribe('witness')
    await fixture.waitForActive(2)
    fixture.emit('ordered', 'one')
    fixture.emit('ordered', 'two')
    fixture.emit('witness', 'batch delivered')
    await applying.promise
    await fixture.waitForMessages(witness, 1)

    expect(applyingCount).toBe(1)
    expect(lease.received).toEqual([])
    apply.resolve()
    await fixture.waitForMessages(lease, 2)

    expect(lease.received).toEqual(['one', 'two'])
  })

  it('discards queued events when canceled during an async application', async () => {
    const fixture = await setup()
    const apply = deferred()
    const applying = deferred()
    const lease = fixture.subscribe('ordered', {
      next: async () => {
        applying.resolve()
        await apply.promise
      },
    })
    const witness = fixture.subscribe('witness')
    await fixture.waitForActive(2)
    fixture.emit('ordered', 'applying')
    await applying.promise
    fixture.emit('ordered', 'queued')
    fixture.emit('witness', 'batch delivered')
    await fixture.waitForMessages(witness, 1)

    lease.dispose()
    apply.resolve()
    await lease.done
    await fixture.settle()

    expect(lease.received).toEqual(['applying'])
  })

  it('does not post an operation whose prepare finishes after cancellation', async () => {
    const fixture = await setup()
    const prepare = deferred()
    const preparing = deferred()
    const lease = fixture.subscribe('abandoned', {
      prepare: async () => {
        preparing.resolve()
        await prepare.promise
        return { scope: 'abandoned' }
      },
    })
    await preparing.promise

    lease.dispose()
    prepare.resolve()
    await lease.done
    await fixture.waitForStreams(0)

    expect(fixture.starts('abandoned')).toEqual([])
    expect(fixture.requests).not.toContain('POST')
  })

  it('reports overflow while another operation continues applying events', async () => {
    const fixture = await setup({ queueLimit: 1 })
    const apply = deferred()
    const applying = deferred()
    const slow = fixture.subscribe('slow', {
      next: async () => {
        applying.resolve()
        await apply.promise
      },
    })
    const fast = fixture.subscribe('fast')
    await fixture.waitForActive(2)
    fixture.emit('slow', 'applying')
    await applying.promise

    fixture.emit('slow', 'queued')
    fixture.emit('slow', 'overflow')
    fixture.emit('fast', 'independent')
    await fixture.waitForMessages(fast, 1)
    apply.resolve()

    await expect(slow.done).rejects.toBeInstanceOf(SubscriptionOverflowError)
    expect(fast.received).toEqual(['independent'])
    expect(fixture.streamsOpened).toBe(1)
  })

  it('replays an overflowing operation from its last applied cursor', async () => {
    const fixture = await setup({ queueLimit: 1 })
    const apply = deferred()
    const applying = deferred()
    let cursor = 'initial'
    fixture.subscribe('slow', {
      prepare: () => ({ scope: 'slow', after: cursor }),
      next: async (data) => {
        applying.resolve()
        await apply.promise
        cursor = data.message
      },
      recover: (error) => error instanceof SubscriptionOverflowError,
    })
    await fixture.waitForActive(1)
    fixture.emit('slow', 'applied')
    await applying.promise

    fixture.emit('slow', 'queued')
    fixture.emit('slow', 'overflow')
    await fixture.waitForActive(0)
    apply.resolve()
    await fixture.waitForStarts('slow', 2)

    expect(fixture.starts('slow')).toEqual(['initial', 'applied'])
    expect(fixture.streamsOpened).toBe(1)
  })
})

describe('Failure isolation and protocol regressions', () => {
  it('keeps healthy subscriptions live after an operation GraphQL error', async () => {
    const fixture = await setup()
    const healthy = fixture.subscribe('healthy')
    const forbidden = fixture.subscribe('forbidden')
    await fixture.waitForActive(2)

    fixture.emit('forbidden', 'FORBIDDEN')
    await expect(forbidden.done).rejects.toBeInstanceOf(SubscriptionExecutionError)
    fixture.emit('healthy', 'still live')
    await fixture.waitForMessages(healthy, 1)

    expect(healthy.received).toEqual(['still live'])
    expect(fixture.streamsOpened).toBe(1)
  })

  it('keeps healthy subscriptions live after an operation HTTP access rejection', async () => {
    const fixture = await setup()
    const healthy = fixture.subscribe('healthy')
    await fixture.waitForActive(1)

    fixture.rejectOperation(403)
    await expect(fixture.subscribe('denied').done).rejects.toThrow()
    fixture.emit('healthy', 'still live')
    await fixture.waitForMessages(healthy, 1)

    expect(healthy.received).toEqual(['still live'])
    expect(fixture.streamsOpened).toBe(1)
  })

  it('stops all operations when the physical connection is denied access', async () => {
    const fixture = await setup()
    fixture.rejectConnection(401)
    const first = fixture.subscribe('first')
    const second = fixture.subscribe('second')

    await expect(first.done).rejects.toThrow('access denied')
    await expect(second.done).rejects.toThrow('access denied')

    expect(fixture.requests).toEqual(['PUT'])
  })

  it('isolates a throwing status observer from other operations', async () => {
    const fixture = await setup()
    const broken = fixture.subscribe('broken', {
      changed: (state) => {
        if (state.status === 'Live') throw new Error('Broken observer')
      },
    })
    const healthy = fixture.subscribe('healthy')
    await fixture.waitForActive(1)

    await expect(broken.done).rejects.toThrow('Broken observer')
    fixture.emit('healthy', 'live')
    await fixture.waitForMessages(healthy, 1)

    expect(healthy.received).toEqual(['live'])
    expect(healthy.states).toContainEqual({ status: 'Live', error: '' })
  })

  it('keeps injected headers unchanged and reserves a fresh token on reconnect', async () => {
    const headers = { 'X-Workspace': 'test' }
    const fixture = await setup({ headers })
    fixture.subscribe('active')
    await fixture.waitForActive(1)

    fixture.disconnect()
    await fixture.waitForStarts('active', 2)

    expect(headers).toEqual({ 'X-Workspace': 'test' })
    expect(fixture.reservationTokens).toEqual([undefined, undefined])
  })

  it('preserves coded HTTP GraphQL errors after the library aborts the rejected request', async () => {
    const fixture = await setup()
    fixture.rejectOperation(400, { errors: [{ message: 'Replay expired.', extensions: { code: 'INVALID_CURSOR' } }] })

    const lease = fixture.subscribe('invalid-cursor')

    await expect(lease.done).rejects.toMatchObject({
      errors: [{ message: 'Replay expired.', extensions: { code: 'INVALID_CURSOR' } }],
    })
  })

  it('releases a server operation canceled before its acknowledgement reaches the client', async () => {
    const acknowledgement = deferred()
    const fixture = await setup({ acknowledgement: acknowledgement.promise, idleGraceMs: 1000 })
    const lease = fixture.subscribe('abandoned')
    await fixture.waitForActive(1)

    lease.dispose()
    acknowledgement.resolve()
    await fixture.waitForActive(0)

    expect(fixture.requests.filter((method) => method === 'DELETE')).toHaveLength(1)
    expect(fixture.activeStreams).toBe(1)
  })
})
