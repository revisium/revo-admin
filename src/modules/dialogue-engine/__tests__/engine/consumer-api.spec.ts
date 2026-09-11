import { afterEach, describe, expect, it } from 'vitest'
import { autorun } from 'mobx'
import { dialogueScenario, type DialogueScenario } from '../support/DialogueScenario'

let scenario: DialogueScenario | undefined

afterEach(() => scenario?.dispose())

describe('Consumer API', () => {
  it('orders loaded dialogues by recency and reactively moves accepted summaries', async () => {
    const currentScenario = dialogueScenario()
    scenario = currentScenario
    const first = currentScenario.backend.dialogue('First', { updatedAt: '2026-09-01' })
    const second = currentScenario.backend.dialogue('Second', { updatedAt: '2026-09-03' })
    const tiedFirst = currentScenario.backend.dialogue('Tied first', { updatedAt: '2026-09-02' })
    const tiedSecond = currentScenario.backend.dialogue('Tied second', { updatedAt: '2026-09-02' })
    currentScenario.engine.start()
    const orders: string[][] = []
    currentScenario.own(
      autorun(() => orders.push(currentScenario.engine.list.items.map((dialogue) => dialogue.id))),
      (dispose) => dispose(),
    )

    await currentScenario.waitFor(() => currentScenario.engine.list.items.length === 4)

    expect(currentScenario.engine.list.items.map((dialogue) => dialogue.id)).toEqual([
      second.id,
      tiedFirst.id,
      tiedSecond.id,
      first.id,
    ])

    await currentScenario.backend.updateSummary(first, { updatedAt: '2026-09-04', version: '1' })
    await currentScenario.waitFor(() => currentScenario.engine.list.items[0]?.id === first.id)

    expect(orders.some((order) => order[0] === first.id)).toBe(true)

    await currentScenario.backend.updateSummary(first, { updatedAt: '2026-08-01', version: '0' })

    expect(currentScenario.engine.list.items[0]?.id).toBe(first.id)
  })

  it('exposes usable history independently of a live connection', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    await scenario.backend.stream(chat, 'Saved reply')
    scenario.backend.offline = true
    const handle = await scenario.user.open(chat)

    expect(handle.dialogue.ready).toBe(true)
    expect(handle.dialogue.error).toBe('')
    expect(handle.dialogue.connection.status).toBe('Reconnecting')
    expect(handle.dialogue.connection.error).toBe('Offline')
    expect(handle.dialogue.history.items[0].text).toBe('Saved reply')

    scenario.backend.offline = false
    await scenario.network.reconnect()

    expect(handle.dialogue.connection.status).toBe('Live')
  })

  it('publishes title changes through the same observable dialogue in the sidebar', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    scenario.engine.start()
    const { dialogue } = await scenario.user.open(chat)
    const titles: string[] = []
    scenario.own(
      autorun(() => titles.push(dialogue.title)),
      (stop) => stop(),
    )

    await scenario.backend.updateSummary(chat, { title: 'New title', version: '1' })

    expect(titles).toEqual(['Planning', 'New title'])
    expect(scenario.engine.list.items[0]).toBe(dialogue)
  })

  it('exposes accepted summary revisions independently of recency timestamps', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    const { dialogue } = await scenario.user.open(chat)
    const initialRevision = dialogue.revision

    await scenario.backend.updateSummary(chat, { version: '1', title: 'Updated title', updatedAt: chat.updatedAt })

    await scenario.waitFor(() => dialogue.revision === '1')

    expect(dialogue.revision).not.toBe(initialRevision)
    expect(dialogue.updatedAt).toBe(chat.updatedAt)

    await scenario.backend.updateSummary(chat, { version: '0', title: 'Older title', updatedAt: chat.updatedAt })

    expect(dialogue.revision).toBe('1')
    expect(dialogue.title).toBe('Updated title')
  })

  it('keeps the same history entry while streaming more text', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    const { dialogue } = await scenario.user.open(chat)
    await scenario.backend.stream(chat, 'A')
    const entry = dialogue.history.items[0]

    await scenario.backend.stream(chat, 'B')

    expect(dialogue.history.items[0]).toBe(entry)
    expect(entry.text).toBe('AB')
  })

  it('does not treat an ordinary history sequence as a displayed read watermark', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    await scenario.user.open(chat)
    await scenario.backend.stream(chat, 'Ordinary reply')

    const dialogue = scenario.engine.get(chat.id)
    const receipt = dialogue.displayReceipt()

    expect(receipt).toBeDefined()
    expect(dialogue.canAcknowledge(receipt!)).toBe(false)
  })

  it('does not expose mutable records or replay cursors through consumer resources', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    const { dialogue } = await scenario.user.open(chat)
    await scenario.backend.stream(chat, 'A')
    const entry = dialogue.history.items[0]

    expect('summary' in dialogue).toBe(false)
    expect('applyItem' in dialogue).toBe(false)
    expect('cursor' in dialogue.history).toBe(false)
    expect('data' in entry).toBe(false)
    expect('upsert' in entry).toBe(false)
    expect(Object.isFrozen(dialogue.history.items)).toBe(true)
  })

  it('requires explicit retry and retains the original command', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    const handle = await scenario.user.open(chat)
    scenario.backend.loseNextSendAcknowledgement = true

    await expect(handle.dialogue.send('Original')).rejects.toThrow('Acknowledgement lost')
    expect(handle.dialogue.canSend).toBe(false)
    expect(handle.dialogue.canRetry).toBe(true)
    expect(handle.dialogue.pendingText).toBe('Original')
    await expect(handle.dialogue.send('Different message')).rejects.toThrow('retrySend')
    expect(scenario.backend.deliveredCommandIds).toHaveLength(1)

    await handle.dialogue.retrySend()

    expect(handle.dialogue.canRetry).toBe(false)
    expect(scenario.backend.acceptedTurns).toBe(1)
    expect(new Set(scenario.backend.deliveredCommandIds).size).toBe(1)
  })

  it('retains the draft for retry after losing the send acknowledgement', async () => {
    scenario = dialogueScenario()
    const input = { title: 'Planning', agentId: 'test', agentVersion: '1' }
    const draft = scenario.engine.createDraft()
    scenario.backend.loseNextSendAcknowledgement = true

    await expect(draft.send(input, 'Original')).rejects.toThrow('Acknowledgement lost')
    expect(draft.state).toBe('retryable')
    await expect(draft.send(input, 'Different')).rejects.toThrow('retry')

    await draft.retry()

    expect(draft.state).toBe('ready')
  })

  it('does not offer retry when dialogue creation is uncertain', async () => {
    scenario = dialogueScenario()
    const input = { title: 'Planning', agentId: 'test', agentVersion: '1' }
    const draft = scenario.engine.createDraft()
    scenario.backend.loseNextCreateAcknowledgement = true

    await expect(draft.send(input, 'Original')).rejects.toThrow('Creation acknowledgement lost')

    expect(draft.state).toBe('creationUncertain')
    expect(draft.canRetry).toBe(false)
  })

  it('does not send a permission response to an input question', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    const question = scenario.backend.question(chat)
    const handle = await scenario.user.open(chat)
    const interaction = handle.dialogue.interaction(question)

    await expect(interaction.choose('approve')).rejects.toThrow()
    expect(scenario.backend.responseCommands).toEqual([])

    await interaction.submit({ answer: 'Yes' })

    expect(interaction.canRespond).toBe(false)
  })

  it('renders loading while the initial snapshot is pending', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    const history = scenario.backend.requests.history.holdNext()
    const handle = scenario.engine.open(chat.id)

    try {
      await history.received()

      expect(handle.dialogue.loading).toBe(true)
      expect(handle.dialogue.ready).toBe(false)

      await history.resume()
      await handle.ready

      expect(handle.dialogue.loading).toBe(false)
      expect(handle.dialogue.ready).toBe(true)
    } finally {
      await history.resume()
      handle.release()
    }
  })
})
