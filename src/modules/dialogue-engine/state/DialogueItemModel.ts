import { makeAutoObservable, observable } from 'mobx'
import type { DialogueItem } from '../contracts/dialogue.types'
import { compareSequence } from '../state/sequence'

export class DialogueItemModel {
  public readonly sequence: string

  public constructor(public data: DialogueItem) {
    this.sequence = data.sequence
    makeAutoObservable(this, { data: observable.ref }, { autoBind: true })
  }

  public get id() {
    return this.data.id
  }

  public get text() {
    return this.data.text
  }

  public upsert(item: DialogueItem): void {
    if (compareSequence(item.version, this.data.version) > 0) {
      this.data = item
    }
  }

  public append(text: string, version: string): void {
    this.data = { ...this.data, text: this.data.text + text, version }
  }
}
