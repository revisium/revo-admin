# Observable request

MobX loading, result and error state for an async operation. Import through
`index.ts`.

```ts
const request = ObservableRequest.of((id: string) => service.load(id))
const result = await request.fetch(id)

if (result.isRight) {
  consume(result.data)
}

request.abort() // On owner disposal
```

- `fetch(...args)`: returns `Either<ErrorType | AbortError, Result>`.
- `data`, `error`, `errorMessage`: current result and failure state.
- `isLoading`: request is running.
- `isLoaded`: request has settled or was aborted; not a success flag.
- `abort()`: suppresses late results. It does not cancel underlying IO.
- `setDataDirectly(value)`: replaces data and marks the request loaded.
- `{ skipResetting: true }`: retains previous data/error while loading.

A new fetch supersedes the previous one. View models translate nullable request
fields into presentation values. `isLeft`, `isRight` and `errorMessageOf` are
also exported.

```bash
pnpm exec vitest run src/modules/observable-request/__tests__
```
