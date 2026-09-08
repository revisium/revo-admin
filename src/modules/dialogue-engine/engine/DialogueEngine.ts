import type { DialogueBackend } from '../contracts/backend.types'
import type { DialogueCommandStorage } from '../contracts/command-storage.types'
import type { DialogueView, DialogueLease, DialogueListView } from '../contracts/public.types'
import { DialogueResource } from '../resources/DialogueResource'
import { DialogueList } from '../resources/DialogueList'
import { DialogueStore } from '../state/DialogueStore'
import { DialogueCommands } from '../commands/DialogueCommands'
import { DialogueReadReceipts } from '../commands/DialogueReadReceipts'
import { DialogueDraft } from '../commands/DialogueDraft'
import { AgentSelectionModel } from '../configuration/AgentSelectionModel'
import { DialogueSynchronization } from '../synchronization/DialogueSynchronization'
import { DialogueLifecycle } from '../lifecycle/DialogueLifecycle'

export class DialogueEngine {
  private readonly resources = new Map<string, DialogueResource>()
  private readonly store: DialogueStore
  private readonly lifecycle: DialogueLifecycle
  private readonly commands: DialogueCommands
  private readonly receipts: DialogueReadReceipts
  public readonly list: DialogueListView

  public constructor(
    private readonly backend: DialogueBackend,
    storage: DialogueCommandStorage,
  ) {
    this.store = new DialogueStore(storage)
    const synchronization = new DialogueSynchronization(backend, this.store)
    this.lifecycle = new DialogueLifecycle(backend, this.store, synchronization)
    this.commands = new DialogueCommands(backend, this.store, storage, (id) => this.lifecycle.loadRelated(id))
    this.receipts = new DialogueReadReceipts(backend, this.store)
    this.list = new DialogueList(this.store, this.lifecycle, (id) => this.get(id))
  }

  public start(): void {
    this.lifecycle.start()
  }

  public dispose(): void {
    this.lifecycle.dispose()
  }

  public get(id: string): DialogueView {
    let resource = this.resources.get(id)

    if (!resource) {
      resource = new DialogueResource(id, this.store, this.lifecycle, this.commands, this.receipts)
      this.resources.set(id, resource)
    }

    return resource
  }

  public open(id: string): DialogueLease {
    return Object.freeze({ dialogue: this.get(id), ...this.lifecycle.open(id) })
  }

  public createAgentSelection() {
    return new AgentSelectionModel(this.backend)
  }

  public createDraft() {
    return new DialogueDraft(this.backend, this.store, this.commands)
  }
}
