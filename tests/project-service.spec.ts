import { describe, expect, it, vi } from 'vitest'
import { ProjectService } from 'src/entities/project'
import type { GraphqlService } from 'src/shared/api'

describe('ProjectService', () => {
  it('maps the generated projects connection to a cursor page', async () => {
    const graphql = {
      client: {
        Projects: async (variables: unknown) => {
          expect(variables).toEqual({ query: 'find', includeArchived: true, after: 'cursor-0', first: 25 })
          return {
            projects: {
              edges: [
                {
                  cursor: 'cursor-1',
                  node: { id: 'prj_1', name: 'One', description: '', status: 'archived', createdAt: '', updatedAt: '' },
                },
              ],
              pageInfo: { endCursor: 'cursor-1', hasNextPage: true, hasPreviousPage: true, startCursor: 'cursor-1' },
              totalCount: 4,
            },
          }
        },
      },
    } as unknown as GraphqlService
    const result = await new ProjectService(graphql).list({
      query: 'find',
      includeArchived: true,
      after: 'cursor-0',
      first: 25,
    })
    expect(result).toEqual({
      items: [{ id: 'prj_1', name: 'One', description: '', status: 'archived', createdAt: '', updatedAt: '' }],
      pageInfo: { endCursor: 'cursor-1', hasNextPage: true, hasPreviousPage: true, startCursor: 'cursor-1' },
      totalCount: 4,
    })
  })
})

it('creates a project through the generated input envelope and omits an empty description', async () => {
  const CreateProject = vi.fn().mockResolvedValue({ createProject: { projectId: 'prj_created' } })
  const service = new ProjectService({ client: { CreateProject } } as unknown as GraphqlService)

  await expect(service.create({ name: 'Raw name', description: '' })).resolves.toBe('prj_created')

  expect(CreateProject).toHaveBeenCalledWith({ data: { name: 'Raw name', description: undefined } })
})

it('loads one nullable project without exposing generated response data', async () => {
  const Project = vi.fn().mockResolvedValue({
    project: {
      id: 'prj_1',
      name: 'One',
      description: 'Description',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
  })
  const service = new ProjectService({ client: { Project } } as unknown as GraphqlService)

  await expect(service.get('prj_1')).resolves.toEqual({
    id: 'prj_1',
    name: 'One',
    description: 'Description',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  })
  expect(Project).toHaveBeenCalledWith({ id: 'prj_1' })
})

it('preserves a nullable project result and GraphQL rejection', async () => {
  const missing = new ProjectService({
    client: { Project: vi.fn().mockResolvedValue({ project: null }) },
  } as unknown as GraphqlService)
  const failure = new Error('offline')
  const rejected = new ProjectService({
    client: { Project: vi.fn().mockRejectedValue(failure) },
  } as unknown as GraphqlService)

  await expect(missing.get('prj_missing')).resolves.toBeNull()
  await expect(rejected.get('prj_1')).rejects.toBe(failure)
})
