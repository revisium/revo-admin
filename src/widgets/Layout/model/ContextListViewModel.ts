import { makeAutoObservable } from 'mobx'
import { INBOX_ITEMS, TASK_RUNS } from 'src/shared/fixtures'
import { routes } from 'src/shared/config'
import { container } from 'src/shared/lib'

interface ContextListItem {
  readonly to: string
  readonly title: string
  readonly meta?: string
}

interface ContextListAction {
  readonly label: string
  readonly to: string
}

interface ContextListContent {
  readonly title: string
  readonly overviewAction?: ContextListAction
  readonly createAction?: ContextListAction
  readonly items: readonly ContextListItem[]
}

export class ContextListViewModel {
  public constructor() {
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
        overviewAction: { label: 'All', to: routes.runs() },
        createAction: { label: 'New run', to: routes.runCreate() },
        items: TASK_RUNS.map((run) => ({
          to: routes.run(run.id),
          title: run.title,
          meta: `${run.status.replaceAll('_', ' ')} · ${run.progress.done}/${run.progress.total} steps`,
        })),
      }
    if (section === 'inbox')
      return {
        title: 'Inbox',
        items: INBOX_ITEMS.filter((item) => item.status === 'pending').map((item) => ({
          to: routes.inboxItem(item.id),
          title: item.title,
        })),
      }
    return undefined
  }
}

container.register(
  ContextListViewModel,
  () => {
    return new ContextListViewModel()
  },
  { scope: 'singleton' },
)
