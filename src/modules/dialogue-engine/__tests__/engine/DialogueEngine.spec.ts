import { afterEach, describe, expect, it } from 'vitest'
import { dialogueScenario, type DialogueScenario } from '../support/DialogueScenario'

let scenario: DialogueScenario | undefined
afterEach(() => scenario?.dispose())

describe('Dialogue engine scenarios', () => {
  it('shares one dialogue and one subscription between two screens', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    const first = await scenario.user.open(chat)
    const second = await scenario.user.open(chat)

    expect(first.dialogue).toBe(second.dialogue)
    expect(scenario.backend.connections(chat.id)).toBe(1)

    first.release()

    expect(scenario.backend.connections(chat.id)).toBe(1)

    second.release()

    expect(scenario.backend.connections(chat.id)).toBe(0)
  })

  it('replays missed text without duplicating a response', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    await scenario.user.open(chat)
    await scenario.user.send(chat, 'Prepare a pipeline')
    await scenario.backend.stream(chat, 'First ')
    scenario.network.disconnect(chat)
    await scenario.backend.stream(chat, 'second')
    await scenario.network.reconnect()
    await scenario.expect.answer(chat, 'First second')

    expect(scenario.engine.get(chat.id).history.items).toHaveLength(1)
  })

  it('does not start a second turn after losing the acknowledgement', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    await scenario.user.open(chat)
    scenario.backend.loseNextSendAcknowledgement = true

    await expect(scenario.user.send(chat, 'Prepare a pipeline')).rejects.toThrow('Acknowledgement lost')

    await scenario.user.retry(chat)

    expect(scenario.backend.acceptedTurns).toBe(1)
    expect(new Set(scenario.backend.deliveredCommandIds).size).toBe(1)
  })

  it('reuses a created dialogue when first-message delivery fails', async () => {
    scenario = dialogueScenario()
    scenario.backend.loseNextSendAcknowledgement = true
    const draft = scenario.engine.createDraft()
    const input = { title: 'Planning', agentId: 'test', agentVersion: '1', agentInstallationId: 'installation-test' }

    await expect(draft.send(input, 'Prepare')).rejects.toThrow('Acknowledgement lost')

    const created = draft.dialogueId
    await draft.retry()

    expect(draft.dialogueId).toBe(created)
    expect(scenario.backend.createdDialogues).toBe(1)
    expect(scenario.backend.acceptedTurns).toBe(1)
  })

  it('does not acknowledge a summary newer than the displayed receipt', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    await scenario.user.open(chat)
    const receipt = scenario.engine.get(chat.id).displayReceipt()

    expect(receipt).toBeDefined()

    await scenario.backend.updateSummary(chat, { significantSequence: '9', version: '9', unreadCount: 1 })

    expect(scenario.engine.get(chat.id).unread).toBe(true)

    if (!receipt) throw new Error('Expected a display receipt')

    await scenario.engine.get(chat.id).acknowledge(receipt)

    expect(scenario.backend.readThrough).toBe('0')
  })

  it('preserves a newer unread summary while an older displayed receipt is completing', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    await scenario.user.open(chat)
    await scenario.backend.stream(chat, 'Displayed reply', { significantSequence: '1', version: '1', unreadCount: 1 })
    const dialogue = scenario.engine.get(chat.id)
    await dialogue.refresh()
    const receipt = dialogue.displayReceipt()
    const read = scenario.backend.requests.read.holdNext()

    const acknowledgement = dialogue.acknowledge(receipt!)
    await read.received()
    await scenario.backend.updateSummary(chat, { significantSequence: '2', version: '2', unreadCount: 1 })
    await read.resume()
    await acknowledgement

    expect(scenario.backend.readThrough).toBe('1')
    expect(dialogue.unread).toBe(true)
  })

  it('refreshes a rejected replay cursor without retrying agent work', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    await scenario.user.open(chat)
    scenario.network.disconnect(chat)
    scenario.backend.rejectNextCursor = true
    await scenario.network.reconnect()
    await scenario.network.reconnect()

    expect(scenario.backend.historyReads).toBe(2)
    expect(scenario.backend.acceptedTurns).toBe(0)
  })
})

