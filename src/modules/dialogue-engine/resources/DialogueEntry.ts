import type { DialogueItemModel } from '../state/DialogueItemModel'
import { readonlyValue } from './readonly-value'

export class DialogueEntry {
  constructor(private readonly item: DialogueItemModel) {
    Object.freeze(this)
  }

  public get id() {
    return this.item.id
  }

  public get dialogueId() {
    return this.item.data.dialogueId
  }

  public get turnId() {
    return this.item.data.turnId ?? ''
  }

  public get text() {
    return this.item.text
  }

  public get source() {
    return this.item.data.source
  }

  public get kind() {
    return this.item.data.kind
  }

  public get status() {
    return this.item.data.status
  }

  public get historical() {
    return this.item.data.historical
  }

  public get payload() {
    return readonlyValue(this.item.data.payload)
  }
}
