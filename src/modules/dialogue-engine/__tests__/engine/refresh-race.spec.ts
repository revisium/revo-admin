import { afterEach, expect, it } from 'vitest'
import { dialogueScenario, type DialogueScenario } from '../support/DialogueScenario'

let scenario: DialogueScenario | undefined

afterEach(() => scenario?.dispose())

it('does not overwrite a newer interaction update with an older refresh response', async () => {
  scenario = dialogueScenario()
  const chat = scenario.backend.dialogue('Planning')
  const lease = await scenario.user.open(chat)
  const staleRequest = scenario.backend.requests.interactions.holdNext()

  const refresh = lease.dialogue.refresh()
  await staleRequest.received()
  scenario.backend.question(chat)
  await scenario.backend.updateSummary(chat, { status: 'WAITING', version: '1', pendingCount: 1 })

  expect(lease.dialogue.pendingInteractions).toHaveLength(1)

  await staleRequest.respond({ items: [], next: undefined, total: 0, snapshot: 'event-0' })
  await refresh

  expect(lease.dialogue.pendingInteractions).toHaveLength(1)
})
