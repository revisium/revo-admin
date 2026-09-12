# GraphQL subscriptions

The application DI container provides one `GraphqlSubscriptions` singleton per browser tab.
It uses the official `graphql-sse` client at same-origin `/graphql/stream`; queries and mutations
continue using `/graphql`. Construction and the initial render perform no IO. The first lease connects;
the last release closes the stream after a short grace period.

## Adding a subscription

1. Add a named operation to the domain's `.graphql` documents and its codegen input.
   Generate typed documents using existing SDK types, then run `pnpm run gql:codegen`.
2. Inject the existing singleton into the domain service through application DI.
3. Keep the lease in that service's lifecycle owner. React renders model state and calls actions.

```ts
const lease = subscriptions.subscribe(DialogueEventsDocument, {
  signal: lifetime.signal,
  prepare: async (signal) => ({ ids: [dialogueId], after: await currentCursorOrSnapshot(signal) }),
  next: (data, signal) => applyChange(data.dialogueChanges, signal),
  changed: (state) => connectionModel.update(state),
  recover: (error, signal) => recoverDomainCursor(error, signal),
})
await lease.done // Resolves on cancellation/completion; rejects on terminal failure.
```

Abort the lifetime signal or call `lease.dispose()` to release only this operation. Handle
`done` errors in the owning service. Application teardown owns the singleton's `dispose()`.

The transport owns bounded reconnects, offline handling, heartbeat detection, and bounded,
ordered delivery per operation. `prepare` runs again after a reconnect, after prior async
application has settled. Domain callbacks must honor cancellation and advance cursors only
after successful application. The domain owns snapshots, cursor recovery, and deduplication;
there is no second topic registry. `recover` may request a bounded local restart. Other errors
stop that operation; connection authorization failures stop the shared connection.

Dialogue summaries belong to the layout lifetime. Details belong to `engine.open(id)` until
its last release; `get(id)` alone does not subscribe. Domain models expose the `changed`
connection state to the UI; the transport has no presentation state or notifications.
