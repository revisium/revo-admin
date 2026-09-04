import { describe, expect, it } from 'vitest'
import { ProjectListViewModel } from 'src/pages/projects/model/ProjectListViewModel'
import { container } from 'src/shared/lib/DIContainer'

describe('ProjectListViewModel', () => {
  it('is registered in the application container', () => {
    expect(container.get(ProjectListViewModel)).toBeInstanceOf(ProjectListViewModel)
  })

  it('exposes render-ready rows from the local fixture', () => {
    const model = new ProjectListViewModel()
    model.setup()

    expect(model.resultCountLabel).toBe('3 projects')
    expect(model.rows[0]).toMatchObject({
      id: 'prj_orch',
      name: 'Orchestrator',
      statusLabel: 'Active',
      href: '/projects/prj_orch',
    })
    expect(model.rows[0]?.counters).toContainEqual({ id: 'runs', label: 'Runs 3' })
  })

  it('filters by project name, id, and key', () => {
    const model = new ProjectListViewModel()

    model.setQuery('schema-platform')
    expect(model.rows.map((row) => row.id)).toEqual(['prj_schema'])

    model.setQuery('prj_strategy')
    expect(model.rows.map((row) => row.name)).toEqual(['Strategy & Docs'])
  })

  it('reports no-results separately from the initial empty state', () => {
    const model = new ProjectListViewModel()

    expect(model.isEmpty).toBe(false)
    expect(model.isNoResults).toBe(false)

    model.setQuery('does-not-exist')
    expect(model.isEmpty).toBe(true)
    expect(model.isNoResults).toBe(true)
  })
})
