import type { PendingMessage } from '../contracts/dialogue.types'
import type { PendingResponse, DialogueCommandStorage as CommandStorage } from '../contracts/command-storage.types'
import type { KeyValueStorage } from './storage.types'

export class PersistentCommandStorage implements CommandStorage {
  private readonly memory = new Map<string, string>()
  public constructor(private readonly storage: () => KeyValueStorage | undefined = () => undefined) {}

  public message(id: string): PendingMessage | undefined {
    const value = this.read(`message:${id}`)

    if (!value || typeof value.commandId !== 'string' || typeof value.prompt !== 'string') return undefined

    return { commandId: value.commandId, prompt: value.prompt }
  }

  public response(id: string): PendingResponse | undefined {
    const value = this.read(`response:${id}`)

    if (!value || typeof value.commandId !== 'string' || !('response' in value)) return undefined

    return { commandId: value.commandId, response: value.response }
  }

  public saveMessage(id: string, value?: PendingMessage): void {
    this.write(`message:${id}`, value)
  }

  public saveResponse(id: string, value?: PendingResponse): void {
    this.write(`response:${id}`, value)
  }

  private read(key: string): Record<string, unknown> | undefined {
    try {
      const raw = this.memory.get(key) ?? this.storage()?.getItem(`revo:${key}`)
      const value: unknown = raw ? JSON.parse(raw) : undefined

      if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>
    } catch {
      return undefined
    }

    return undefined
  }

  private write(key: string, value: unknown): void {
    const serialized = value === undefined ? undefined : JSON.stringify(value)

    if (serialized) this.memory.set(key, serialized)
    else this.memory.delete(key)

    try {
      const storage = this.storage()

      if (serialized) storage?.setItem(`revo:${key}`, serialized)
      else storage?.removeItem(`revo:${key}`)
    } catch {
      // Keep retry identity in memory when browser storage is unavailable.
    }
  }
}
