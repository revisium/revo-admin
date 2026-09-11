import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProjectService } from 'src/entities/project'
import { ProjectListViewModel, ProjectsPage } from 'src/pages/projects'
import { container } from 'src/shared/lib'
import { system } from 'src/shared/ui/theme/theme'
import { Layout } from 'src/widgets/Layout'

const renderPage = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <ChakraProvider value={system}>
        <ProjectsPage />
      </ChakraProvider>
    </MemoryRouter>,
  )

const renderLayout = (pathname: string) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[pathname]}>
      <ChakraProvider value={system}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="*" element={<main aria-label="Test route content">Route content</main>} />
          </Route>
        </Routes>
      </ChakraProvider>
    </MemoryRouter>,
  )

const restoreProjectListViewModel = () => {
  container.register(ProjectListViewModel, () => new ProjectListViewModel(container.get(ProjectService)), {
    scope: 'transient',
  })
}

const registerReadyProjectListViewModel = (overrides: Partial<ProjectListViewModel> = {}) => {
  container.register(
    ProjectListViewModel,
    () =>
      ({
        isLoading: false,
        rows: [
          {
            id: 'prj_orch',
            name: 'Orchestrator',
            description: 'Agent host',
            href: '/projects/prj_orch',
            status: 'active',
            statusLabel: 'Active',
            updatedLabel: 'Updated Feb 1, 2026',
          },
        ],
        resultCountLabel: '1 project',
        query: '',
        includeArchived: false,
        isNoResults: false,
        isEmpty: false,
        isLoadingNextPage: false,
        continuationError: null,
        hasNextPage: true,
        hasLoaded: true,
        setQuery: vi.fn(),
        setIncludeArchived: vi.fn(),
        loadNextPage: vi.fn(),
        retryNextPage: vi.fn(),
        isRefreshing: false,
        ...overrides,
      }) as unknown as ProjectListViewModel,
    { scope: 'transient' },
  )
}

