import { makeAutoObservable, observable } from 'mobx'
import type { DialogueSummary } from '../contracts/dialogue.types'
import type { DialogueCommandStorage } from '../contracts/command-storage.types'
import { DialogueModel } from './DialogueModel'

export class DialogueStore {
  public readonly dialogues = observable.map<string, DialogueModel>()
  public listIds: string[] = []
  public listAfter?: string
  public hasMore = false

  public constructor(public readonly commands: DialogueCommandStorage) {
    makeAutoObservable(this, { dialogues: false }, { autoBind: true })
  }

  public get listed() {
    return this.listIds
      .flatMap((id) => {
        const model = this.dialogues.get(id)

        return model ? [model] : []
      })
      .sort((a, b) => b.summary.updatedAt.localeCompare(a.summary.updatedAt) || a.id.localeCompare(b.id))
  }

  public upsert(summary: DialogueSummary): DialogueModel {
    let model = this.dialogues.get(summary.id)

    if (model) {
      model.applySummary(summary)
    } else {
      model = new DialogueModel(summary)
      model.pendingMessage = this.commands.message(summary.id)
      this.dialogues.set(summary.id, model)
    }

    return model
  }

  public require(id: string): DialogueModel {
    const model = this.dialogues.get(id)

    if (!model) throw new Error('Open the dialogue first.')

    return model
  }

  public include(summary: DialogueSummary): DialogueModel {
    const model = this.upsert(summary)

    if (!this.listIds.includes(summary.id)) {
      this.listIds.push(summary.id)
    }

    return model
  }
}