describe('Dialogue delivery and projection boundaries', () => {
  it('repairs a missing delta and ignores duplicate delivery', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    await scenario.user.open(chat)
    await scenario.backend.stream(chat, 'A')
    scenario.backend.skipNextLiveEvent = true
    await scenario.backend.stream(chat, 'B')
    scenario.backend.duplicateNextEvent = true
    await scenario.backend.stream(chat, 'C')
    await scenario.expect.answer(chat, 'ABC')

    expect(scenario.engine.get(chat.id).history.items).toHaveLength(1)
  })

  it('does not admit new work while recovery is uncertain', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    await scenario.user.open(chat)
    await scenario.backend.updateSummary(chat, { status: 'UNCERTAIN', version: '1' })

    await expect(scenario.user.send(chat, 'Continue')).rejects.toThrow('not ready')
    expect(scenario.backend.acceptedTurns).toBe(0)
  })

  it('deduplicates two simultaneous submissions', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    await scenario.user.open(chat)
    await Promise.all([scenario.user.send(chat, 'Prepare'), scenario.user.send(chat, 'Prepare')])

    expect(scenario.backend.deliveredCommandIds).toHaveLength(1)
  })

  it('does not blindly recreate after losing the creation acknowledgement', async () => {
    scenario = dialogueScenario()
    scenario.backend.loseNextCreateAcknowledgement = true
    const draft = scenario.engine.createDraft()
    const input = { title: 'Planning', agentId: 'test', agentVersion: '1', agentInstallationId: 'installation-test' }

    await expect(draft.send(input, 'Prepare')).rejects.toThrow('Creation acknowledgement lost')
    await expect(draft.send(input, 'Prepare')).rejects.toThrow('could not be confirmed')
    expect(scenario.backend.createdDialogues).toBe(1)
  })
})

describe('Interaction delivery', () => {
  it('retries the accepted response after a newer snapshot already shows RESOLVED', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    const question = scenario.backend.question(chat)
    await scenario.user.open(chat)
    scenario.backend.loseNextResponseAcknowledgement = true
    const interaction = scenario.engine.get(chat.id).interaction(question)

    await expect(interaction.submit({ answer: 'Yes' })).rejects.toThrow('Response acknowledgement lost')

    await scenario.engine.get(chat.id).refresh()

    expect(interaction.active).toBe(false)
    expect(interaction.canRetry).toBe(true)

    await interaction.retry()

    expect(scenario.backend.responseCommands).toHaveLength(2)
    expect(new Set(scenario.backend.responseCommands).size).toBe(1)
  })
})

describe('Lease readiness', () => {
  it('resolves ready only after the initial history and interactions are usable', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    scenario.backend.question(chat)
    const lease = scenario.engine.open(chat.id)

    try {
      await lease.ready
      const dialogue = lease.dialogue

      expect(dialogue.ready).toBe(true)
      expect(dialogue.pendingInteractions).toHaveLength(1)
    } finally {
      lease.release()
    }
  })
})

describe('Navigation during connection establishment', () => {
  it('opens a fresh subscription when the last consumer closes and returns before the snapshot finishes', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    const history = scenario.backend.requests.history.holdNext()
    const first = scenario.engine.open(chat.id)
    await history.received()
    first.release()
    const second = scenario.engine.open(chat.id)
    await history.resume()

    try {
      await second.ready

      expect(scenario.engine.get(chat.id).connection.status).toBe('Live')
      expect(scenario.backend.connections(chat.id)).toBe(1)
    } finally {
      second.release()
    }
  })
})

describe('Engine lifetime', () => {
  it('does not let an old screen release a subscription from the next engine lifetime', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    scenario.engine.start()
    const first = await scenario.user.open(chat)

    expect(scenario.engine.list.items[0]).toBe(first.dialogue)

    scenario.engine.dispose()
    scenario.engine.start()
    const second = await scenario.user.open(chat)
    first.release()

    expect(scenario.backend.connections(chat.id)).toBe(1)

    second.release()
  })
})