describe('ProjectsPage', () => {
  afterEach(restoreProjectListViewModel)

  it('renders an initial loading state instead of a false empty result', () => {
    const markup = renderPage()

    expect(markup).toContain('Loading projects')
    expect(markup).toContain('chakra-spinner')
    expect(markup).not.toContain('0 projects')
    expect(markup).not.toContain('No projects yet')
    expect(markup).not.toContain('No projects match')
  })

  it('uses page scrolling on mobile and the available page height for the desktop collection', () => {
    registerReadyProjectListViewModel()

    const markup = renderPage()
    const collection = markup.match(/<section aria-label="Projects collection" class="([^"]+)">([\s\S]*?)<\/section>/)

    expect(collection).not.toBeNull()
    const [, collectionClass, collectionMarkup] = collection!
    const baseRule = markup.match(new RegExp(`\\.${collectionClass}\\{([^}]*)\\}`))?.[1]
    const desktopRule = markup.match(
      new RegExp(`@media screen and \\(min-width: 48rem\\)\\{\\.${collectionClass}\\{([^}]*)\\}`),
    )?.[1]

    expect(baseRule).not.toContain('overflow-y:auto')
    expect(baseRule).not.toContain('max-height:')
    expect(desktopRule).not.toContain('max-height:')
    expect(desktopRule).toContain('flex:1')
    expect(desktopRule).toContain('min-height:0')
    expect(desktopRule).toContain('overflow-y:auto')
    expect(desktopRule).toContain('overscroll-behavior:contain')
    expect(desktopRule).toContain('scrollbar-gutter:stable')
    expect(markup).not.toContain('55dvh')
    expect(collectionMarkup).toContain('Project')
    expect(collectionMarkup).toContain('Orchestrator')
    expect(markup.indexOf('Load more projects')).toBeGreaterThan(markup.indexOf('</section>'))
  })

  it('keeps only the search toolbar sticky below the top bar on mobile', () => {
    registerReadyProjectListViewModel()

    const markup = renderPage()
    const stickyToolbar = markup.match(/<div class="([^"]+)">(<form[\s\S]*?<\/form>)<\/div>/)

    expect(stickyToolbar).not.toBeNull()
    const [, stickyClass, toolbarMarkup] = stickyToolbar!
    const baseRule = markup.match(new RegExp(`\\.${stickyClass}\\{([^}]*)\\}`))?.[1]
    const desktopRule = markup.match(
      new RegExp(`@media screen and \\(min-width: 48rem\\)\\{\\.${stickyClass}\\{([^}]*)\\}`),
    )?.[1]

    expect(baseRule).toContain('position:sticky')
    expect(baseRule).toContain('top:0')
    expect(baseRule).toContain('z-index:10')
    expect(baseRule).toContain('background:var(--chakra-colors-bg\\.canvas)')
    expect(desktopRule).toContain('position:static')
    expect(toolbarMarkup).toContain('Search by name or ID')
    expect(toolbarMarkup).toContain('Include archived')
    expect(toolbarMarkup).not.toContain('1 project')
  })

  it('keeps the toolbar and loaded rows mounted while showing refresh progress', () => {
    registerReadyProjectListViewModel({
      isLoading: true,
      isRefreshing: true,
    })

    const markup = renderPage()

    expect(markup).toContain('Search by name or ID')
    expect(markup.match(/<input type="search"/g)).toHaveLength(1)
    expect(markup).toContain('1 project')
    expect(markup).toContain('Orchestrator')
    expect(markup).toContain('aria-label="Updating projects"')
    expect(markup).toContain('role="status"')
    expect(markup).not.toContain('Loading projects')
    expect(markup).not.toContain('No projects match')
  })

  it('shows inline refresh progress instead of the initial loader for a retained empty page', () => {
    registerReadyProjectListViewModel({
      isLoading: true,
      rows: [],
      resultCountLabel: '0 projects',
      isRefreshing: true,
      isNoResults: false,
      isEmpty: false,
    })

    const markup = renderPage()

    expect(markup).toContain('0 projects')
    expect(markup).toContain('aria-label="Updating projects"')
    expect(markup).not.toContain('Loading projects')
    expect(markup).not.toContain('No projects match')
  })

  it('renders a continuation error with Retry instead of the load-more action', () => {
    registerReadyProjectListViewModel({ continuationError: 'offline' })

    const markup = renderPage()

    expect(markup).toContain('Orchestrator')
    expect(markup).toContain('More projects could not be loaded')
    expect(markup).toContain('offline')
    expect(markup).toContain('Retry')
    expect(markup).not.toContain('Load more projects')
  })

  it('renders continuation progress instead of the load-more action', () => {
    registerReadyProjectListViewModel({ isLoadingNextPage: true })

    const markup = renderPage()

    expect(markup).toContain('Orchestrator')
    expect(markup).toContain('Loading more projects')
    expect(markup).not.toContain('Load more projects')
  })

  it('gives the projects index the desktop viewport while preserving outer scrolling for other routes', () => {
    const projectsMarkup = renderLayout('/projects')
    const runsMarkup = renderLayout('/runs')
    const desktopRulesOf = (markup: string) =>
      [...markup.matchAll(/@media screen and \(min-width: 48rem\)\{\.css-[^{]+\{([^}]*)\}/g)].map((match) => match[1])
    const projectsDesktopRules = desktopRulesOf(projectsMarkup)
    const runsDesktopRules = desktopRulesOf(runsMarkup)
    const projectsViewportClass = projectsMarkup.match(
      /@media screen and \(min-width: 48rem\)\{\.(css-[^{]+)\{[^}]*overflow-y:hidden;/,
    )?.[1]
    const projectsViewportBaseRule = projectsViewportClass
      ? projectsMarkup.match(new RegExp(`\\.${projectsViewportClass}\\{([^}]*)\\}`))?.[1]
      : undefined

    expect(projectsMarkup).toContain('<main aria-label="Test route content">')
    expect(projectsViewportBaseRule).toContain('flex:1')
    expect(projectsViewportBaseRule).toContain('min-height:0')
    expect(projectsViewportBaseRule).toContain('overflow-y:auto')
    expect(projectsViewportBaseRule).toContain('scrollbar-gutter:stable')
    expect(projectsDesktopRules.some((rule) => rule.includes('overflow-y:hidden'))).toBe(true)
    expect(
      projectsDesktopRules.some(
        (rule) => rule.includes('height:var(--chakra-sizes-full)') && rule.includes('min-height:0'),
      ),
    ).toBe(true)
    expect(runsDesktopRules.some((rule) => rule.includes('overflow-y:hidden'))).toBe(false)
    expect(runsDesktopRules.some((rule) => rule.includes('overflow-y:auto'))).toBe(true)
  })

  it('keeps desktop headings sticky inside the collection with an opaque themed surface', () => {
    registerReadyProjectListViewModel()

    const markup = renderPage()
    const heading = markup.match(/<div aria-hidden="true" class="([^"]+)">/)

    expect(heading).not.toBeNull()
    const headingRules = [...markup.matchAll(new RegExp(`\\.${heading![1]}\\{([^}]*)\\}`, 'g'))].map(
      (match) => match[1],
    )

    expect(headingRules.some((rule) => rule.includes('position:sticky'))).toBe(true)
    expect(headingRules.some((rule) => rule.includes('top:0'))).toBe(true)
    expect(headingRules.some((rule) => rule.includes('z-index:1'))).toBe(true)
    expect(headingRules.some((rule) => rule.includes('background:var(--chakra-colors-bg\\.canvas)'))).toBe(true)
  })
})

