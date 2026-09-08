import { expect, vi } from 'vitest'
import { DialogueEngine } from '../../engine/DialogueEngine'
import { MemoryCommandStorage } from './MemoryCommandStorage'
import type { DialogueSummary } from '../../contracts/dialogue.types'
import { ControlledDialogueBackend } from './ControlledDialogueBackend'

const RECONNECT_ADVANCE_MS = 1600

export const dialogueScenario = () => {
  vi.useFakeTimers()
  const backend = new ControlledDialogueBackend()
  const engine = new DialogueEngine(backend, new MemoryCommandStorage())
  const cleanups: (() => void)[] = []
  const leases: ReturnType<DialogueEngine['open']>[] = []

  return {
    backend,
    engine,
    own<T>(resource: T, dispose: (resource: T) => void): T {
      cleanups.push(() => dispose(resource))

      return resource
    },
    async waitFor(predicate: () => boolean): Promise<void> {
      await vi.waitFor(() => expect(predicate()).toBe(true))
    },
    user: {
      async open(chat: DialogueSummary) {
        const lease = engine.open(chat.id)
        leases.push(lease)
        await lease.ready
        await vi.advanceTimersByTimeAsync(0)

        return lease
      },
      retry(chat: DialogueSummary) {
        return engine.get(chat.id).retrySend()
      },
      send(chat: DialogueSummary, text: string) {
        return engine.get(chat.id).send(text)
      },
    },
    network: {
      disconnect(chat: DialogueSummary) {
        backend.disconnect(chat.id)
      },
      async reconnect() {
        await vi.advanceTimersByTimeAsync(RECONNECT_ADVANCE_MS)
      },
    },
    expect: {
      async answer(chat: DialogueSummary, text: string) {
        await vi.advanceTimersByTimeAsync(0)
        expect(engine.get(chat.id).history.items.map((item) => item.text)).toEqual([text])
      },
    },
    dispose() {
      cleanups.reverse().forEach((dispose) => dispose())
      leases.forEach((lease) => lease.release())
      engine.dispose()
      vi.restoreAllMocks()
      vi.useRealTimers()
    },
  }
}
export type DialogueScenario = ReturnType<typeof dialogueScenario>
