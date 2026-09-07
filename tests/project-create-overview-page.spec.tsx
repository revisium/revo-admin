/* @vitest-environment jsdom */

import { readFileSync } from 'node:fs'
import { ChakraProvider } from '@chakra-ui/react'
import { act, StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
  createMemoryRouter,
  Link,
  MemoryRouter,
  Route,
  RouterProvider,
  Routes,
  type InitialEntry,
  useLocation,
  useNavigate,
} from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type Project, ProjectService } from 'src/entities/project'
import { ProjectCreateViewModel } from 'src/features/ProjectCreateForm'
import { ProjectCreatePage } from 'src/pages/project-create'
import { ProjectLayoutViewModel } from 'src/widgets/ProjectLayout'
import { ProjectSettingsViewModel } from 'src/pages/project-settings'
import { ProjectListViewModel, ProjectsPage } from 'src/pages/projects'
import ProjectDetail from 'src/routes/ProjectDetail'
import ProjectOverview from 'src/routes/ProjectOverview'
import ProjectSettings from 'src/routes/ProjectSettings'
import routes from 'src/routes'
import { container } from 'src/shared/lib'
import { routePaths, routes as routeBuilders } from 'src/shared/config'
import { ConfirmDialog } from 'src/shared/ui/kit'
import { system } from 'src/shared/ui/theme/theme'
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

type Deferred<T> = {
  readonly promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason: unknown) => void
}

const deferred = <T,>(): Deferred<T> => {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}

const project = (id: string, overrides: Partial<Project> = {}): Project => ({
  id,
  name: `Live ${id}`,
  description: 'Loaded from GraphQL',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

let root: Root | undefined
let host: HTMLDivElement | undefined

const render = async (content: React.ReactNode): Promise<HTMLDivElement> => {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)

  await act(async () => {
    root?.render(<ChakraProvider value={system}>{content}</ChakraProvider>)
  })

  return host
}

const click = async (element: Element): Promise<void> => {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

const clickAndSettleDialogLifecycle = async (element: Element): Promise<void> => {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    await Promise.resolve()
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    await Promise.resolve()
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  })
}

const dispatchLinkClick = async (element: Element, init: MouseEventInit = {}): Promise<MouseEvent> => {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...init })
  await act(async () => {
    element.dispatchEvent(event)
    await Promise.resolve()
  })
  return event
}

const pressKey = async (key: string, shiftKey = false): Promise<void> => {
  await act(async () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true }))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  })
}

const pressOutside = async (outside: Element): Promise<void> => {
  await act(async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  })
}

const flushAnimationFrame = async (): Promise<void> => {
  await act(async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  })
}

const submit = async (form: HTMLFormElement): Promise<void> => {
  await act(async () => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  })
}