it('renders exactly one create action for true-empty and filtered no-results states', () => {
  registerReadyProjectListViewModel({
    rows: [],
    resultCountLabel: '0 projects',
    isEmpty: true,
    isNoResults: false,
    hasNextPage: false,
  })

  const trueEmptyMarkup = renderPage()
  expect(trueEmptyMarkup.match(/Create project/g)).toHaveLength(1)
  expect(trueEmptyMarkup).toContain('href="/projects/new"')

  registerReadyProjectListViewModel({
    rows: [],
    query: 'missing',
    resultCountLabel: '0 projects',
    isEmpty: true,
    isNoResults: true,
    hasNextPage: false,
  })

  const noResultsMarkup = renderPage()
  expect(noResultsMarkup.match(/Create project/g)).toHaveLength(1)
  expect(noResultsMarkup).toContain('href="/projects/new"')
})

it('keeps the rendered Create project action at a compact 44px touch height', () => {
  registerReadyProjectListViewModel()

  const markup = renderPage()
  const action = markup.match(
    /<a[^>]*class="[^"]*\s(css-[^"]+)"[^>]*href="\/projects\/new"[^>]*>[\s\S]*?Create project/,
  )

  expect(action).not.toBeNull()
  const actionClass = action?.[1]
  expect(markup).toMatch(new RegExp(`\\.${actionClass}\\{[^}]*height:44px`))
  expect(markup).toMatch(
    new RegExp(`@media screen and \\(min-width:\\s*48rem\\)\\{\\.${actionClass}\\{[^}]*height:36px`),
  )
})

it('uses the stable route ID in the base live Project breadcrumb while legacy tabs retain fixture labels', () => {
  const baseMarkup = renderLayout('/projects/prj_orch')
  const legacyMarkup = renderLayout('/projects/prj_orch/repositories')

  expect(baseMarkup).toMatch(/<p class="[^"]+">prj_orch<\/p>/)
  expect(legacyMarkup).toMatch(/href="\/projects\/prj_orch"[^>]*>Orchestrator<\/a>/)
})
