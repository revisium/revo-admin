# GraphQL subscriptions

`GraphqlSubscriptions` owns one multiplex GraphQL SSE connection for an application instance.
The application DI container shares it between every feature in a browser tab. Constructing the
service and rendering on the server perform no network IO. The first lease starts the connection;
the last release closes it after a short grace period. Releasing a dialogue does not dispose this
shared service. Application teardown owns `dispose()`.

The endpoint is same-origin `/graphql/stream`, served by Yoga's GraphQL SSE plugin. The official
`graphql-sse` client multiplexes logical operations over one persistent GET. Its PUT, POST and
DELETE requests reserve the connection, start operations and cancel operations; those short
requests are not additional event streams. HTTP queries and mutations continue using `/graphql`.

## Adding a subscription

1. Add a named subscription to the feature's `.graphql` document and run `pnpm run gql:codegen`.
2. Inject the existing `GraphqlSubscriptions` singleton into a service/domain adapter.
3. Pass its generated `TypedDocumentNode` to `subscribe` and keep the returned lease with the
   feature's lifecycle owner. React renders model state and calls model actions.

```ts
const lease = subscriptions.subscribe(DialogueEventsDocument, {
  signal: lifetime.signal,
  prepare: async (signal) => ({ ids: [dialogueId], after: await currentCursorOrSnapshot(signal) }),
  next: async (data, signal) => {
    await applyChange(data.dialogueChanges, signal)
    // Advance the domain cursor only after applying the change successfully.
  },
  changed: (state) => connectionModel.update(state),
  recover: async (error, signal) => recoverDomainCursor(error, signal),
  error: (error) => connectionModel.fail(error),
})
// Closing this feature cancels only its operation.
lease.dispose()
```

`prepare` runs for each connection generation using the domain's latest applied cursor. It may
load a snapshot when no usable cursor exists. `next` runs serially per lease; a slow consumer does
not block other operations. Both callbacks must honor their abort signal before mutating domain
state. On reconnect, old callbacks are canceled and awaited before `prepare` runs again. Queued
old-generation data is discarded and replay resumes from the applied cursor.

There is no second topic registry. Operation documents define the public backend contract;
domain adapters own snapshot, cursor, projection and deduplication semantics. Dialogue summaries
are held while the layout exists. Detailed changes are held only between `engine.open(id)` and
the last release; `engine.get(id)` alone does not subscribe.

## Failure and lifecycle policy

- Shared network failure recreates one client with bounded exponential backoff and jitter. It
  allows five retries and resets that budget after 30 seconds of stable connection time. The
  library's own retry loop is disabled.
- Only bytes received on the persistent GET extend the 45-second heartbeat deadline. Initial
  connection establishment has a separate 45-second deadline. Offline pauses the transport;
  online reconnects the shared connection. Timers and listeners are released when unused.
- Connection-level HTTP 401/403 stops the shared subscriptions. Operation-level GraphQL errors
  and HTTP failures affect only that lease. `SubscriptionExecutionError` retains GraphQL codes
  for domain-specific handling.
- Each operation buffers at most 128 results. Overflow cancels that operation with an explicit
  `SubscriptionOverflowError`; its recovery callback may request replay from an applied cursor
  or reload a snapshot. No event is silently treated as applied.
- `recover` may request an operation-local restart, bounded to three recoveries per lease. It
  never restarts the shared connection. Normal GraphQL completion is terminal. Errors reject
  `done` and invoke `error`; cancellation and normal completion resolve `done`.
- Releasing one lease never disposes the shared client. Late data/connection callbacks cannot
  revive a canceled lease. Per-operation observer failures are isolated from other consumers.

Connection status is observable through MobX and through each lease's `changed` callback. Domain
models decide how to present it; the transport does not show notifications or per-event toasts.

Protocol references: [GraphQL Yoga subscriptions](https://the-guild.dev/graphql/yoga-server/docs/features/subscriptions)
and [GraphQL SSE client options](https://the-guild.dev/graphql/sse/docs/interfaces/client.ClientOptions).
