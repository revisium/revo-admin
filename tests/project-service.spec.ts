import { describe, expect, it } from 'vitest'
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
