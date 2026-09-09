# revo-admin

Admin UI for the Revisium agent orchestrator.

Built with React Router v7 (SSR), Chakra UI v3, MobX, and `@xyflow/react`,
organized with Feature-Sliced Design.

## Getting started

```sh
nvm use            # Node 24.11.1 (see .nvmrc)
corepack enable
pnpm install       # peer-clean; do not use --legacy-peer-deps
pnpm run dev       # start the React Router dev server
```

## Local development with backend

Development env files live in `.env/`, matching the other Revisium frontends:

- `.env/.env.development` — checked-in defaults for adjacent repo development;
- `.env/.env.development.local.example` — local override template;
- `.env/.env.development.local` — ignored machine-local overrides.

The admin uses same-origin GraphQL paths in development:

- browser HTTP: `/graphql`;
- browser subscriptions: one multiplex SSE connection at `/graphql/stream`;
- Vite proxies both paths to the configured GraphQL host.

Default local ports:

| Process             | URL                              |
| ------------------- | -------------------------------- |
| Admin dev server    | `http://127.0.0.1:5173/`         |
| GraphQL host        | `http://127.0.0.1:19323/graphql` |
| Revisium daemon     | `http://127.0.0.1:19322/`        |
| Embedded PostgreSQL | `127.0.0.1:15540`                |

Start everything for UI development:

```sh
pnpm run dev:full
```

Or run the backend pieces explicitly:

```sh
pnpm run backend:start   # start Revisium daemon and bootstrap control-plane tables
pnpm run backend:serve   # start the GraphQL host on :19323
pnpm run dev             # start React Router dev server with /graphql proxy
pnpm run backend:stop    # stop the repo-local Revisium daemon
```

Do not run the global `revo` binary from this repository:

```sh
# Wrong: can make standalone try to read the .env/ directory as a file.
revo revisium start
```

For source-development against the adjacent orchestrator checkout, use the admin
scripts above or run Revo from the orchestrator repository:

```sh
cd ../agent-orchestrator
./bin/revo.js revisium start
./bin/revo.js serve --port 19223
```

The local backend helper refuses global `REVO_CLI` values by default. Use
`REVO_CLI=../agent-orchestrator/bin/revo.js` in `.env/.env.development.local`.
Set `REVO_ALLOW_GLOBAL_REVO=1` only when intentionally testing a globally
installed package from an isolated working directory.

The backend data lives under `.revo/dev` by default. This keeps local UI
development separate from the dogfooding daemon under `~/.revisium-orchestrator`.

Useful overrides:

```sh
cp .env/.env.development.local.example .env/.env.development.local
pnpm run dev:full
REVO_DEV_KEEP_BACKEND=1 pnpm run dev:full
```

## GraphQL client development

GraphQL schema and operation types are checked in:

- `src/__generated__/schema.graphql` — schema snapshot from `orchestrator`;
- `src/shared/api/**/*.graphql` — hand-written operations;
- `src/__generated__/graphql-request.ts` — generated typed SDK.

Update the generated SDK after editing operations:

```sh
pnpm run gql:codegen
```

Refresh the schema snapshot from a running local backend:

```sh
pnpm run backend:start
pnpm run backend:serve
pnpm run gql:codegen:download
pnpm run gql:codegen
```

React components should not call the generated SDK directly. Use
`src/shared/api/graphql` for transport, then expose data through services and
MobX view models registered in `src/shared/lib/DIContainer`.

All feature subscriptions share one DI-owned SSE connection. See the
[subscription guide](src/modules/graphql-subscriptions/README.md) for registration and lifecycle ownership.

## Common scripts

- `pnpm run dev` — start the React Router dev server.
- `pnpm run dev:full` — start repo-local backend, GraphQL host, and admin dev server.
- `pnpm run backend:start` — start and bootstrap the repo-local Revisium daemon.
- `pnpm run backend:serve` — start the GraphQL host.
- `pnpm run backend:stop` — stop the repo-local Revisium daemon.
- `pnpm run gql:codegen` — regenerate GraphQL SDK from checked-in schema and operations.
- `pnpm run gql:codegen:download` — refresh `src/__generated__/schema.graphql` from backend.
- `pnpm run build` — production SSR build (`build/server` + `build/client`).
- `pnpm run start` — serve the production build.
- `pnpm run verify` — full local gate (format, types, lint, FSD, tests, build).

## Embedded SSR package contract

The published package is `@revisium/revo-admin`. Its production build is
prepared for embedding into `@revisium/orchestrator`:

```text
build/server/index.js   # React Router SSR server bundle
build/client/**         # browser assets
```

The orchestrator host should own the single HTTP server, mount GraphQL before the
admin fallback, and serve the admin on the same origin:

```text
/graphql         -> Yoga HTTP queries and mutations
/graphql/stream  -> Yoga multiplex GraphQL SSE
/assets   -> admin client assets
/*        -> React Router SSR
```

See `VERIFICATION.md` for gate details, `REPOSITORY.md` for structure, and
`docs/adr/` for architecture decisions.
