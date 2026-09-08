# Dialogue engine

MobX state, command delivery and SSE recovery. No React, application DI or application SDK dependencies. Import through `index.ts`.

## API

```ts
const backend = new GraphqlDialogueBackend({ endpoint: '/graphql' })
const commandStorage = new PersistentCommandStorage(() => sessionStorage)
const engine = new DialogueEngine(backend, commandStorage)
engine.start() // Shared sidebar feed

const lease = engine.open(dialogueId)
const chat = lease.dialogue // Stable observable resource, available immediately
await lease.ready // History and interactions loaded; SSE may still reconnect
await chat.send('Prepare a pipeline')
lease.release() // Last consumer closes this dialogue feed

engine.dispose() // Close all feeds
```

- `list.items`, `loading`, `error`, `hasMore`, `loadMore()`: sidebar pagination.
- `get(id)`: the same resource used by the list and open screens; does not open a feed.
- `chat.title/status/progress/pendingCount/unread`: shared dialogue state.
- `chat.ready/loading/error`: data loading; `chat.connection` and `list.connection`: separate SSE state.
- `chat.history.items/hasMore/loading/error/loadMore()`: history without cursors or mutable protocol records. Entry identity survives streaming updates.
- `chat.send(text)`, `retrySend()`, `canSend/canRetry/sending/pendingText`: explicit delivery and retry. Retry retains the original command and text.
- `chat.pendingInteractions`, `interaction(id)`: typed questions/options and `choose`, `submit`, `decline`, `retry`; no response-envelope construction in consumers.
- `chat.cancel/reopen/fork/refresh`, `canCancel/canReopen/completedTurns`: dialogue actions. Fork returns the new dialogue ID.
- `chat.markRead()`: mark the loaded snapshot read on opening, including paginated history. Later unseen summary updates are not acknowledged. Call after `lease.ready`.
- `chat.displayReceipt/canAcknowledge/acknowledge`: opaque read receipt. Capture when history is shown; acknowledge that receipt, never a newer unseen summary. Receipt is unavailable until the complete history is loaded.
- `createAgentSelection()`: agent catalog and configuration.
- `createDraft().send(input, text)`: create and send once. Draft `state` distinguishes `ready`, `creating`, `sending`, `retryable`, `creationUncertain`; `retry()` only retries message delivery.

Actions reject on failure. List/history also retain their request error. Consumers handle action promises; the engine reconnects feeds automatically without retrying agent work. `open()` ownership must be released on unmount. `get()` alone retains no subscription.

Inject `DialogueBackend` and `DialogueCommandStorage`, or use the module-owned `GraphqlDialogueBackend` and `PersistentCommandStorage`. Transport accepts endpoint, fetch, headers and credentials; storage accepts a key-value provider and defaults to memory. Application endpoint/storage configuration and DI registration live in `src/shared/api/dialogue`. View models project display values and actions. Draft text, scroll position, follow-output intent and visual labels belong to the application.

## Layout

`transport/graphql/`: operations, generated SDK, HTTP/SSE and liveness. `storage/`: retry persistence. `engine/`: composition and public facade. `resources/`: consumer resources. `lifecycle/`: subscription ownership and cancellable loading. `state/`, `projection/`, `synchronization/`: private records and replay. `commands/`: delivery and read receipts. `configuration/`: typed agent options. `contracts/`: explicit public interfaces and transport-independent IO ports. `errors/`: recovery policy. See `REPOSITORY.md` for internal dependency direction.

```text
__tests__/
  engine/       consumer API, lifecycle, replay, retries and read receipts
  projection/   versions and delta repair
  transport/    GraphQL/SSE adapters and connection liveness
  integration/  application view models and browser storage
  support/      scenario DSL, controlled backend and memory storage
```

```bash
pnpm exec vitest run src/modules/dialogue-engine/__tests__
```

Only integration specs may import application code. Production cannot import `__tests__/`.

`pnpm run gql:codegen` generates separate application and engine clients from the repository schema snapshot. `gql:codegen:check` checks both. The engine imports only its own generated SDK.

`release()` cancels unfinished feed loading; its `ready` promise rejects on cancellation. `refresh()` loads data without acquiring a subscription. Snapshot commits check cancellation before applying state. `dispose()` closes feeds and cancels loading, while cached dialogue resources remain reusable.

The GraphQL adapter unwraps response envelopes and maps errors to `retry`, `refresh` or `stop`. Current Core cursor message prefixes are handled only in that adapter; engine recovery does not inspect error text.
