import type { PendingMessage } from './dialogue.types'

export interface PendingResponse {
  readonly commandId: string
  readonly response: unknown
}

export interface DialogueCommandStorage {
  message(id: string): PendingMessage | undefined
  response(id: string): PendingResponse | undefined
  saveMessage(id: string, value?: PendingMessage): void
  saveResponse(id: string, value?: PendingResponse): void
}
