import { reaction, type IReactionDisposer } from 'mobx'
import type { DialogueStore } from '../state/DialogueStore'
import type { DialogueReadReceipts } from '../commands/DialogueReadReceipts'
import type { DialogueLifecycle } from './DialogueLifecycle'

interface AutoReadTrigger {
  readonly unread: boolean
  readonly revision: string
}

interface AutoReadPolicy {
  readonly id: string
  enabled: boolean
  pendingRevision?: string
  failedRevision?: string
  inFlight?: Promise<void>
  disposer?: IReactionDisposer
}

export class DialogueAutoReadCoordinator {
  private readonly policies = new Map<string, AutoReadPolicy>()

  public constructor(
    private readonly store: DialogueStore,
    private readonly lifecycle: DialogueLifecycle,
    private readonly receipts: DialogueReadReceipts,
  ) {}

  public set(id: string, enabled: boolean): void {
    const current = this.policies.get(id)

    if (current?.enabled === enabled) return

    if (!enabled) {
      if (current) this.disable(current)

      return
    }

    const policy: AutoReadPolicy = { id, enabled: true }
    this.policies.set(id, policy)
    policy.disposer = reaction(
      () => {
        const model = this.store.dialogues.get(id)

        return model ? { unread: model.unread, revision: model.summary.version } : undefined
      },
      (trigger) => {
        if (trigger) this.enqueue(policy, trigger)
      },
      {
        fireImmediately: true,
        equals: (left, right) => left?.unread === right?.unread && left?.revision === right?.revision,
      },
    )
  }

  public dispose(): void {
    this.policies.forEach((policy) => this.disable(policy))
    this.policies.clear()
  }

  private enqueue(policy: AutoReadPolicy, trigger: AutoReadTrigger): void {
    if (!this.isCurrent(policy) || !trigger.unread || trigger.revision === policy.failedRevision) return

    policy.pendingRevision = trigger.revision
    this.start(policy)
  }

  private start(policy: AutoReadPolicy): void {
    if (policy.inFlight) return

    policy.inFlight = this.drain(policy).finally(() => {
      if (!this.isCurrent(policy)) return

      policy.inFlight = undefined
      if (policy.pendingRevision !== undefined) this.start(policy)
    })
  }

  private async drain(policy: AutoReadPolicy): Promise<void> {
    while (policy.pendingRevision !== undefined) {
      const revision = policy.pendingRevision
      policy.pendingRevision = undefined

      if (!this.isCurrent(policy) || revision === policy.failedRevision) return

      try {
        await this.lifecycle.refresh(policy.id)

        if (!this.isCurrent(policy) || !this.store.dialogues.get(policy.id)?.unread) continue

        await this.receipts.markRead(policy.id)
      } catch {
        if (!this.isCurrent(policy)) return

        policy.failedRevision = revision
        continue
      }

      if (!this.isCurrent(policy)) return
    }
  }

  private isCurrent(policy: AutoReadPolicy): boolean {
    return policy.enabled && this.policies.get(policy.id) === policy
  }

  private disable(policy: AutoReadPolicy): void {
    policy.enabled = false
    policy.pendingRevision = undefined
    policy.disposer?.()
    policy.disposer = undefined

    if (this.policies.get(policy.id) === policy) this.policies.delete(policy.id)
  }
}
