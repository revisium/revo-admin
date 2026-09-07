import type { ProjectNodeFragment } from 'src/__generated__/graphql-request'
import { GraphqlService, pageInfoOf } from 'src/shared/api'
import { container } from 'src/shared/lib/DIContainer'
import type { Project, ProjectCreateInput, ProjectListRequest, ProjectPage, ProjectUpdateInput } from './types'

const projectOf = (node: ProjectNodeFragment): Project => ({
  id: node.id,
  name: node.name,
  description: node.description,
  status: node.status,
  createdAt: node.createdAt,
  updatedAt: node.updatedAt,
})

export class ProjectService {
  public constructor(private readonly graphqlService: GraphqlService) {}

  public async create(input: ProjectCreateInput): Promise<string> {
    const data = await this.graphqlService.client.CreateProject({
      data: {
        name: input.name,
        description: input.description || undefined,
      },
    })

    return data.createProject.projectId
  }

  public async get(projectId: string): Promise<Project | null> {
    const data = await this.graphqlService.client.Project({ id: projectId })

    return data.project ? projectOf(data.project) : null
  }

  public async update(projectId: string, input: ProjectUpdateInput): Promise<boolean> {
    const data = await this.graphqlService.client.UpdateProject({
      data: {
        id: projectId,
        name: input.name,
        description: input.description,
      },
    })

    return data.updateProject
  }

  public async archive(projectId: string): Promise<boolean> {
    const data = await this.graphqlService.client.ArchiveProject({ data: { id: projectId } })

    return data.archiveProject
  }

  public async restore(projectId: string): Promise<boolean> {
    const data = await this.graphqlService.client.RestoreProject({ data: { id: projectId } })

    return data.restoreProject
  }

  public async list(request: ProjectListRequest = {}): Promise<ProjectPage> {
    const data = await this.graphqlService.client.Projects({
      query: request.query || undefined,
      includeArchived: request.includeArchived,
      after: request.after,
      first: request.first,
    })

    return {
      items: data.projects.edges.map((edge) => projectOf(edge.node)),
      pageInfo: pageInfoOf(data.projects.pageInfo),
      totalCount: data.projects.totalCount,
    }
  }
}

container.register(
  ProjectService,
  () => {
    const graphqlService = container.get(GraphqlService)
    return new ProjectService(graphqlService)
  },
  { scope: 'singleton' },
)
