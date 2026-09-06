import { makeAutoObservable } from 'mobx'
import { DiscussionStore } from 'src/entities/discussion'
import { INBOX_ITEMS, TASK_RUNS } from 'src/shared/fixtures'
import { routes } from 'src/shared/config'
import { container } from 'src/shared/lib'

interface ContextListItem {
  readonly to: string
  readonly title: string
  readonly meta?: string
}

interface ContextListContent {
  readonly title: string
  readonly overview: string
  readonly showOverviewAction: boolean
  readonly create?: string
  readonly createLabel?: string
  readonly items: readonly ContextListItem[]
}

export class ContextListViewModel {
  public constructor(private readonly discussions: DiscussionStore) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public section(pathname: string): string {
    return pathname.split('/')[1] ?? ''
  }
  public content(pathname: string): ContextListContent | undefined {
    const section = this.section(pathname)
    if (section === 'runs')
      return {
        title: 'Runs',
        overview: routes.runs(),
        showOverviewAction: true,
        create: routes.runCreate(),
        createLabel: 'New run',
        items: TASK_RUNS.map((run) => ({
          to: routes.run(run.id),
          title: run.title,
          meta: `${run.status.replaceAll('_', ' ')} · ${run.progress.done}/${run.progress.total} steps`,
        })),
      }
    if (section === 'inbox')
      return {
        title: 'Inbox',
        overview: routes.inbox(),
        showOverviewAction: false,
        items: INBOX_ITEMS.filter((item) => item.status === 'pending').map((item) => ({
          to: routes.inboxItem(item.id),
          title: item.title,
        })),
      }
    if (section === 'assistant')
      return {
        title: 'Chats',
        overview: routes.assistant(),
        showOverviewAction: false,
        create: routes.assistant(),
        createLabel: 'New chat',
        items: this.discussions.chats.map((chat) => ({
          to: routes.chat(chat.id),
          title: chat.title,
          meta: chat.category,
        })),
      }
    return undefined
  }

  public visible(pathname: string): readonly ContextListItem[] {
    return this.content(pathname)?.items ?? []
  }
}

container.register(
  ContextListViewModel,
  () => {
    const discussions = container.get(DiscussionStore)
    return new ContextListViewModel(discussions)
  },
  { scope: 'singleton' },
)
