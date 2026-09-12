# revo-admin

Static SPA admin UI for the Revisium agent orchestrator, built with React,
React Router Framework SPA Mode, Chakra UI, and MobX.

## Local development

Use Node 24 and Corepack. Run
[revo-core](https://github.com/revisium/revo-core#local-development) separately
on `http://127.0.0.1:19222`.

```sh
nvm install 24
nvm use 24
corepack enable
pnpm install --frozen-lockfile
pnpm run dev
```

Open `http://localhost:5173`. React Router's Vite dev server proxies `/graphql`
and `/graphql/stream` to the local backend. The browser uses the same-origin
GraphQL boundary in development and in production.

## Configuration

Defaults live in `.env/.env.development`. Put local overrides in the ignored
`.env/.env.development.local` file:

```sh
cp .env/.env.development.local.example .env/.env.development.local
```

- `REVO_DEV_GRAPHQL_PORT`: local backend port, default `19222`.
- `REVO_ADMIN_GRAPHQL_TARGET`: backend origin for the development proxy.
- `REVO_ADMIN_PORT`: React Router dev-server port, default `5173`.
- `REACT_APP_GRAPHQL_SERVER_URL`: public GraphQL URL embedded at build time,
  default `/graphql`.

Backend proxy variables are used by the dev-server configuration only. The
public variable is the only GraphQL setting exposed to browser code.

## Package contract

Install the current prerelease line through the `alpha` dist-tag:

```sh
npm install @revisium/revo-admin@alpha
```

An embedding Node.js host resolves the installed static build through the
public runtime export:

```js
import { getRevoAdminClientDirectory } from '@revisium/revo-admin/runtime'

const clientDirectory = getRevoAdminClientDirectory()
```

`getRevoAdminClientDirectory()` returns the absolute `build/client` directory
inside the installed package. Consumers do not need to inspect `node_modules`,
assume a package-manager layout, or import source files. The published package
contains only:

```text
build/client/index.html
build/client/assets/*
runtime/index.js
runtime/index.d.ts
README.md
LICENSE
```

The embedding host serves files from that directory and returns `index.html`
for application deep links after reserving `/graphql`, `/graphql/stream`,
`/api`, `/mcp`, and `/health`.

## Verification and packaging

Run `pnpm run verify` before handoff. See [VERIFICATION.md](VERIFICATION.md)
for the gates and [REPOSITORY.md](REPOSITORY.md) for architecture and
boundaries.

`pnpm run build` creates the self-contained static client. `ssr` is disabled in
`react-router.config.ts`; this package has no runtime SSR or admin server.
