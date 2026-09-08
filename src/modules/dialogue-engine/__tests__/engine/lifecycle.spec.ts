import { afterEach, describe, expect, it } from 'vitest'
import { dialogueScenario, type DialogueScenario } from '../support/DialogueScenario'

let scenario: DialogueScenario | undefined
afterEach(() => scenario?.dispose())

describe('Dialogue lifecycle ownership', () => {
  it('does not report ready or apply an abandoned snapshot after release', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    await scenario.backend.stream(chat, 'Saved reply')
    const history = scenario.backend.requests.history.holdNext()
    const lease = scenario.engine.open(chat.id)
    const outcome = lease.ready.catch(() => undefined)
    await history.received()
    lease.release()
    await outcome

    expect(lease.dialogue.ready).toBe(false)

    await history.resume()
    await scenario.waitFor(() => !lease.dialogue.loading)

    expect(lease.dialogue.history.items).toEqual([])
    expect(scenario.backend.connections(chat.id)).toBe(0)
  })

  it('refreshes an unloaded resource without acquiring a live subscription', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    await scenario.backend.stream(chat, 'Saved reply')
    const resource = scenario.engine.get(chat.id)
    await resource.refresh()

    expect(resource.ready).toBe(true)
    expect(resource.history.items[0].text).toBe('Saved reply')
    expect(scenario.backend.connections(chat.id)).toBe(0)
  })

  it('does not apply a snapshot that completes after disposal', async () => {
    scenario = dialogueScenario()
    const chat = scenario.backend.dialogue('Planning')
    await scenario.backend.stream(chat, 'Saved reply')
    const history = scenario.backend.requests.history.holdNext()
    const lease = scenario.engine.open(chat.id)
    const outcome = lease.ready.catch(() => undefined)
    await history.received()
    scenario.engine.dispose()
    await history.resume()
    await outcome
    await scenario.waitFor(() => !lease.dialogue.loading)

    expect(lease.dialogue.ready).toBe(false)
    expect(lease.dialogue.history.items).toEqual([])
  })
})
