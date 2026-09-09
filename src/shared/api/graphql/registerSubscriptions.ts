import { GraphqlSubscriptions } from 'src/modules/graphql-subscriptions'
import { container } from 'src/shared/lib/DIContainer'
import { resolveGraphqlSseUrl } from './endpoints'

container.register(
  GraphqlSubscriptions,
  () => {
    const endpoint = resolveGraphqlSseUrl()

    return new GraphqlSubscriptions({ endpoint })
  },
  { scope: 'singleton' },
)
