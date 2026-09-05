/* @vitest-environment jsdom */

import { ChakraProvider } from '@chakra-ui/react'
import { act, StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Link, MemoryRouter, Route, Routes, type InitialEntry, useLocation, useNavigate } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type Project, ProjectService } from 'src/entities/project'
import { ProjectCreateViewModel } from 'src/features/ProjectCreateForm'
import { ProjectCreatePage } from 'src/pages/project-create'
import { ProjectOverviewViewModel } from 'src/pages/project-overview'
import { ProjectListViewModel, ProjectsPage } from 'src/pages/projects'
import ProjectDetail from 'src/routes/ProjectDetail'
import routes from 'src/routes'
import { container } from 'src/shared/lib'
import { system } from 'src/shared/ui/theme/theme'
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

type Deferred<T> = {
  readonly promise: Promise<T>
  resolve: (value: T) => void
}

const deferred = <T,>(): Deferred<T> => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })

  return { promise, resolve }
}

const project = (id: string): Project => ({
  id,
  name: `Live ${id}`,
  description: 'Loaded from GraphQL',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
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

const currentPath = (): string => host?.querySelector('[data-testid="location"]')?.textContent ?? ''

const LocationProbe = () => {
  const location = useLocation()

  return <output data-testid="location">{location.pathname}</output>
}

const RouterBack = () => {
  const navigate = useNavigate()

  return <button onClick={() => navigate(-1)}>Router back</button>
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
      <Route path="/projects/:projectId" element={<ProjectDetail />} />
    </Routes>
  </MemoryRouter>
)

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

const registerCreateViewModel = (create: ProjectService['create']) => {
  container.register(ProjectCreateViewModel, () => new ProjectCreateViewModel({ create } as ProjectService), {
    scope: 'transient',
  })
}

const registerOverviewViewModel = (get: ProjectService['get']) => {
  container.register(ProjectOverviewViewModel, () => new ProjectOverviewViewModel({ get } as ProjectService), {
    scope: 'transient',
  })
}

const registerReadyProjectListViewModel = () => {
  container.register(
    ProjectListViewModel,
    () =>
      ({
        state: 'ready',
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
        continuationState: 'idle',
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
  container.register(ProjectOverviewViewModel, () => new ProjectOverviewViewModel(container.get(ProjectService)), {
    scope: 'transient',
  })
  container.register(ProjectListViewModel, () => new ProjectListViewModel(container.get(ProjectService)), {
    scope: 'transient',
  })
}

afterEach(async () => {
  await act(async () => {
    root?.unmount()
  })
  host?.remove()
  root = undefined
  host = undefined
  restoreViewModels()
})

describe('Project create and Overview page boundaries', () => {
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
    registerOverviewViewModel(get)
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
    const models: ProjectOverviewViewModel[] = []
    container.register(
      ProjectOverviewViewModel,
      () => {
        const model = new ProjectOverviewViewModel({ get } as unknown as ProjectService)
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
    const activeModel = models.find((model) => model.state.kind === 'loading')
    expect(activeModel).toBeDefined()

    await act(async () => {
      root?.unmount()
      await Promise.resolve()
    })
    await act(async () => {
      request.resolve(project('prj_late'))
      await Promise.resolve()
    })

    expect(page.textContent).toBe('')
    expect(activeModel?.state).toEqual({ kind: 'loading' })
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

  it('uses the rendered Cancel action for marked history-back and unmarked Projects fallback', async () => {
    registerCreateViewModel(vi.fn())
    let page = await render(
      <CreateRoutes
        initialEntries={['/runs', { pathname: '/projects/new', state: { fromProjects: true } }]}
        initialIndex={1}
      />,
    )

    await click(page.querySelector('button[type="button"]') as HTMLButtonElement)
    expect(currentPath()).toBe('/runs')

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
    registerOverviewViewModel(get)
    const page = await render(<ProjectRoutes initialEntries={['/projects/prj_live']} />)

    await vi.waitFor(() => expect(page.textContent).toContain('Project could not be loaded'))
    expect(page.textContent).toContain('offline')
    await click(page.querySelector('button') as HTMLButtonElement)
    await vi.waitFor(() => expect(page.querySelector('#project-overview-heading')?.textContent).toBe('Live prj_live'))
    expect(document.activeElement).toBe(page.querySelector('#project-overview-heading'))

    registerOverviewViewModel(vi.fn().mockResolvedValue(null))
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

  it('remounts the real project route by ID, removes the old identity, and focuses the new ready heading once', async () => {
    const oldRequest = deferred<Project | null>()
    const newRequest = deferred<Project | null>()
    const get = vi.fn((id: string) => (id === 'prj_old' ? oldRequest.promise : newRequest.promise))
    registerOverviewViewModel(get)
    const page = await render(<ProjectRoutes initialEntries={['/projects/prj_old']} />)

    await vi.waitFor(() => expect(get).toHaveBeenCalledWith('prj_old'))
    await act(async () => {
      oldRequest.resolve(project('prj_old'))
      await Promise.resolve()
    })
    await vi.waitFor(() => expect(page.querySelector('#project-overview-heading')?.textContent).toBe('Live prj_old'))
    expect(document.activeElement).toBe(page.querySelector('#project-overview-heading'))

    await click(page.querySelector('[data-testid="open-new-project"]') as HTMLAnchorElement)
    await vi.waitFor(() => expect(get).toHaveBeenCalledWith('prj_new'))
    expect(page.textContent).not.toContain('Live prj_old')

    await act(async () => {
      newRequest.resolve(project('prj_new'))
      await Promise.resolve()
    })
    await vi.waitFor(() => expect(page.querySelector('#project-overview-heading')?.textContent).toBe('Live prj_new'))
    expect(page.textContent).not.toContain('Live prj_old')
    expect(document.activeElement).toBe(page.querySelector('#project-overview-heading'))
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
