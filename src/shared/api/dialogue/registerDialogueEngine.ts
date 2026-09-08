import { DialogueEngine, GraphqlDialogueBackend, PersistentCommandStorage } from 'src/modules/dialogue-engine'
import { container } from 'src/shared/lib'
import { resolveGraphqlHttpUrl } from '../graphql'

container.register(
  DialogueEngine,
  () => {
    const backend = new GraphqlDialogueBackend({ endpoint: resolveGraphqlHttpUrl() })
    const commands = new PersistentCommandStorage(() =>
      typeof window === 'undefined' ? undefined : window.sessionStorage,
    )

    return new DialogueEngine(backend, commands)
  },
  { scope: 'singleton' },
)
