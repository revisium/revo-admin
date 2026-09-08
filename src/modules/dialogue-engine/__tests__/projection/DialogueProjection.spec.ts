import { afterEach, describe, expect, it, vi } from 'vitest'
import { autorun } from 'mobx'
import { DialogueStore } from '../../state/DialogueStore'
import { ControlledDialogueBackend } from '../support/ControlledDialogueBackend'
import { dialogueSummary, dialogueItem } from '../support/dialogue-fixtures'
import { MemoryCommandStorage } from '../support/MemoryCommandStorage'
import { DialogueProjection } from '../../projection/DialogueProjection'

import type { DialogueChange } from '../../contracts/dialogue.types'

const summary = dialogueSummary('dialogue-a', 'Persistent discussion', {
  version: '9007199254740993',
  significantSequence: '7',
  unreadCount: 1,
})
const item = dialogueItem(summary, 'answer', 'A', {
  sequence: '2',
  status: 'STREAMING',
  version: '9007199254740993',
})
const change: DialogueChange = {
  cursor: 'sse-2',
  dialogueId: summary.id,
  kind: 'HISTORY_TEXT_APPENDED',
  itemId: item.id,
  baseItemVersion: item.version,
  itemVersion: '9007199254740994',
  textDelta: 'B',
}
const setup = () => {
  const api = new ControlledDialogueBackend()
  const store = new DialogueStore(new MemoryCommandStorage())
  const model = store.include(summary)
  model.applyItem(item)

  return { api, store, model, projection: new DialogueProjection(api, store) }
}
const cleanups: (() => void)[] = []

afterEach(() => {
  cleanups.splice(0).forEach((dispose) => dispose())
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('Dialogue projection', () => {
  it('applies a delta exactly once without rebuilding the ordered list on token changes', async () => {
    const { model, projection } = setup()
    const observe = vi.fn(() => model.orderedItems)
    const dispose = autorun(observe)
    cleanups.push(dispose)
    await projection.apply(change)
    await projection.apply(change)

    expect(model.items.get(item.id)?.text).toBe('AB')
    expect(observe).toHaveBeenCalledOnce()
  })

  it('repairs a missing base version and rejects older full records', async () => {
    const { api, model, projection } = setup()
    const repaired = { ...item, text: 'Full recovered response', version: '9007199254741000' }
    api.requests.item.respondNext(repaired)
    await projection.apply({ ...change, baseItemVersion: '9007199254740995', itemVersion: '9007199254740996' })
    await projection.apply({ ...change, item: { ...item, text: 'Stale' } })

    expect(api.requests.item.calls).toHaveLength(1)
    expect(model.items.get(item.id)?.text).toBe(repaired.text)
  })

  it('does not regress a newer sidebar summary with an older detail snapshot', () => {
    const { store, model } = setup()
    store.upsert({ ...summary, version: '9007199254740994', status: 'RUNNING' })
    store.upsert(summary)

    expect(store.listed[0]).toBe(model)
    expect(model.busy).toBe(true)
  })
})
