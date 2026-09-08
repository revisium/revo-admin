import { DialogueEngine, GraphqlDialogueBackend, PersistentCommandStorage } from 'src/modules/dialogue-engine'
import { container } from 'src/shared/lib'
import { GraphqlSubscriptions, resolveGraphqlHttpUrl } from '../graphql'

container.register(
  DialogueEngine,
  () => {
    const subscriptions = container.get(GraphqlSubscriptions)
    const backend = new GraphqlDialogueBackend({ endpoint: resolveGraphqlHttpUrl() }, subscriptions)
    const commands = new PersistentCommandStorage(() =>
      typeof window === 'undefined' ? undefined : window.sessionStorage,
    )

    return new DialogueEngine(backend, commands)
  },
  { scope: 'singleton' },
)
