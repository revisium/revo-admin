import { runInAction } from 'mobx'
import type { DialogueBackend, HistoryPage } from '../contracts/backend.types'
import type { DialogueStore } from '../state/DialogueStore'
import type { DialogueModel } from '../state/DialogueModel'
import type { DialogueChange, DialogueTurn, DialogueInteraction } from '../contracts/dialogue.types'
import type { Page } from '../contracts/page.types'
import { DialogueProjection } from '../projection/DialogueProjection'
import { newerSequence } from '../state/sequence'

export class DialogueSynchronization {
  private readonly projection: DialogueProjection
  private readonly relatedGenerations = new Map<string, number>()

  public constructor(
    private readonly backend: DialogueBackend,
    private readonly store: DialogueStore,
  ) {
    this.projection = new DialogueProjection(backend, store)
  }

  public async list(after: string | undefined, signal: AbortSignal): Promise<string> {
    const page = await this.backend.list(after, signal)
    signal.throwIfAborted()
    runInAction(() => {
      page.items.forEach((summary) => this.store.include(summary))
      this.store.listAfter = page.next
      this.store.hasMore = Boolean(page.next)
    })

    return page.snapshot
  }

  public async snapshot(id: string, signal: AbortSignal): Promise<string> {
    const [summary, history, related] = await Promise.all([
      this.backend.details(id, signal),
      this.backend.history(id, undefined, signal),
      this.readRelated(id, signal),
    ])
    signal.throwIfAborted()
    runInAction(() => {
      const model = this.store.upsert(summary)
      this.applyHistory(model, history)
      this.applyRelated(model, related)
    })

    return history.snapshot
  }

  public async loadMore(id: string, signal: AbortSignal): Promise<void> {
    const model = this.store.require(id)

    if (!model.hasMoreHistory) return

    const page = await this.backend.history(id, model.historyAfter, signal)
    signal.throwIfAborted()
    runInAction(() => this.applyHistory(model, page))
  }

  public async apply(change: DialogueChange, signal: AbortSignal): Promise<string> {
    signal.throwIfAborted()
    await this.projection.apply(change, signal)

    if (change.kind === 'SUMMARY_UPDATED' || change.itemKind === 'INTERACTION' || change.itemKind === 'RESULT') {
      await this.loadRelated(change.dialogueId, signal)
    }

    return change.cursor
  }

  public async applySummary(change: DialogueChange, signal: AbortSignal): Promise<string> {
    await this.projection.apply(change, signal)

    return change.cursor
  }

  public async loadRelated(id: string, signal: AbortSignal): Promise<void> {
    const related = await this.readRelated(id, signal)
    signal.throwIfAborted()

    const model = this.store.dialogues.get(id)

    if (model) runInAction(() => this.applyRelated(model, related))
  }

  private async readRelated(id: string, signal: AbortSignal) {
    const generation = (this.relatedGenerations.get(id) ?? 0) + 1
    this.relatedGenerations.set(id, generation)
    const [turns, interactions] = await Promise.all([
      this.allPages((after) => this.backend.turns(id, after, signal), signal),
      this.allPages((after) => this.backend.interactions(id, after, signal), signal),
    ])

    return { turns, interactions, generation }
  }

  private async allPages<T>(read: (after?: string) => Promise<Page<T>>, signal: AbortSignal): Promise<T[]> {
    const items: T[] = []
    let after: string | undefined

    do {
      signal.throwIfAborted()
      const page = await read(after)
      items.push(...page.items)
      after = page.next
    } while (after)

    return items
  }

  private applyHistory(model: DialogueModel, page: HistoryPage): void {
    page.items.forEach((item) => model.applyItem(item))
    model.historyAfter = page.next
    model.hasMoreHistory = Boolean(page.next)
    model.observedSequence = newerSequence(model.observedSequence, page.observed)
    model.historyLoaded = true
  }

  private applyRelated(
    model: DialogueModel,
    related: { turns: DialogueTurn[]; interactions: DialogueInteraction[]; generation: number },
  ): void {
    if (this.relatedGenerations.get(model.id) !== related.generation) return

    model.turns = related.turns
    model.interactions = related.interactions
  }
}
