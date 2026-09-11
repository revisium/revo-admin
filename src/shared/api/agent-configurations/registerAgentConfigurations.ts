import { AgentConfigurationsService, GraphqlAgentConfigurationsTransport } from 'src/modules/agent-configurations'
import { container } from 'src/shared/lib'
import { GraphqlSubscriptions, resolveGraphqlHttpUrl } from '../graphql'

container.register(
  AgentConfigurationsService,
  () => {
    const subscriptions = container.get(GraphqlSubscriptions)
    const transport = new GraphqlAgentConfigurationsTransport({ endpoint: resolveGraphqlHttpUrl() }, subscriptions)

    return new AgentConfigurationsService(transport)
  },
  { scope: 'singleton' },
)