const setInputValue = async (input: HTMLInputElement, value: string): Promise<void> => {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  valueSetter?.call(input, value)

  await act(async () => {
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

const setTextareaValue = async (textarea: HTMLTextAreaElement, value: string): Promise<void> => {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
  valueSetter?.call(textarea, value)

  await act(async () => {
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

const currentPath = (): string => host?.querySelector('[data-testid="location"]')?.textContent ?? ''

const LocationProbe = () => {
  const { pathname } = useLocation()

  return <output data-testid="location">{pathname}</output>
}

const RouterBack = () => {
  const navigate = useNavigate()

  return (
    <button data-testid="router-back" onClick={() => navigate(-1)}>
      Router back
    </button>
  )
}

const RouterForward = () => {
  const navigate = useNavigate()

  return (
    <button data-testid="router-forward" onClick={() => navigate(1)}>
      Router forward
    </button>
  )
}

const CreateRoutes = ({
  initialEntries,
  initialIndex,
}: {
  readonly initialEntries: InitialEntry[]
  readonly initialIndex?: number
}) => (
  <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
    <LocationProbe />
    <RouterBack />
    <Link to="/projects" data-testid="leave-create">
      Leave create
    </Link>
    <Routes>
      <Route path="/projects" element={<p>Projects destination</p>} />
      <Route path="/projects/new" element={<ProjectCreatePage />} />
      <Route path="/projects/:projectId" element={<p>Created project route</p>} />
    </Routes>
  </MemoryRouter>
)

const ProjectRoutes = ({ initialEntries }: { readonly initialEntries: InitialEntry[] }) => (
  <MemoryRouter initialEntries={initialEntries}>
    <LocationProbe />
    <Link to="/projects/prj_new" data-testid="open-new-project">
      Open new project
    </Link>
    <Routes>
      <Route path="/projects/:projectId" element={<ProjectDetail />}>
        <Route index element={<ProjectOverview />} />
      </Route>
    </Routes>
  </MemoryRouter>
)

const OverviewHistoryRoutes = ({
  initialEntries,
  initialIndex,
}: {
  readonly initialEntries: InitialEntry[]
  readonly initialIndex?: number
}) => {
  const [router] = useState(() =>
    createMemoryRouter(
      [
        {
          path: '/projects',
          element: (
            <>
              <LocationProbe />
              <RouterForward />
              <p>Projects destination</p>
            </>
          ),
        },
        {
          path: '/projects/:projectId',
          element: (
            <>
              <LocationProbe />
              <RouterBack />
              <ProjectDetail />
            </>
          ),
          children: [{ index: true, element: <ProjectOverview /> }],
        },
      ],
      { initialEntries, initialIndex },
    ),
  )

  return <RouterProvider router={router} />
}

const SettingsProjectRoute = () => (
  <>
    <LocationProbe />
    <Link to="/projects" data-testid="leave-settings">
      Leave settings
    </Link>
    <Link to="/projects/prj_2/settings" data-testid="open-other-settings">
      Open other settings
    </Link>
    <RouterBack />
    <RouterForward />
    <ProjectDetail />
  </>
)

const SettingsRoutes = ({
  initialEntries,
  initialIndex,
}: {
  readonly initialEntries: InitialEntry[]
  readonly initialIndex?: number
}) => {
  const [router] = useState(() =>
    createMemoryRouter(
      [
        {
          path: '/projects',
          element: (
            <>
              <LocationProbe />
              <RouterForward />
              <p>Projects destination</p>
            </>
          ),
        },
        {
          path: '/projects/:projectId',
          element: <SettingsProjectRoute />,
          children: [{ path: 'settings', element: <ProjectSettings /> }],
        },
      ],
      { initialEntries, initialIndex },
    ),
  )

  return <RouterProvider router={router} />
}

const FocusOwnedDialog = () => {
  const [open, setOpen] = useState(false)
  const [focusRequest, setFocusRequest] = useState(0)
  const finalFocusRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (focusRequest > 0) queueMicrotask(() => finalFocusRef.current?.focus())
  }, [focusRequest])

  const closeWithOwnedFocus = () => {
    setOpen(false)
    setFocusRequest((request) => request + 1)
  }

  return (
    <>
      <button data-testid="owned-dialog-trigger" onClick={() => setOpen(true)}>
        Open owned dialog
      </button>
      <button ref={finalFocusRef} data-testid="owned-dialog-final-focus">
        Final focus
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        restoreFocus={false}
        title="Owned focus dialog"
        cancelAction={<button onClick={() => setOpen(false)}>Cancel</button>}
        confirmAction={<button onClick={closeWithOwnedFocus}>Confirm</button>}
      >
        Dialog body
      </ConfirmDialog>
    </>
  )
}

const DefaultRestoreDialog = () => {
  const [open, setOpen] = useState(false)

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      trigger={<button data-testid="default-restore-trigger">Open default restore dialog</button>}
      title="Default restore dialog"
      cancelAction={<button onClick={() => setOpen(false)}>Cancel</button>}
      confirmAction={<button onClick={() => setOpen(false)}>Confirm default close</button>}
    >
      Dialog body
    </ConfirmDialog>
  )
}

const ProjectSectionRoutes = ({ initialEntry = '/projects/prj_1' }: { readonly initialEntry?: InitialEntry }) => {
  const [router] = useState(() =>
    createMemoryRouter(
      [
        {
          path: '/projects/:projectId',
          element: (
            <>
              <LocationProbe />
              <ProjectDetail />
            </>
          ),
          children: [
            { index: true, element: <ProjectOverview /> },
            { path: 'settings', element: <ProjectSettings /> },
          ],
        },
      ],
      { initialEntries: [initialEntry] },
    ),
  )

  return <RouterProvider router={router} />
}

const StrictProjectsCreateRoutes = () => (
  <StrictMode>
    <MemoryRouter initialEntries={['/projects']}>
      <Routes>
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/new" element={<ProjectCreatePage />} />
        <Route path="/projects/:projectId" element={<p>Created project route</p>} />
      </Routes>
    </MemoryRouter>
  </StrictMode>
)

const registerCreateViewModel = (create: ProjectService['create']): ProjectCreateViewModel[] => {
  const models: ProjectCreateViewModel[] = []
  container.register(
    ProjectCreateViewModel,
    () => {
      const model = new ProjectCreateViewModel({ create } as ProjectService)
      models.push(model)
      return model
    },
    { scope: 'transient' },
  )
  return models
}

const registerProjectLayoutViewModel = (get: ProjectService['get']) => {
  container.register(ProjectLayoutViewModel, () => new ProjectLayoutViewModel({ get } as ProjectService), {
    scope: 'transient',
  })
}

const registerSettingsViewModel = (projectService: ProjectService, registerLayout = true) => {
  const models: ProjectSettingsViewModel[] = []
  if (registerLayout) registerProjectLayoutViewModel((projectId) => projectService.get(projectId))
  container.register(
    ProjectSettingsViewModel,
    () => {
      const model = new ProjectSettingsViewModel(projectService)
      models.push(model)
      return model
    },
    { scope: 'transient' },
  )
  return models
}

const registerReadyProjectListViewModel = () => {
  container.register(
    ProjectListViewModel,
    () =>
      ({
        isLoading: false,
        rows: [
          {
            id: 'prj_existing',
            name: 'Existing project',
            description: '',
            href: '/projects/prj_existing',
            status: 'active',
            statusLabel: 'Active',
            updatedLabel: 'Updated today',
          },
        ],
        resultCountLabel: '1 project',
        query: '',
        includeArchived: false,
        isNoResults: false,
        isEmpty: false,
        isLoadingNextPage: false,
        continuationError: null,
        hasNextPage: false,
        hasLoaded: true,
        isRefreshing: false,
        setQuery: vi.fn(),
        setIncludeArchived: vi.fn(),
        loadNextPage: vi.fn(),
        retryNextPage: vi.fn(),
      }) as unknown as ProjectListViewModel,
    { scope: 'transient' },
  )
}

const restoreViewModels = () => {
  container.register(ProjectCreateViewModel, () => new ProjectCreateViewModel(container.get(ProjectService)), {
    scope: 'transient',
  })
  container.register(ProjectLayoutViewModel, () => new ProjectLayoutViewModel(container.get(ProjectService)), {
    scope: 'transient',
  })
  container.register(ProjectListViewModel, () => new ProjectListViewModel(container.get(ProjectService)), {
    scope: 'transient',
  })
  container.register(
    ProjectSettingsViewModel,
    () => {
      const projectService = container.get(ProjectService)
      return new ProjectSettingsViewModel(projectService)
    },
    { scope: 'transient' },
  )
}

afterEach(async () => {
  await act(async () => {
    root?.unmount()
    await Promise.resolve()
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
  })
  host?.remove()
  root = undefined
  host = undefined
  restoreViewModels()
})

describe('ConfirmDialog focus ownership', () => {
  it('restores the original trigger by default when no caller-owned focus target is provided', async () => {
    const page = await render(<DefaultRestoreDialog />)
    const trigger = page.querySelector('[data-testid="default-restore-trigger"]') as HTMLButtonElement

    await clickAndSettleDialogLifecycle(trigger)
    const confirm = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent === 'Confirm default close',
    ) as HTMLButtonElement
    await clickAndSettleDialogLifecycle(confirm)

    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('lets a navigation dialog use one final-focus owner without a delayed restore race', async () => {
    const page = await render(<FocusOwnedDialog />)
    const trigger = page.querySelector('[data-testid="owned-dialog-trigger"]') as HTMLButtonElement
    const finalFocus = page.querySelector('[data-testid="owned-dialog-final-focus"]') as HTMLButtonElement

    await act(async () => trigger.focus())
    await clickAndSettleDialogLifecycle(trigger)
    const confirm = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent === 'Confirm',
    ) as HTMLButtonElement
    await clickAndSettleDialogLifecycle(confirm)

    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(finalFocus)
  })
})

describe('Project create and Overview page boundaries', () => {
  it('shares one loading message component between the empty and persistent project shells', () => {
    const source = readFileSync('src/widgets/ProjectLayout/ui/ProjectLayout.tsx', 'utf8')

    expect(source.match(/Loading project…/g)).toHaveLength(1)
    expect(source.match(/aria-live="polite"/g)).toHaveLength(1)
    expect(source.match(/<ProjectLoadingMessage \/>/g)).toHaveLength(2)
    expect(source).not.toContain('LoadingProjectContent')
  })

  it('matches the active Settings section through the canonical route template', () => {
    const source = readFileSync('src/widgets/ProjectLayout/ui/ProjectLayout.tsx', 'utf8')

    expect(source).toContain('useMatch(routePaths.projectSettings)')
    expect(source).not.toContain("useMatch('/projects/:projectId/settings')")
  })

  it('loads the Project layout only from the route ID without a navigation snapshot', () => {
    const routeAdapter = readFileSync('src/routes/ProjectDetail.tsx', 'utf8')
    const projectLayout = readFileSync('src/widgets/ProjectLayout/ui/ProjectLayout.tsx', 'utf8')
    const projectLayoutViewModel = readFileSync('src/widgets/ProjectLayout/model/ProjectLayoutViewModel.ts', 'utf8')

    expect(routeAdapter).not.toContain('useLocation')
    expect(routeAdapter).not.toContain('projectFromNavigationState')
    expect(routeAdapter).not.toContain('initialProject')
    expect(projectLayout).not.toContain('initialProject')
    expect(projectLayoutViewModel).not.toContain('initialProject')
  })

  it('survives StrictMode replay after navigating through the rendered Projects create action', async () => {
    const create = vi.fn().mockResolvedValue('prj_created')
    registerCreateViewModel(create)
    registerReadyProjectListViewModel()
    const page = await render(<StrictProjectsCreateRoutes />)

    await click(page.querySelector('a[href="/projects/new"]') as HTMLAnchorElement)
    const name = await vi.waitFor(() => {
      const input = page.querySelector('input') as HTMLInputElement | null
      expect(input).not.toBeNull()
      return input as HTMLInputElement
    })
    await setInputValue(name, 'StrictMode project')
    await submit(page.querySelector('form') as HTMLFormElement)

    await vi.waitFor(() => expect(create).toHaveBeenCalledOnce())
    expect(create).toHaveBeenCalledWith({ name: 'StrictMode project', description: undefined })
  })

  it('loads a StrictMode Overview route with one effective Project read', async () => {
    const get = vi.fn().mockResolvedValue(project('prj_live'))
    registerProjectLayoutViewModel(get)
    const page = await render(
      <StrictMode>
        <ProjectRoutes initialEntries={['/projects/prj_live']} />
      </StrictMode>,
    )

    await vi.waitFor(() => expect(page.querySelector('#project-overview-heading')?.textContent).toBe('Live prj_live'))
    expect(get).toHaveBeenCalledOnce()
    expect(get).toHaveBeenCalledWith('prj_live')
  })

  it('suppresses a late Overview result after the real StrictMode route unmounts', async () => {
    const request = deferred<Project | null>()
    const get = vi.fn().mockReturnValue(request.promise)
    const models: ProjectLayoutViewModel[] = []
    container.register(
      ProjectLayoutViewModel,
      () => {
        const model = new ProjectLayoutViewModel({ get } as unknown as ProjectService)
        models.push(model)
        return model
      },
      { scope: 'transient' },
    )
    const page = await render(
      <StrictMode>
        <ProjectRoutes initialEntries={['/projects/prj_late']} />
      </StrictMode>,
    )

    await vi.waitFor(() => expect(get).toHaveBeenCalledOnce())
    const activeModel = models.find((model) => model.isLoading)
    expect(activeModel).toBeDefined()

    await act(async () => {
      root?.unmount()
      await Promise.resolve()
    })
    const unmountedState = {
      project: activeModel?.project,
      error: activeModel?.error,
      isLoading: activeModel?.isLoading,
      isUnavailable: activeModel?.isUnavailable,
    }
    await act(async () => {
      request.resolve(project('prj_late'))
      await Promise.resolve()
    })

    expect(page.textContent).toBe('')
    expect({
      project: activeModel?.project,
      error: activeModel?.error,
      isLoading: activeModel?.isLoading,
      isUnavailable: activeModel?.isUnavailable,
    }).toEqual(unmountedState)
  })

  it('submits the real form, focuses invalid Name, and preserves its ARIA error linkage', async () => {
    registerCreateViewModel(vi.fn())
    const page = await render(<CreateRoutes initialEntries={['/projects/new']} />)
    const form = page.querySelector('form') as HTMLFormElement
    const name = page.querySelector('input') as HTMLInputElement

    await submit(form)

    await vi.waitFor(() => expect(name.getAttribute('aria-invalid')).toBe('true'))
    const describedBy = name.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy ?? '')?.textContent).toContain('Name is required.')
    expect(document.activeElement).toBe(name)
  })

  it('keeps the rendered Description textarea synchronized through multi-line editing, clearing, and submit', async () => {
    const create = vi.fn().mockResolvedValue('prj_created')
    const models = registerCreateViewModel(create)
    const page = await render(<CreateRoutes initialEntries={['/projects/new']} />)
    const name = page.querySelector('input') as HTMLInputElement
    const description = page.querySelector('textarea') as HTMLTextAreaElement

    await setInputValue(name, 'Description project')
    expect(name.value).toBe('Description project')
    await setTextareaValue(description, 'First line')
    expect(description.value).toBe('First line')

    await setTextareaValue(description, 'First line\nSecond line')
    expect(description.value).toBe('First line\nSecond line')

    await act(async () => {
      models[0]?.description.setValue('Programmatic line\nProgrammatic second line')
    })
    expect(description.value).toBe('Programmatic line\nProgrammatic second line')

    await setTextareaValue(description, '')
    expect(description.value).toBe('')

    await setTextareaValue(description, 'Final line\nSecond final line')
    expect(description.value).toBe('Final line\nSecond final line')
    await submit(page.querySelector('form') as HTMLFormElement)

    await vi.waitFor(() => expect(create).toHaveBeenCalledOnce())
    expect(create).toHaveBeenCalledWith({
      name: 'Description project',
      description: 'Final line\nSecond final line',
    })
  })

  it('always returns to Projects on Cancel regardless of prior history', async () => {
    registerCreateViewModel(vi.fn())
    let page = await render(<CreateRoutes initialEntries={['/runs', '/projects/new']} initialIndex={1} />)

    await click(page.querySelector('button[type="button"]') as HTMLButtonElement)
    expect(currentPath()).toBe('/projects')

    await act(async () => {
      root?.unmount()
    })
    host?.remove()
    root = undefined
    host = undefined

    page = await render(<CreateRoutes initialEntries={['/projects/new']} />)
    await click(page.querySelector('button[type="button"]') as HTMLButtonElement)
    expect(currentPath()).toBe('/projects')
  })

  it('uses the rendered form success callback to replace Create history with the new project route', async () => {
    const create = vi.fn().mockResolvedValue('prj_created')
    registerCreateViewModel(create)
    const page = await render(<CreateRoutes initialEntries={['/projects', '/projects/new']} initialIndex={1} />)
    const name = page.querySelector('input') as HTMLInputElement

    await setInputValue(name, 'Created project')
    await submit(page.querySelector('form') as HTMLFormElement)

    await vi.waitFor(() => expect(currentPath()).toBe('/projects/prj_created'))
    expect(create).toHaveBeenCalledWith({ name: 'Created project', description: undefined })

    await click(page.querySelector('button') as HTMLButtonElement)
    expect(currentPath()).toBe('/projects')
  })

  it('deduplicates actual pending submits and ignores a late result after the page route unmounts', async () => {
    const request = deferred<string>()
    const create = vi.fn().mockReturnValue(request.promise)
    registerCreateViewModel(create)
    const page = await render(<CreateRoutes initialEntries={['/projects/new']} />)
    const name = page.querySelector('input') as HTMLInputElement
    const form = page.querySelector('form') as HTMLFormElement

    await setInputValue(name, 'Late project')
    await submit(form)
    await submit(form)
    await vi.waitFor(() => expect(create).toHaveBeenCalledOnce())

    await click(page.querySelector('[data-testid="leave-create"]') as HTMLAnchorElement)
    expect(currentPath()).toBe('/projects')

    await act(async () => {
      request.resolve('prj_late')
      await Promise.resolve()
    })

    expect(currentPath()).toBe('/projects')
    expect(page.textContent).not.toContain('prj_late')
  })

  it('does not focus invalid Name for an ignored submit or a server failure during creation', async () => {
    const request = deferred<string>()
    registerCreateViewModel(vi.fn().mockReturnValue(request.promise))
    const page = await render(<CreateRoutes initialEntries={['/projects/new']} />)
    const name = page.querySelector('input') as HTMLInputElement
    const description = page.querySelector('textarea') as HTMLTextAreaElement
    const form = page.querySelector('form') as HTMLFormElement

    await setInputValue(name, 'Pending project')
    await submit(form)
    await vi.waitFor(() => expect(page.textContent).toContain('Creating…'))
    await setInputValue(name, '')
    await act(async () => {
      description.focus()
    })

    await submit(form)

    expect(document.activeElement).toBe(description)
    expect(currentPath()).toBe('/projects/new')

    await act(async () => {
      request.reject(new Error('offline'))
      await Promise.resolve()
    })

    await vi.waitFor(() => expect(page.textContent).toContain('offline'))
    expect(document.activeElement).toBe(description)
    expect(currentPath()).toBe('/projects/new')

    await act(async () => {
      name.focus()
    })
    expect(document.activeElement).toBe(name)
    expect(name.getAttribute('aria-invalid')).toBe('true')
  })

  it('keeps the actual primary button dimensions stable through its busy state in a wrapping narrow row', async () => {
    const request = deferred<string>()
    const create = vi.fn().mockReturnValue(request.promise)
    registerCreateViewModel(create)
    const page = await render(<CreateRoutes initialEntries={['/projects/new']} />)
    const name = page.querySelector('input') as HTMLInputElement
    const form = page.querySelector('form') as HTMLFormElement
    const button = page.querySelector('button[type="submit"]') as HTMLButtonElement
    const idleWidth = getComputedStyle(button).width

    await setInputValue(name, 'Pending project')
    await submit(form)
    await vi.waitFor(() => expect(button.getAttribute('aria-busy')).toBe('true'))

    expect(getComputedStyle(button).width).toBe(idleWidth)
    expect(getComputedStyle(button).width).toBe('120px')
    expect(getComputedStyle(button.parentElement as HTMLElement).flexWrap).toBe('wrap')
    expect(button.textContent).toContain('Creating…')

    await act(async () => {
      request.resolve('prj_created')
      await Promise.resolve()
    })
  })

  it('renders ready, unavailable, error, and actual Retry transitions through the Overview route', async () => {
    const get = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(project('prj_live'))
    registerProjectLayoutViewModel(get)
    const page = await render(<ProjectRoutes initialEntries={['/projects/prj_live']} />)

    await vi.waitFor(() => expect(page.textContent).toContain('Project could not be loaded'))
    expect(page.textContent).toContain('Project could not be loaded. Try again.')
    expect(page.textContent).not.toContain('offline')
    await click(page.querySelector('button') as HTMLButtonElement)
    await vi.waitFor(() => expect(page.querySelector('#project-overview-heading')?.textContent).toBe('Live prj_live'))
    expect(page.querySelector('a[href="/projects/prj_live/settings"]')?.textContent).toBe('Settings')
    expect(document.activeElement).not.toBe(page.querySelector('#project-overview-heading'))

    registerProjectLayoutViewModel(vi.fn().mockResolvedValue(null))
    await act(async () => {
      root?.unmount()
    })
    host?.remove()
    root = undefined
    host = undefined

    const unavailablePage = await render(<ProjectRoutes initialEntries={['/projects/prj_missing']} />)
    await vi.waitFor(() => expect(unavailablePage.textContent).toContain('Project unavailable'))
    expect(unavailablePage.textContent).not.toContain('Retry')
  })

  it('remounts the real project route by ID, removes the old identity, without automatically focusing the ready heading', async () => {
    const oldRequest = deferred<Project | null>()
    const newRequest = deferred<Project | null>()
    const get = vi.fn((id: string) => (id === 'prj_old' ? oldRequest.promise : newRequest.promise))
    registerProjectLayoutViewModel(get)
    const page = await render(<ProjectRoutes initialEntries={['/projects/prj_old']} />)

    await vi.waitFor(() => expect(get).toHaveBeenCalledWith('prj_old'))
    await act(async () => {
      oldRequest.resolve(project('prj_old'))
      await Promise.resolve()
    })
    await vi.waitFor(() => expect(page.querySelector('#project-overview-heading')?.textContent).toBe('Live prj_old'))
    expect(document.activeElement).not.toBe(page.querySelector('#project-overview-heading'))

    await click(page.querySelector('[data-testid="open-new-project"]') as HTMLAnchorElement)
    await vi.waitFor(() => expect(get).toHaveBeenCalledWith('prj_new'))
    expect(page.textContent).not.toContain('Live prj_old')

    await act(async () => {
      newRequest.resolve(project('prj_new'))
      await Promise.resolve()
    })
    await vi.waitFor(() => expect(page.querySelector('#project-overview-heading')?.textContent).toBe('Live prj_new'))
    expect(page.textContent).not.toContain('Live prj_old')
    expect(document.activeElement).not.toBe(page.querySelector('#project-overview-heading'))
  })

  it('uses the safe generic project loader on a direct Overview reload', async () => {
    const projectRead = deferred<Project | null>()
    const get = vi.fn().mockReturnValue(projectRead.promise)
    registerProjectLayoutViewModel(get)
    const page = await render(<ProjectRoutes initialEntries={['/projects/prj_1']} />)

    await vi.waitFor(() => expect(get).toHaveBeenCalledWith('prj_1'))
    expect(page.textContent).toContain('Loading project…')
    const loadingSources = page.querySelectorAll('[role="status"][aria-live="polite"]')
    expect(loadingSources).toHaveLength(1)
    expect(loadingSources[0]?.textContent?.trim()).toBe('Loading project…')
    expect(page.querySelector('section[aria-label="Project header"]')).toBeNull()
    expect(page.querySelector('[data-testid="project-content-overview"]')).toBeNull()
    expect(page.querySelector('a[href="/projects"]')?.textContent).toBe('Back to projects')

    await act(async () => {
      projectRead.resolve(project('prj_1'))
      await Promise.resolve()
    })

    await vi.waitFor(() => expect(page.querySelector('#project-overview-heading')?.textContent).toBe('Live prj_1'))
  })

  it('ignores Overview navigation state and loads only the route project', async () => {
    const projectRead = deferred<Project | null>()
    const get = vi.fn().mockReturnValue(projectRead.promise)
    registerProjectLayoutViewModel(get)
    const ignoredProject = project('prj_2', { name: 'Ignored overview state' })
    const page = await render(
      <ProjectRoutes
        initialEntries={[
          {
            pathname: '/projects/prj_2',
            state: { project: ignoredProject },
          },
        ]}
      />,
    )

    await vi.waitFor(() => expect(get).toHaveBeenCalledWith('prj_2'))
    expect(page.querySelector('section[aria-label="Project header"]')).toBeNull()
    expect(page.textContent).not.toContain('Ignored overview state')
    expect(page.textContent).toContain('Loading project…')

    await act(async () => {
      projectRead.resolve(project('prj_2'))
      await Promise.resolve()
    })

    await vi.waitFor(() => expect(page.querySelector('#project-overview-heading')?.textContent).toBe('Live prj_2'))
    expect(page.textContent).not.toContain('Ignored overview state')
  })

  it('loads Overview from the server after entry and again after Back and Forward', async () => {
    const firstRead = deferred<Project | null>()
    const secondRead = deferred<Project | null>()
    const get = vi
      .fn<ProjectService['get']>()
      .mockReturnValueOnce(firstRead.promise)
      .mockReturnValueOnce(secondRead.promise)
    registerProjectLayoutViewModel(get)
    const page = await render(
      <OverviewHistoryRoutes
        initialEntries={[
          '/projects',
          {
            pathname: '/projects/prj_1',
            state: { project: project('prj_1', { name: 'Overview snapshot' }) },
          },
        ]}
        initialIndex={1}
      />,
    )

    await vi.waitFor(() => expect(get).toHaveBeenCalledTimes(1))
    expect(page.querySelector('#project-overview-heading')).toBeNull()
    expect(page.textContent).not.toContain('Overview snapshot')
    expect(page.textContent).toContain('Loading project…')
    const loadingSources = page.querySelectorAll('[role="status"][aria-live="polite"]')
    expect(loadingSources).toHaveLength(1)
    expect(loadingSources[0]?.textContent?.trim()).toBe('Loading project…')
    expect(page.querySelector('a[href="/projects"]')).not.toBeNull()
    expect(page.querySelector('[data-testid="project-content-overview"]')).toBeNull()

    await act(async () => {
      firstRead.resolve(project('prj_1', { name: 'First overview truth' }))
      await Promise.resolve()
    })
    await vi.waitFor(() =>
      expect(page.querySelector('#project-overview-heading')?.textContent).toBe('First overview truth'),
    )

    await click(page.querySelector('[data-testid="router-back"]') as HTMLButtonElement)
    await vi.waitFor(() => expect(currentPath()).toBe('/projects'))
    await click(page.querySelector('[data-testid="router-forward"]') as HTMLButtonElement)
    await vi.waitFor(() => expect(currentPath()).toBe('/projects/prj_1'))
    await vi.waitFor(() => expect(get).toHaveBeenCalledTimes(2))
    expect(page.querySelector('#project-overview-heading')).toBeNull()
    expect(page.textContent).not.toContain('Overview snapshot')
    expect(page.textContent).toContain('Loading project…')
    expect(page.querySelector('[data-testid="project-content-overview"]')).toBeNull()

    await act(async () => {
      secondRead.resolve(project('prj_1', { name: 'Second overview truth' }))
      await Promise.resolve()
    })
    await vi.waitFor(() =>
      expect(page.querySelector('#project-overview-heading')?.textContent).toBe('Second overview truth'),
    )
  })

  it('places the real static create route before the dynamic project route', () => {
    const appLayout = routes[0] as { readonly children: ReadonlyArray<{ readonly path?: string }> }
    const createRouteIndex = appLayout.children.findIndex((route) => route.path === '/projects/new')
    const projectRouteIndex = appLayout.children.findIndex((route) => route.path === '/projects/:projectId')

    expect(createRouteIndex).toBeGreaterThanOrEqual(0)
    expect(projectRouteIndex).toBeGreaterThanOrEqual(0)
    expect(createRouteIndex).toBeLessThan(projectRouteIndex)
  })
})

describe('Project Settings page boundaries', () => {
  it.each([
    ['Control-click', { ctrlKey: true }],
    ['Command-click', { metaKey: true }],
    ['middle-click', { button: 1 }],
  ])('keeps canonical native navigation semantics for %s on the Settings link', async (_label, eventInit) => {
    const get = vi.fn().mockResolvedValue(project('prj_1'))
    registerProjectLayoutViewModel(get)
    registerSettingsViewModel({ get } as unknown as ProjectService)
    const page = await render(<ProjectSectionRoutes />)

    const settingsLink = await vi.waitFor(() => {
      const value = page.querySelector('a[href="/projects/prj_1/settings"]')
      expect(value).not.toBeNull()
      return value as HTMLAnchorElement
    })
    const event = await dispatchLinkClick(settingsLink, eventInit)

    expect(settingsLink.getAttribute('href')).toBe('/projects/prj_1/settings')
    expect(event.defaultPrevented).toBe(false)
    expect(currentPath()).toBe('/projects/prj_1')
  })

  it('keeps one shared project header structure and spacing when switching between Overview and Settings', async () => {
    const get = vi.fn().mockResolvedValue(project('prj_1'))
    registerProjectLayoutViewModel(get)
    registerSettingsViewModel({ get } as unknown as ProjectService)
    const page = await render(<ProjectSectionRoutes />)

    const overviewHeader = await vi.waitFor(() => {
      const value = page.querySelector('section[aria-label="Project header"]')
      expect(value).not.toBeNull()
      return value as HTMLElement
    })
    const overviewContract = {
      className: overviewHeader.className,
      children: Array.from(overviewHeader.children).map((child) => child.tagName),
      backHref: overviewHeader.querySelector('a')?.getAttribute('href'),
      pageRowGap: getComputedStyle(overviewHeader.parentElement as HTMLElement).rowGap,
    }

    await click(overviewHeader.querySelector('a[href="/projects/prj_1/settings"]') as HTMLAnchorElement)
    await vi.waitFor(() => expect(currentPath()).toBe('/projects/prj_1/settings'))
    const settingsHeader = await vi.waitFor(() => {
      const value = page.querySelector('section[aria-label="Project header"]')
      expect(value).not.toBeNull()
      return value as HTMLElement
    })

    expect(settingsHeader.parentElement?.className).toBe(overviewHeader.parentElement?.className)
    expect({
      className: settingsHeader.className,
      children: Array.from(settingsHeader.children).map((child) => child.tagName),
      backHref: settingsHeader.querySelector('a')?.getAttribute('href'),
      pageRowGap: getComputedStyle(settingsHeader.parentElement as HTMLElement).rowGap,
    }).toEqual(overviewContract)
    expect(settingsHeader.querySelector('h1')?.textContent).toBe('Live prj_1')
    expect(settingsHeader.textContent).toContain('Loaded from GraphQL')
    expect(settingsHeader.textContent).toContain('Active')
    expect(settingsHeader.textContent).toContain('prj_1')
  })

  it('keeps the project shell mounted when switching from Overview to Settings', async () => {
    const get = vi.fn().mockResolvedValue(project('prj_1'))
    registerSettingsViewModel({ get } as unknown as ProjectService)
    const page = await render(<ProjectSectionRoutes />)

    const overviewHeader = await vi.waitFor(() => {
      const value = page.querySelector('section[aria-label="Project header"]')
      expect(value).not.toBeNull()
      return value as HTMLElement
    })
    const projectShell = overviewHeader.parentElement

    await click(overviewHeader.querySelector('a[href="/projects/prj_1/settings"]') as HTMLAnchorElement)
    await vi.waitFor(() => expect(currentPath()).toBe('/projects/prj_1/settings'))

    expect(page.querySelector('section[aria-label="Project header"]')).toBe(overviewHeader)
    expect(overviewHeader.parentElement).toBe(projectShell)
    expect(page.querySelector('#project-settings-heading')?.textContent).toBe('Settings')
    expect(page.querySelector('#project-overview-section-heading')).toBeNull()
    expect((page.querySelector('input') as HTMLInputElement).value).toBe('Live prj_1')
    expect(page.textContent).not.toContain('Loading project…')
    expect(get).toHaveBeenCalledOnce()
  })

  it('keeps the project shell mounted when switching from Settings to Overview', async () => {
    const get = vi.fn().mockResolvedValue(project('prj_1'))
    registerProjectLayoutViewModel(get)
    registerSettingsViewModel({ get } as unknown as ProjectService)
    const page = await render(<ProjectSectionRoutes initialEntry="/projects/prj_1/settings" />)

    const settingsHeader = await vi.waitFor(() => {
      expect((page.querySelector('input') as HTMLInputElement).value).toBe('Live prj_1')
      const value = page.querySelector('section[aria-label="Project header"]')
      expect(value).not.toBeNull()
      return value as HTMLElement
    })
    const projectShell = settingsHeader.parentElement

    await click(settingsHeader.querySelector('a[href="/projects/prj_1"]') as HTMLAnchorElement)
    await vi.waitFor(() => expect(currentPath()).toBe('/projects/prj_1'))

    expect(page.querySelector('section[aria-label="Project header"]')).toBe(settingsHeader)
    expect(settingsHeader.parentElement).toBe(projectShell)
    expect(page.querySelector('#project-overview-section-heading')?.textContent).toBe('Overview')
    expect(page.querySelector('#project-settings-heading')).toBeNull()
    expect(page.textContent).not.toContain('Loading project…')
    expect(page.querySelectorAll('a[href="/projects"]')).toHaveLength(1)
    expect(get).toHaveBeenCalledOnce()
  })

  it('ignores Settings navigation state and loads only the route project', async () => {
    const projectRead = deferred<Project | null>()
    const get = vi.fn().mockReturnValue(projectRead.promise)
    const ignoredProject = project('prj_2', { name: 'Ignored settings state' })
    registerSettingsViewModel({ get } as unknown as ProjectService)
    const page = await render(
      <SettingsRoutes
        initialEntries={[
          {
            pathname: '/projects/prj_2/settings',
            state: { project: ignoredProject },
          },
        ]}
      />,
    )

    await vi.waitFor(() => expect(get).toHaveBeenCalledWith('prj_2'))
    expect(page.querySelector('section[aria-label="Project header"]')).toBeNull()
    expect(page.textContent).not.toContain('Ignored settings state')
    expect(page.querySelector('input')).toBeNull()
    expect(Array.from(page.querySelectorAll('button'), (button) => button.textContent)).not.toContain('Archive project')

    await act(async () => {
      projectRead.resolve(project('prj_2'))
      await Promise.resolve()
    })

    await vi.waitFor(() =>
      expect(page.querySelector('#project-settings-project-heading')?.textContent).toBe('Live prj_2'),
    )
    expect((page.querySelector('input') as HTMLInputElement).value).toBe('Live prj_2')
    expect(page.textContent).not.toContain('Ignored settings state')
  })

  it('loads Settings from the server after entry and again after Back and Forward', async () => {
    const firstRead = deferred<Project | null>()
    const secondRead = deferred<Project | null>()
    const get = vi
      .fn<ProjectService['get']>()
      .mockReturnValueOnce(firstRead.promise)
      .mockReturnValueOnce(secondRead.promise)
    registerSettingsViewModel({ get } as unknown as ProjectService)
    const page = await render(
      <SettingsRoutes
        initialEntries={[
          '/projects',
          {
            pathname: '/projects/prj_1/settings',
            state: { project: project('prj_1', { name: 'Navigation snapshot' }) },
          },
        ]}
        initialIndex={1}
      />,
    )

    await vi.waitFor(() => expect(get).toHaveBeenCalledTimes(1))
    expect(page.querySelector('#project-settings-project-heading')).toBeNull()
    expect(page.textContent).not.toContain('Navigation snapshot')
    expect(page.textContent).toContain('Loading project…')

    await act(async () => {
      firstRead.resolve(project('prj_1', { name: 'First server truth' }))
      await Promise.resolve()
    })
    await vi.waitFor(() =>
      expect(page.querySelector('#project-settings-project-heading')?.textContent).toBe('First server truth'),
    )

    await click(page.querySelector('button') as HTMLButtonElement)
    await vi.waitFor(() => expect(currentPath()).toBe('/projects'))
    await click(page.querySelector('button') as HTMLButtonElement)
    await vi.waitFor(() => expect(currentPath()).toBe('/projects/prj_1/settings'))
    await vi.waitFor(() => expect(get).toHaveBeenCalledTimes(2))
    expect(page.querySelector('#project-settings-project-heading')).toBeNull()
    expect(page.textContent).not.toContain('Navigation snapshot')
    expect(page.textContent).toContain('Loading project…')

    await act(async () => {
      secondRead.resolve(project('prj_1', { name: 'Second server truth' }))
      await Promise.resolve()
    })
    await vi.waitFor(() =>
      expect(page.querySelector('#project-settings-project-heading')?.textContent).toBe('Second server truth'),
    )
  })

  it('registers only the exact Settings route and removes the four fixture-backed deep route surfaces', () => {
    const appLayout = routes[0] as {
      readonly children: ReadonlyArray<{
        readonly path?: string
        readonly children?: ReadonlyArray<{ readonly path?: string; readonly index?: boolean }>
      }>
    }
    const paths = appLayout.children.map((route) => route.path)
    const projectRoute = appLayout.children.find((route) => route.path === routePaths.project)

    expect(projectRoute?.children?.some((route) => route.index)).toBe(true)
    expect(projectRoute?.children?.map((route) => route.path)).toContain('settings')
    expect(routePaths.projectSettings).toBe('/projects/:projectId/settings')
    expect(paths).not.toContain('/projects/:projectId/:tab')
    expect(paths).not.toContain('/projects/:projectId/knowledge/:articleId')
    expect(paths).not.toContain('/projects/:projectId/adrs/:adrId')
    expect(paths).not.toContain('/projects/:projectId/memory/:tableId')
    expect(routePaths).not.toHaveProperty('projectTab')
    expect(routePaths).not.toHaveProperty('projectKnowledgeArticle')
    expect(routePaths).not.toHaveProperty('projectAdr')
    expect(routePaths).not.toHaveProperty('projectMemoryTable')
    expect(routeBuilders.projectSettings('prj_1')).toBe('/projects/prj_1/settings')
  })

  it('renders the live active header and form without initial heading or field autofocus', async () => {
    const get = vi.fn().mockResolvedValue(project('prj_1'))
    registerSettingsViewModel({ get } as unknown as ProjectService)
    const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)

    const heading = await vi.waitFor(() => {
      const value = page.querySelector('#project-settings-heading')
      expect(value?.textContent).toBe('Settings')
      return value as HTMLElement
    })
    const name = page.querySelector('input') as HTMLInputElement

    expect(page.textContent).toContain('Back to projects')
    expect(page.textContent).toContain('Live prj_1')
    expect(page.textContent).toContain('Active')
    expect(page.textContent).toContain('Project details')
    expect(page.textContent).toContain('Project state')
    expect(name.value).toBe('Live prj_1')
    expect(document.activeElement).not.toBe(heading)
    expect(document.activeElement).not.toBe(name)
  })

  it('dismisses a dialog on outside interaction and restores focus to its trigger', async () => {
    registerSettingsViewModel({ get: vi.fn().mockResolvedValue(project('prj_1')) } as unknown as ProjectService)
    const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)
    const trigger = await vi.waitFor(
      () =>
        Array.from(page.querySelectorAll('button')).find(
          (button) => button.textContent === 'Archive project',
        ) as HTMLButtonElement,
    )

    trigger.focus()
    await click(trigger)
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement
    expect(dialog).not.toBeNull()
    await pressOutside(page.querySelector('[data-testid="leave-settings"]') as Element)
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('shows only the loading state until the requested route project resolves', async () => {
    const projectRead = deferred<Project | null>()
    registerSettingsViewModel({ get: vi.fn().mockReturnValue(projectRead.promise) } as unknown as ProjectService)
    const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)

    await vi.waitFor(() => expect(page.textContent).toContain('Loading project…'))
    expect(page.textContent).toContain('Back to projects')
    expect(page.textContent).not.toContain('Project details')
    expect(page.textContent).not.toContain('Project state')
    expect(page.querySelector('input')).toBeNull()
    expect(page.querySelector('#project-settings-heading')).toBeNull()

    await act(async () => {
      projectRead.resolve(project('prj_1'))
      await Promise.resolve()
    })
    await vi.waitFor(() => expect(page.querySelector('#project-settings-heading')?.textContent).toBe('Settings'))
  })

  it('uses the exact active form enablement matrix before edits, after edits, and while saving', async () => {
    const updateRequest = deferred<boolean>()
    const update = vi.fn().mockReturnValue(updateRequest.promise)
    registerSettingsViewModel({
      get: vi.fn().mockResolvedValue(project('prj_1')),
      update,
    } as unknown as ProjectService)
    const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)
    const name = await vi.waitFor(() => page.querySelector('input') as HTMLInputElement)
    const description = page.querySelector('textarea') as HTMLTextAreaElement
    const button = (label: string) =>
      Array.from(page.querySelectorAll('button')).find((candidate) => candidate.textContent === label)

    expect(button('Save changes')?.disabled).toBe(true)
    expect(button('Cancel')?.disabled).toBe(true)
    expect(button('Archive project')?.disabled).toBe(false)
    expect(name.disabled).toBe(false)
    expect(description.disabled).toBe(false)

    await setInputValue(name, 'Edited')
    expect(button('Save changes')?.disabled).toBe(false)
    expect(button('Cancel')?.disabled).toBe(false)
    expect(button('Archive project')).toBeUndefined()
    expect(page.textContent).toContain('Save or cancel your changes first.')

    await submit(page.querySelector('form') as HTMLFormElement)
    await vi.waitFor(() => expect(button('Saving…')?.getAttribute('aria-busy')).toBe('true'))
    expect(name.disabled).toBe(true)
    expect(description.disabled).toBe(true)
    expect(button('Cancel')?.disabled).toBe(true)
    await click(button('Saving…') as HTMLButtonElement)
    expect(update).toHaveBeenCalledOnce()

    await act(async () => {
      updateRequest.resolve(false)
      await Promise.resolve()
    })
  })

  it('shows the required Name error on blur without stealing focus from Description', async () => {
    registerSettingsViewModel({ get: vi.fn().mockResolvedValue(project('prj_1')) } as unknown as ProjectService)
    const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)
    const name = await vi.waitFor(() => page.querySelector('input') as HTMLInputElement)
    const description = page.querySelector('textarea') as HTMLTextAreaElement

    await setInputValue(name, '   ')
    await act(async () => {
      name.focus()
      description.focus()
    })

    await vi.waitFor(() => expect(name.getAttribute('aria-invalid')).toBe('true'))
    expect(document.getElementById(name.getAttribute('aria-describedby') ?? '')?.textContent).toContain(
      'Name is required.',
    )
    expect(document.activeElement).toBe(description)
  })

  it('keeps dirty invalid Save clickable, focuses Name on submit, and announces safe save outcomes', async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce(project('prj_1'))
      .mockResolvedValueOnce(project('prj_1', { name: 'Renamed' }))
    const update = vi.fn().mockResolvedValue(true)
    registerSettingsViewModel({ get, update } as unknown as ProjectService)
    const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)
    const name = await vi.waitFor(() => page.querySelector('input') as HTMLInputElement)
    const save = Array.from(page.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Save changes'),
    )

    await setInputValue(name, '   ')
    expect(save?.disabled).toBe(false)
    await click(save as HTMLButtonElement)

    await vi.waitFor(() => expect(name.getAttribute('aria-invalid')).toBe('true'))
    expect(document.activeElement).toBe(name)
    expect(document.getElementById(name.getAttribute('aria-describedby') ?? '')?.textContent).toContain(
      'Name is required.',
    )
    expect(update).not.toHaveBeenCalled()

    await setInputValue(name, 'Renamed')
    await submit(page.querySelector('form') as HTMLFormElement)
    await vi.waitFor(() => expect(page.textContent).toContain('Changes saved.'))
    expect(page.textContent).toContain('Renamed')
    const status = Array.from(page.querySelectorAll('[role="status"]')).find((node) =>
      node.textContent?.includes('Changes saved.'),
    )
    expect(status?.getAttribute('aria-live')).toBe('polite')
  })

  it('guards dirty navigation with a focused discard dialog and returns focus when editing continues', async () => {
    registerSettingsViewModel({ get: vi.fn().mockResolvedValue(project('prj_1')) } as unknown as ProjectService)
    const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)
    const name = await vi.waitFor(() => page.querySelector('input') as HTMLInputElement)
    const leave = page.querySelector('[data-testid="leave-settings"]') as HTMLAnchorElement

    await setInputValue(name, 'Dirty name')
    leave.focus()
    await click(leave)
    await flushAnimationFrame()

    expect(currentPath()).toBe('/projects/prj_1/settings')
    const title = await vi.waitFor(() => {
      const value = Array.from(document.querySelectorAll('[role="dialog"] [tabindex="-1"]')).find(
        (node) => node.textContent === 'Discard changes?',
      )
      expect(value).toBeDefined()
      return value as HTMLElement
    })
    await vi.waitFor(() => expect(document.activeElement).toBe(title))
    expect(title.getAttribute('data-scope')).toBe('dialog')
    expect(title.getAttribute('data-part')).toBe('title')
    expect(page.querySelector('section[aria-label="Project header"]')?.contains(document.activeElement)).toBe(false)
    expect(document.body.textContent).toContain('Your unsaved changes will be lost.')

    const keepEditing = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent === 'Keep editing',
    ) as HTMLButtonElement
    await click(keepEditing)
    await flushAnimationFrame()
    await vi.waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull())
    expect(currentPath()).toBe('/projects/prj_1/settings')
    expect(document.activeElement).toBe(leave)

    await click(leave)
    await flushAnimationFrame()
    const discard = await vi.waitFor(
      () =>
        Array.from(document.querySelectorAll('button')).find(
          (button) => button.textContent === 'Discard changes',
        ) as HTMLButtonElement,
    )
    await click(discard)
    expect(currentPath()).toBe('/projects')
  })

  it('keeps compact project sections open while dirty navigation is blocked and returns focus to the visible link', async () => {
    registerSettingsViewModel({ get: vi.fn().mockResolvedValue(project('prj_1')) } as unknown as ProjectService)
    const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)
    const name = await vi.waitFor(() => page.querySelector('input') as HTMLInputElement)
    const navigation = page.querySelector('nav[aria-label="Project sections"]') as HTMLElement
    const disclosure = navigation.querySelector('button[aria-controls]') as HTMLButtonElement

    expect(disclosure.getAttribute('aria-expanded')).toBe('false')
    await click(disclosure)
    expect(disclosure.getAttribute('aria-expanded')).toBe('true')

    const sectionList = document.getElementById(disclosure.getAttribute('aria-controls') ?? '') as HTMLElement
    const overviewLink = navigation.querySelector('a[href="/projects/prj_1"]') as HTMLAnchorElement
    expect(getComputedStyle(sectionList).display).not.toBe('none')

    await setInputValue(name, 'Dirty name')
    await act(async () => overviewLink.focus())
    await click(overviewLink)
    await flushAnimationFrame()

    await vi.waitFor(() => expect(document.querySelector('[role="dialog"]')).not.toBeNull())
    expect(currentPath()).toBe('/projects/prj_1/settings')
    expect(disclosure.getAttribute('aria-expanded')).toBe('true')
    expect(getComputedStyle(sectionList).display).not.toBe('none')

    const keepEditing = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent === 'Keep editing',
    ) as HTMLButtonElement
    await click(keepEditing)
    await flushAnimationFrame()

    await vi.waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull())
    expect(currentPath()).toBe('/projects/prj_1/settings')
    expect(disclosure.getAttribute('aria-expanded')).toBe('true')
    expect(getComputedStyle(sectionList).display).not.toBe('none')
    expect(document.activeElement).toBe(overviewLink)

    const cancel = Array.from(page.querySelectorAll('button')).find(
      (button) => button.textContent === 'Cancel',
    ) as HTMLButtonElement
    await click(cancel)
    await click(overviewLink)

    await vi.waitFor(() => expect(currentPath()).toBe('/projects/prj_1'))
    await vi.waitFor(() => expect(disclosure.getAttribute('aria-expanded')).toBe('false'))
    expect(getComputedStyle(sectionList).display).toBe('none')
    expect(getComputedStyle(disclosure.parentElement as HTMLElement).display).not.toBe('none')
    expect(page.querySelector('nav[aria-label="Project sections"]')).toBe(navigation)
    expect(navigation.querySelector('button[aria-controls]')).toBe(disclosure)
    expect(document.activeElement).toBe(disclosure)
  })

  it('settles compact discard navigation focus on the visible disclosure after the dialog fully closes', async () => {
    registerSettingsViewModel({ get: vi.fn().mockResolvedValue(project('prj_1')) } as unknown as ProjectService)
    const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)
    const name = await vi.waitFor(() => page.querySelector('input') as HTMLInputElement)
    const navigation = page.querySelector('nav[aria-label="Project sections"]') as HTMLElement
    const disclosure = navigation.querySelector('button[aria-controls]') as HTMLButtonElement

    await click(disclosure)
    const sectionList = document.getElementById(disclosure.getAttribute('aria-controls') ?? '') as HTMLElement
    const overviewLink = navigation.querySelector('a[href="/projects/prj_1"]') as HTMLAnchorElement
    await setInputValue(name, 'Discard this change')
    await act(async () => overviewLink.focus())
    const overviewFocus = vi.spyOn(overviewLink, 'focus')
    await click(overviewLink)
    await flushAnimationFrame()

    const discard = await vi.waitFor(
      () =>
        Array.from(document.querySelectorAll('button')).find(
          (button) => button.textContent === 'Discard changes',
        ) as HTMLButtonElement,
    )
    await click(discard)
    await vi.waitFor(() => expect(currentPath()).toBe('/projects/prj_1'))
    await vi.waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull())
    await act(async () => {
      await Promise.resolve()
      await new Promise<void>((resolve) => setTimeout(resolve, 0))
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    })

    expect(disclosure.getAttribute('aria-expanded')).toBe('false')
    expect(getComputedStyle(sectionList).display).toBe('none')
    expect(getComputedStyle(disclosure.parentElement as HTMLElement).display).not.toBe('none')
    expect(overviewFocus).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(disclosure)
  })

  it('does not move desktop section-link focus to the hidden compact disclosure', async () => {
    registerSettingsViewModel({ get: vi.fn().mockResolvedValue(project('prj_1')) } as unknown as ProjectService)
    const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)
    await vi.waitFor(() => expect(page.querySelector('input')).not.toBeNull())
    const navigation = page.querySelector('nav[aria-label="Project sections"]') as HTMLElement
    const disclosure = navigation.querySelector('button[aria-controls]') as HTMLButtonElement
    const disclosureContainer = disclosure.parentElement as HTMLElement
    const sectionList = document.getElementById(disclosure.getAttribute('aria-controls') ?? '') as HTMLElement
    const overviewLink = navigation.querySelector('a[href="/projects/prj_1"]') as HTMLAnchorElement

    await click(disclosure)
    disclosureContainer.style.display = 'none'
    sectionList.style.display = 'flex'
    await act(async () => overviewLink.focus())
    await click(overviewLink)

    await vi.waitFor(() => expect(currentPath()).toBe('/projects/prj_1'))
    expect(getComputedStyle(disclosureContainer).display).toBe('none')
    expect(getComputedStyle(sectionList).display).toBe('flex')
    expect(document.activeElement).toBe(overviewLink)
  })

  it('collapses compact project sections without stealing focus during history navigation', async () => {
    registerSettingsViewModel({ get: vi.fn().mockResolvedValue(project('prj_1')) } as unknown as ProjectService)
    const page = await render(
      <SettingsRoutes initialEntries={['/projects/prj_1', '/projects/prj_1/settings']} initialIndex={1} />,
    )
    await vi.waitFor(() => expect(page.querySelector('input')).not.toBeNull())
    const navigation = page.querySelector('nav[aria-label="Project sections"]') as HTMLElement
    const disclosure = navigation.querySelector('button[aria-controls]') as HTMLButtonElement
    const routerBack = page.querySelector('[data-testid="router-back"]') as HTMLButtonElement

    await click(disclosure)
    expect(disclosure.getAttribute('aria-expanded')).toBe('true')
    await act(async () => routerBack.focus())
    await click(routerBack)

    await vi.waitFor(() => expect(currentPath()).toBe('/projects/prj_1'))
    await vi.waitFor(() => expect(disclosure.getAttribute('aria-expanded')).toBe('false'))
    expect(document.activeElement).toBe(routerBack)
  })

  it('locks an archive dialog while pending, refetches, closes, and focuses Settings when the trigger disappears', async () => {
    const archiveRequest = deferred<boolean>()
    const get = vi
      .fn()
      .mockResolvedValueOnce(project('prj_1'))
      .mockResolvedValueOnce(
        project('prj_1', {
          name: 'Archived by server',
          description: 'Server archive description',
          status: 'archived',
        }),
      )
    const archive = vi.fn().mockReturnValue(archiveRequest.promise)
    registerSettingsViewModel({ get, archive } as unknown as ProjectService)
    const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)
    const trigger = await vi.waitFor(
      () =>
        Array.from(page.querySelectorAll('button')).find(
          (button) => button.textContent === 'Archive project',
        ) as HTMLButtonElement,
    )

    trigger.focus()
    await click(trigger)
    await flushAnimationFrame()
    const title = await vi.waitFor(() => {
      const value = Array.from(document.querySelectorAll('[role="dialog"] [tabindex="-1"]')).find(
        (node) => node.textContent === 'Archive project',
      )
      expect(value).toBeDefined()
      return value as HTMLElement
    })
    await vi.waitFor(() => expect(document.activeElement).toBe(title))

    const confirm = Array.from(document.querySelectorAll('[role="dialog"] button')).find(
      (button) => button.textContent === 'Archive project',
    ) as HTMLButtonElement
    await click(confirm)
    await click(confirm)
    await vi.waitFor(() => expect(confirm.getAttribute('aria-busy')).toBe('true'))
    expect(archive).toHaveBeenCalledOnce()
    expect(
      Array.from(document.querySelectorAll('button')).find((button) => button.textContent === 'Cancel')?.disabled,
    ).toBe(true)

    await act(async () => {
      archiveRequest.resolve(true)
      await Promise.resolve()
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    })
    await vi.waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull())
    expect(page.textContent).toContain('Archived')
    expect(page.textContent).toContain('Archived by server')
    expect(page.textContent).toContain('This project is archived and read-only.')
    expect(page.textContent).toContain('Restore project')
    expect((page.querySelector('input') as HTMLInputElement).readOnly).toBe(true)
    expect((page.querySelector('input') as HTMLInputElement).value).toBe('Archived by server')
    expect((page.querySelector('textarea') as HTMLTextAreaElement).readOnly).toBe(true)
    expect((page.querySelector('textarea') as HTMLTextAreaElement).value).toBe('Server archive description')
    expect(Array.from(page.querySelectorAll('button')).some((button) => button.textContent === 'Save changes')).toBe(
      false,
    )
    expect(Array.from(page.querySelectorAll('button')).some((button) => button.textContent === 'Cancel')).toBe(false)
    expect(document.activeElement).toBe(page.querySelector('#project-settings-heading'))
  })

  it.each([
    [
      'active',
      'Archive project',
      'Archive Live prj_1? Project data remains available to read, and the project can be restored later.',
    ],
    ['archived', 'Restore project', 'Restore Live prj_1? The project will become editable again.'],
  ] as const)(
    'shows the approved %s dialog consequence without Runs claims, lists, or links',
    async (status, actionLabel, consequence) => {
      registerSettingsViewModel({
        get: vi.fn().mockResolvedValue(project('prj_1', { status })),
      } as unknown as ProjectService)
      const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)
      const action = await vi.waitFor(
        () =>
          Array.from(page.querySelectorAll('button')).find(
            (button) => button.textContent === actionLabel,
          ) as HTMLButtonElement,
      )

      await click(action)
      await flushAnimationFrame()
      const dialog = document.querySelector('[role="dialog"]') as HTMLElement
      expect(dialog.textContent).toContain(consequence)
      expect(page.textContent).not.toMatch(/\bruns?\b/i)
      expect(page.querySelector('a[href*="/runs"]')).toBeNull()
      expect(dialog.textContent).not.toMatch(/\bruns?\b/i)
      expect(dialog.querySelector('a')).toBeNull()
      expect(dialog.querySelector('ul, ol')).toBeNull()
      expect(Array.from(dialog.querySelectorAll('button')).map((button) => button.textContent)).toEqual([
        'Cancel',
        actionLabel,
      ])
      await pressKey('Escape')
      await vi.waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull())
    },
  )

  it('announces operation failure assertively with retry and keeps the restore dialog open', async () => {
    const archived = project('prj_1', { status: 'archived' })
    const get = vi.fn().mockResolvedValue(archived)
    const restore = vi.fn().mockRejectedValue(new Error('private failure'))
    registerSettingsViewModel({ get, restore } as unknown as ProjectService)
    const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)
    const trigger = await vi.waitFor(
      () =>
        Array.from(page.querySelectorAll('button')).find(
          (button) => button.textContent === 'Restore project',
        ) as HTMLButtonElement,
    )

    await click(trigger)
    await flushAnimationFrame()
    const confirm = Array.from(document.querySelectorAll('[role="dialog"] button')).find(
      (button) => button.textContent === 'Restore project',
    ) as HTMLButtonElement
    await click(confirm)

    const alert = await vi.waitFor(() => {
      const value = document.querySelector('[role="alert"]')
      expect(value).not.toBeNull()
      return value as HTMLElement
    })
    expect(alert.textContent).toContain('Project could not be restored. Retry or cancel.')
    expect(alert.getAttribute('aria-live')).toBe('assertive')
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
    expect(document.body.textContent).not.toContain('private failure')
    await pressKey('Escape')
    await vi.waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull())
  })

  it.each([
    ['archive', 'active', 'Archive project', 'Archiving…', 'archived'],
    ['restore', 'archived', 'Restore project', 'Restoring…', 'active'],
  ] as const)(
    'prevents repeated %s, Escape, and outside dismissal while the operation is pending',
    async (operation, initialStatus, actionLabel, pendingLabel, finalStatus) => {
      const operationRequest = deferred<boolean>()
      const get = vi
        .fn()
        .mockResolvedValueOnce(project('prj_1', { status: initialStatus }))
        .mockResolvedValueOnce(project('prj_1', { status: finalStatus }))
      const projectService = {
        get,
        [operation]: vi.fn().mockReturnValue(operationRequest.promise),
      } as unknown as ProjectService
      registerSettingsViewModel(projectService)
      const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)
      const trigger = await vi.waitFor(
        () =>
          Array.from(page.querySelectorAll('button')).find(
            (button) => button.textContent === actionLabel,
          ) as HTMLButtonElement,
      )

      await click(trigger)
      await flushAnimationFrame()
      const dialog = document.querySelector('[role="dialog"]') as HTMLElement
      const confirm = Array.from(dialog.querySelectorAll('button')).find(
        (button) => button.textContent === actionLabel,
      ) as HTMLButtonElement
      await click(confirm)
      await vi.waitFor(() => expect(confirm.textContent).toBe(pendingLabel))
      await click(confirm)
      await pressKey('Escape')
      await pressOutside(page.querySelector('[data-testid="leave-settings"]') as Element)

      expect(document.querySelector('[role="dialog"]')).toBe(dialog)
      expect(projectService[operation]).toHaveBeenCalledOnce()
      expect(
        Array.from(dialog.querySelectorAll('button')).find((button) => button.textContent === 'Cancel')?.disabled,
      ).toBe(true)

      await act(async () => {
        operationRequest.resolve(true)
        await Promise.resolve()
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      })
      await vi.waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull())
    },
  )

  it('traps dialog focus and restores it after Escape dismissal', async () => {
    registerSettingsViewModel({ get: vi.fn().mockResolvedValue(project('prj_1')) } as unknown as ProjectService)
    const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)
    const trigger = await vi.waitFor(
      () =>
        Array.from(page.querySelectorAll('button')).find(
          (button) => button.textContent === 'Archive project',
        ) as HTMLButtonElement,
    )

    trigger.focus()
    await click(trigger)
    await flushAnimationFrame()
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement
    const confirm = Array.from(dialog.querySelectorAll('button')).find(
      (button) => button.textContent === 'Archive project',
    ) as HTMLButtonElement
    confirm.focus()
    await pressKey('Tab')
    expect(document.activeElement).toBe(dialog)

    await pressKey('Escape')
    await flushAnimationFrame()
    await vi.waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })

  it('allows a guarded discard during save and suppresses the late completion announcement after navigation', async () => {
    const updateRequest = deferred<boolean>()
    const update = vi.fn().mockReturnValue(updateRequest.promise)
    const get = vi.fn().mockResolvedValue(project('prj_1'))
    registerSettingsViewModel({ get, update } as unknown as ProjectService)
    const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)
    const name = await vi.waitFor(() => page.querySelector('input') as HTMLInputElement)

    await setInputValue(name, 'Pending name')
    await submit(page.querySelector('form') as HTMLFormElement)
    await vi.waitFor(() => expect(page.textContent).toContain('Saving…'))
    await click(page.querySelector('[data-testid="leave-settings"]') as HTMLAnchorElement)
    await flushAnimationFrame()
    const discard = await vi.waitFor(
      () =>
        Array.from(document.querySelectorAll('button')).find(
          (button) => button.textContent === 'Discard changes',
        ) as HTMLButtonElement,
    )
    await click(discard)
    expect(currentPath()).toBe('/projects')

    await act(async () => {
      updateRequest.resolve(true)
      await Promise.resolve()
    })
    expect(page.textContent).not.toContain('Changes saved.')
    expect(get).toHaveBeenCalledOnce()
  })

  it('keeps committed-refresh reconciliation visible and blocks repeated writes until one retry read succeeds', async () => {
    const retryRead = deferred<Project | null>()
    const get = vi
      .fn()
      .mockResolvedValueOnce(project('prj_1'))
      .mockRejectedValueOnce(new Error('save refresh offline'))
      .mockReturnValueOnce(retryRead.promise)
    const update = vi.fn().mockResolvedValue(true)
    const archive = vi.fn()
    registerSettingsViewModel({ get, update, archive } as unknown as ProjectService)
    const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)
    const name = await vi.waitFor(() => page.querySelector('input') as HTMLInputElement)

    await setInputValue(name, 'Possibly saved')
    await submit(page.querySelector('form') as HTMLFormElement)
    await vi.waitFor(() =>
      expect(page.textContent).toContain('Changes were saved, but the project could not be refreshed. Retry.'),
    )

    await setInputValue(name, 'Edited during reconciliation')
    let save = Array.from(page.querySelectorAll('button')).find((button) => button.textContent === 'Save changes')
    const cancel = Array.from(page.querySelectorAll('button')).find((button) => button.textContent === 'Cancel')
    let archiveButton = Array.from(page.querySelectorAll('button')).find(
      (button) => button.textContent === 'Archive project',
    )
    expect(save?.disabled).toBe(true)
    expect(cancel?.disabled).toBe(false)
    expect(archiveButton).toBeUndefined()
    expect(page.textContent).toContain('Changes were saved, but the project could not be refreshed. Retry.')

    await click(cancel as HTMLButtonElement)
    save = Array.from(page.querySelectorAll('button')).find((button) => button.textContent === 'Save changes')
    archiveButton = Array.from(page.querySelectorAll('button')).find(
      (button) => button.textContent === 'Archive project',
    )
    expect(save?.disabled).toBe(true)
    expect(archiveButton?.disabled).toBe(true)
    expect(page.textContent).toContain('Changes were saved, but the project could not be refreshed. Retry.')

    const retry = Array.from(page.querySelectorAll('button')).find((button) => button.textContent === 'Retry')
    await click(retry as HTMLButtonElement)
    await click(retry as HTMLButtonElement)
    await vi.waitFor(() => expect(retry?.getAttribute('aria-busy')).toBe('true'))
    expect(get).toHaveBeenCalledTimes(3)
    expect(update).toHaveBeenCalledOnce()
    expect(archive).not.toHaveBeenCalled()

    await act(async () => {
      retryRead.resolve(project('prj_1', { name: 'Possibly saved' }))
      await Promise.resolve()
    })
    await vi.waitFor(() =>
      expect(page.textContent).not.toContain('Changes were saved, but the project could not be refreshed. Retry.'),
    )
    expect((page.querySelector('input') as HTMLInputElement).value).toBe('Possibly saved')
  })

  it('announces pending save from one polite live source with the exact Saving text', async () => {
    const updateRequest = deferred<boolean>()
    const get = vi.fn().mockResolvedValue(project('prj_1'))
    registerSettingsViewModel({
      get,
      update: vi.fn().mockReturnValue(updateRequest.promise),
    } as unknown as ProjectService)
    const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)
    const name = await vi.waitFor(() => page.querySelector('input') as HTMLInputElement)

    await setInputValue(name, 'Pending save')
    await submit(page.querySelector('form') as HTMLFormElement)

    const politeSources = await vi.waitFor(() => {
      const values = Array.from(page.querySelectorAll('[role="status"][aria-live="polite"]'))
      expect(values).toHaveLength(1)
      return values
    })
    expect(politeSources[0]?.textContent?.trim()).toBe('Saving…')

    await act(async () => {
      updateRequest.resolve(false)
      await Promise.resolve()
    })
  })

  it('uses the route adapter ID, removes stale DOM on ID change, and ignores the late previous read', async () => {
    const firstRead = deferred<Project | null>()
    const secondRead = deferred<Project | null>()
    const get = vi.fn((projectId: string) => (projectId === 'prj_1' ? firstRead.promise : secondRead.promise))
    registerSettingsViewModel({ get } as unknown as ProjectService)
    const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)

    await vi.waitFor(() => expect(get).toHaveBeenCalledWith('prj_1'))
    expect(page.textContent).toContain('Loading project…')
    await click(page.querySelector('[data-testid="open-other-settings"]') as HTMLAnchorElement)
    await vi.waitFor(() => expect(currentPath()).toBe('/projects/prj_2/settings'))
    await vi.waitFor(() => expect(get).toHaveBeenCalledWith('prj_2'))
    expect(page.textContent).toContain('Loading project…')
    expect(page.textContent).not.toContain('Live prj_1')
    expect(page.querySelector('input')).toBeNull()

    await act(async () => {
      firstRead.resolve(project('prj_1', { name: 'Late first project' }))
      await Promise.resolve()
    })
    expect(page.textContent).toContain('Loading project…')
    expect(page.textContent).not.toContain('Late first project')

    await act(async () => {
      secondRead.resolve(project('prj_2'))
      await Promise.resolve()
    })
    await vi.waitFor(() => expect((page.querySelector('input') as HTMLInputElement).value).toBe('Live prj_2'))
    expect(get.mock.calls.map(([projectId]) => projectId)).toEqual(['prj_1', 'prj_2'])
  })

  it('guards browser-style Back navigation, discards it, and preserves the Forward history entry', async () => {
    registerSettingsViewModel({ get: vi.fn().mockResolvedValue(project('prj_1')) } as unknown as ProjectService)
    const page = await render(
      <SettingsRoutes initialEntries={['/projects', '/projects/prj_1/settings']} initialIndex={1} />,
    )
    const name = await vi.waitFor(() => page.querySelector('input') as HTMLInputElement)
    await setInputValue(name, 'Dirty history')

    await click(
      Array.from(page.querySelectorAll('button')).find((button) => button.textContent === 'Router back') as Element,
    )
    await flushAnimationFrame()
    expect(currentPath()).toBe('/projects/prj_1/settings')
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Discard changes?')

    const discard = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent === 'Discard changes',
    ) as HTMLButtonElement
    await click(discard)
    await vi.waitFor(() => expect(currentPath()).toBe('/projects'))

    await click(
      Array.from(page.querySelectorAll('button')).find((button) => button.textContent === 'Router forward') as Element,
    )
    await vi.waitFor(() => expect(currentPath()).toBe('/projects/prj_1/settings'))
  })

  it('lets form Cancel clear dirty state so the next navigation proceeds without a dialog', async () => {
    registerSettingsViewModel({ get: vi.fn().mockResolvedValue(project('prj_1')) } as unknown as ProjectService)
    const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)
    const name = await vi.waitFor(() => page.querySelector('input') as HTMLInputElement)
    await setInputValue(name, 'Dirty then cancelled')

    const cancel = Array.from(page.querySelectorAll('button')).find(
      (button) => button.textContent === 'Cancel',
    ) as HTMLButtonElement
    await click(cancel)
    expect(name.value).toBe('Live prj_1')
    await click(page.querySelector('[data-testid="leave-settings"]') as HTMLAnchorElement)

    await vi.waitFor(() => expect(currentPath()).toBe('/projects'))
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  it('keeps the narrow-screen semantic order as fields, form actions, then Project state', async () => {
    registerSettingsViewModel({ get: vi.fn().mockResolvedValue(project('prj_1')) } as unknown as ProjectService)
    const page = await render(<SettingsRoutes initialEntries={['/projects/prj_1/settings']} />)
    const name = await vi.waitFor(() => page.querySelector('input') as HTMLInputElement)
    const description = page.querySelector('textarea') as HTMLTextAreaElement
    const cancel = Array.from(page.querySelectorAll('button')).find(
      (button) => button.textContent === 'Cancel',
    ) as HTMLButtonElement
    const save = Array.from(page.querySelectorAll('button')).find(
      (button) => button.textContent === 'Save changes',
    ) as HTMLButtonElement
    const stateHeading = page.querySelector('#project-state-heading') as HTMLElement

    expect(name.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(description.compareDocumentPosition(cancel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(cancel.compareDocumentPosition(save) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(save.compareDocumentPosition(stateHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
