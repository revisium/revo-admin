import type { DialogueCommandStorage, PendingResponse } from '../../contracts/command-storage.types'
import type { PendingMessage } from '../../contracts/dialogue.types'

export class MemoryCommandStorage implements DialogueCommandStorage {
  private readonly messages = new Map<string, PendingMessage>()

  private readonly responses = new Map<string, PendingResponse>()

  public message(id: string): PendingMessage | undefined {
    return this.messages.get(id)
  }

  public response(id: string): PendingResponse | undefined {
    return this.responses.get(id)
  }

  public saveMessage(id: string, value?: PendingMessage): void {
    if (value) {
      this.messages.set(id, value)
    } else {
      this.messages.delete(id)
    }
  }

  public saveResponse(id: string, value?: PendingResponse): void {
    if (value) {
      this.responses.set(id, value)
    } else {
      this.responses.delete(id)
    }
  }
}
