import type { SystemInfoQuery } from 'src/__generated__/graphql-request'
import { GraphqlService } from 'src/shared/api'
import { container } from 'src/shared/lib/DIContainer'

export class SystemStatusService {
  public constructor(private readonly graphqlService: GraphqlService = container.get(GraphqlService)) {}

  public async loadSystemInfo(): Promise<SystemInfoQuery['systemInfo']> {
    const data = await this.graphqlService.client.SystemInfo()

    return data.systemInfo
  }
}

container.register(SystemStatusService, () => new SystemStatusService(), { scope: 'singleton' })
