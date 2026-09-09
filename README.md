# revo-admin

The Revo admin UI, built with React Router, Chakra UI, and MobX.

## Local development

Use Node 24 and Corepack. Run [revo-core](https://github.com/revisium/revo-core#local-development)
separately on its default `http://127.0.0.1:19222`. Its README covers PostgreSQL,
migrations, and agent authentication. Both repositories install their runtime dependencies
from npm; no sibling package builds are needed.

In this repository:

```sh
nvm install 24
nvm use 24
corepack enable
pnpm install --frozen-lockfile
pnpm run dev
```

Open `http://localhost:5173`. No environment prefixes are needed: Vite proxies `/graphql`
and `/graphql/stream` to the backend on port **19222**, and SSR uses the same backend.
Each browser tab shares one SSE connection across feature subscriptions.

To open the UI from another device on your local network:

```sh
pnpm run dev --host 0.0.0.0
```

Visit `http://<computer-ip>:5173`. The backend can stay on `127.0.0.1`; the dev server
forwards browser requests.

## Local configuration

Defaults live in `.env/.env.development`. Override them in the ignored
`.env/.env.development.local`; restart the dev server after changes.

```sh
cp .env/.env.development.local.example .env/.env.development.local
```

- `REVO_DEV_GRAPHQL_PORT`: local backend port, default `19222`.
- `REVO_ADMIN_GRAPHQL_TARGET`: backend origin when a different host is needed.
- `REVO_ADMIN_GRAPHQL_ENDPOINT` or `REVO_ADMIN_GRAPHQL_HTTP_URL`: explicit GraphQL URL ending in `/graphql`.
- `REVO_ADMIN_PORT`: frontend port, default `5173`.

Process environment overrides local files. Backend settings apply to the development proxy,
SSR, and schema downloads; they are not exposed as browser environment variables.
The older `dev:full` and `backend:*` helpers are for an `agent-orchestrator` checkout,
not the two-repository setup above.

## Development contracts

Run `pnpm run verify` before handoff. See [VERIFICATION.md](VERIFICATION.md) for gates,
[REPOSITORY.md](REPOSITORY.md) for boundaries, and the
[subscription guide](src/modules/graphql-subscriptions/README.md) for adding a subscription.
React components use registered services and view models rather than calling GraphQL directly.

GraphQL schemas and SDKs are checked in. Run `pnpm run gql:codegen` after editing operations.
With Core running, `pnpm run gql:codegen:download` refreshes the schema from port 19222.

`pnpm run build` produces `build/server/index.js` and `build/client/`. An embedding host
mounts `/graphql` and `/graphql/stream` before the admin SSR fallback and serves the client
assets on the same origin. The frontend build does not start a backend.
