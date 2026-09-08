import { afterEach, describe, expect, it } from 'vitest'
import { DialogueError } from '../../errors/DialogueError'
import { dialogueScenario, type DialogueScenario } from '../support/DialogueScenario'

let scenario: DialogueScenario | undefined
afterEach(() => scenario?.dispose())

describe('Feed recovery policy', () => {
  it('stops retrying a permanent subscription error while preserving loaded history', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    await scenario.backend.stream(chat, 'Saved reply')
    scenario.backend.nextWatchError = new DialogueError('FORBIDDEN', 'Access denied.', 'stop')
    const lease = await scenario.user.open(chat)

    expect(lease.dialogue.ready).toBe(true)
    expect(lease.dialogue.connection.error).toBe('Access denied.')

    const attempts = scenario.backend.watchAttempts
    await scenario.network.reconnect()

    expect(scenario.backend.watchAttempts).toBe(attempts)
    expect(lease.dialogue.history.items[0].text).toBe('Saved reply')
  })

  it('does not confuse arbitrary cursor wording with an expired replay position', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    scenario.backend.nextWatchError = new DialogueError('NETWORK_ERROR', 'Network cursor diagnostic.', 'retry')
    await scenario.user.open(chat)
    await scenario.network.reconnect()

    expect(scenario.backend.historyReads).toBe(1)
    expect(scenario.backend.connections(chat.id)).toBe(1)
  })

  it('surfaces a permanent initial load error and permits an explicit new open', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    scenario.backend.requests.details.failNext(new DialogueError('FORBIDDEN', 'Access denied.', 'stop'))
    const first = scenario.engine.open(chat.id)

    await expect(first.ready).rejects.toThrow('Access denied.')
    expect(first.dialogue.ready).toBe(false)
    expect(first.dialogue.error).toBe('Access denied.')

    const second = await scenario.user.open(chat)
    first.release()

    expect(second.dialogue.ready).toBe(true)
    expect(scenario.backend.connections(chat.id)).toBe(1)
  })
})
