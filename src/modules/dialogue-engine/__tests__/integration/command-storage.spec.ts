// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { PersistentCommandStorage } from '../..'

afterEach(() => {
  sessionStorage.clear()
})

describe('Durable browser retry identity', () => {
  it('restores message and response commands in a fresh service instance', () => {
    const storage = new PersistentCommandStorage(() => sessionStorage)
    const message = { commandId: 'same-message', prompt: 'Original prompt' }
    const response = { commandId: 'same-response', response: { kind: 'permission', outcome: 'denied' } }
    storage.saveMessage('chat', message)
    storage.saveResponse('interaction', response)
    const restored = new PersistentCommandStorage(() => sessionStorage)

    expect(restored.message('chat')).toEqual(message)
    expect(restored.response('interaction')).toEqual(response)
  })

  it('removes acknowledged commands from durable storage', () => {
    const storage = new PersistentCommandStorage(() => sessionStorage)
    storage.saveMessage('chat', { commandId: 'message', prompt: 'Original' })
    storage.saveResponse('interaction', { commandId: 'response', response: { answer: 'Yes' } })

    storage.saveMessage('chat')
    storage.saveResponse('interaction')

    const restored = new PersistentCommandStorage(() => sessionStorage)
    expect(restored.message('chat')).toBeUndefined()
    expect(restored.response('interaction')).toBeUndefined()
  })

  it('continues with in-memory retry identity when session storage is denied', () => {
    const storage = new PersistentCommandStorage(() => {
      throw new Error('Storage denied')
    })
    storage.saveMessage('chat', { commandId: 'stable', prompt: 'Hello' })

    expect(storage.message('chat')?.commandId).toBe('stable')
  })
})
