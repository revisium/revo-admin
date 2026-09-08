import { makeAutoObservable } from 'mobx'
import { nanoid } from 'nanoid'
import type { DialogueBackend } from '../contracts/backend.types'
import type { DialogueCommandStorage, PendingResponse } from '../contracts/command-storage.types'
import type { PendingMessage } from '../contracts/dialogue.types'
import type { DialogueStore } from '../state/DialogueStore'
import type { DialogueModel } from '../state/DialogueModel'

export class DialogueCommands {
  private readonly deliveries = new Map<string, Promise<void>>()

  public constructor(
    private readonly backend: DialogueBackend,
    private readonly store: DialogueStore,
    private readonly commands: DialogueCommandStorage,
    private readonly reloadRelated: (id: string) => Promise<void>,
  ) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public isSending(id: string): boolean {
    return this.deliveries.has(`send:${id}`)
  }

  public isResponding(id: string): boolean {
    return this.deliveries.has(`respond:${id}`)
  }

  public send(id: string, prompt: string): Promise<void> {
    return this.deliverOnce(`send:${id}`, () => this.deliverMessage(id, prompt))
  }

  private async deliverMessage(id: string, prompt: string): Promise<void> {
    const model = this.store.require(id)
    const command = this.prepareMessage(model, prompt)

    this.rememberMessage(model, command)
    await this.backend.send({ dialogueId: id, ...command })
    this.completeMessage(model)
  }

  private prepareMessage(model: DialogueModel, prompt: string): PendingMessage {
    const command = model.pendingMessage ?? { commandId: nanoid(), prompt: prompt.trim() }

    if (!command.prompt) {
      throw new Error('A message is required.')
    }

    if (!model.canSend && !model.pendingMessage) {
      throw new Error('The dialogue is not ready for another message.')
    }

    return command
  }

  private rememberMessage(model: DialogueModel, command: PendingMessage): void {
    model.pendingMessage = command
    this.commands.saveMessage(model.id, command)
  }

  private completeMessage(model: DialogueModel): void {
    this.commands.saveMessage(model.id)
    model.pendingMessage = undefined
  }

  public respond(id: string, interactionId: string, response: unknown): Promise<void> {
    return this.deliverOnce(`respond:${interactionId}`, () => this.deliverResponse(id, interactionId, response))
  }

  private async deliverResponse(id: string, interactionId: string, response: unknown): Promise<void> {
    const model = this.store.require(id)
    const command = this.prepareResponse(model, interactionId, response)

    this.commands.saveResponse(interactionId, command)
    await this.backend.respond({ dialogueId: id, interactionId, ...command })
    this.commands.saveResponse(interactionId)
    await this.reloadRelated(model.id)
  }

  private prepareResponse(model: DialogueModel, interactionId: string, response: unknown): PendingResponse {
    const interaction = model.interactions.find((item) => item.id === interactionId)
    const pending = this.commands.response(interactionId)
    const acceptsResponse = interaction && ['PENDING', 'RESPONDING'].includes(interaction.status)

    if (!interaction || (!pending && !acceptsResponse)) {
      throw new Error('This interaction is no longer active.')
    }

    return pending ?? { commandId: nanoid(), response }
  }

  public pendingResponse(id: string) {
    return this.commands.response(id)?.response
  }

  private deliverOnce(key: string, deliver: () => Promise<void>): Promise<void> {
    const pending = this.deliveries.get(key)

    if (pending) {
      return pending
    }

    const result = Promise.resolve()
      .then(deliver)
      .finally(() => this.deliveries.delete(key))
    this.deliveries.set(key, result)

    return result
  }

  public async cancel(id: string): Promise<void> {
    const model = this.store.require(id)
    const turnId = model.summary.activeTurnId

    if (!turnId || !model.busy || model.cancelRequested) {
      return
    }

    await this.backend.cancel(id, turnId)
    await this.reloadRelated(model.id)
  }

  public async reopen(id: string): Promise<void> {
    if (!this.store.require(id).canReopen) {
      return
    }

    const result = await this.backend.reopen(id)
    this.store.upsert(result)
  }

  public async fork(id: string, turnId: string): Promise<DialogueModel> {
    const model = this.store.require(id)

    if (!model.completedTurns.some((turn) => turn.id === turnId)) {
      throw new Error('Choose a completed turn.')
    }

    const result = await this.backend.fork(id, turnId, `${model.summary.title} · fork`)

    return this.store.include(result)
  }
}
