# Verification: revo-admin

## Canonical check

Run before every handoff, commit, or PR update:

```bash
pnpm run verify
```

`verify` runs the gates in order and fails fast:

1. `format:check` — `prettier --check` over ts/tsx/js/json/md/yml/yaml/css/html.
2. `gql:codegen:check` — verify the typed GraphQL SDK matches the checked-in
   schema snapshot and fail on drift in the application SDK and the dialogue engine
   SDK/typed documents under `transport/graphql/__generated__/`.
3. `ts:check` — `tsc --noEmit` (strict).
4. `lint:ci` — `eslint "{src,tests}/**/*.{ts,tsx}" --max-warnings 0`
   (zero warnings allowed).
5. `fsd:check` — `steiger src` (Feature-Sliced Design boundary checks).
6. `test:unit` — `vitest run`.
7. `build` — `react-router build`; must produce `build/server` and `build/client`.

## GraphQL checks

Run after any schema, operation, service, or view-model change:

```bash
pnpm run gql:codegen
pnpm run gql:codegen:check
pnpm run test:unit -- tests/graphql-system.spec.ts
```

Schema snapshot refresh against a running local GraphQL host:

```bash
# Start revo-core separately using its README.
pnpm run gql:codegen:download
pnpm run gql:codegen
```

The default download endpoint is `http://127.0.0.1:19222/graphql`. Override with
`REVO_ADMIN_GRAPHQL_ENDPOINT` or `.env/.env.development.local` when testing
another host.

## Local env files

Development env files are loaded from `.env/` by Vite, backend helper scripts,
and GraphQL codegen:

- `.env/.env.development` is tracked.
- `.env/.env.development.local.example` is tracked.
- `.env/.env.development.local` and other `*.local` env overrides are ignored.

The standard development backend is `revo-core` on port `19222`; start it using
its README. `pnpm run dev` proxies GraphQL and configures SSR from these env
files. Process environment values take precedence. The legacy `backend:*` and
`dev:full` helpers target an adjacent `agent-orchestrator` checkout instead.

## Frontend MVVM checks

This repo uses React + MobX + MVVM + DI + FSD. Use the approved references in
`AGENTS.md` when changing UI, state, services, or generated GraphQL code.

Expected local coverage by surface:

- Every changed React surface: review the diff against the `Boundaries` in
  `AGENTS.md`.
- React-only presentational change: `pnpm run ts:check`, `pnpm run lint:ci`,
  `pnpm run fsd:check`, and `pnpm run build`; add browser/manual smoke when
  layout, interaction, or SSR visibility changes.
- Views and presentation view models: use browser/manual verification for
  loading, errors, actions, navigation, and responsive behavior. Do not add
  automated presentation tests for now; automated tests cover domain models,
  engine logic, transport, and storage.
- Service or GraphQL client change: generated SDK drift check plus unit coverage
  at the service boundary; do not mock private internals.
- FSD boundary or DI composition change: `pnpm run fsd:check` plus targeted
  unit tests proving dependencies can be replaced at constructor/composition
  boundaries.
- User-visible workflow change: run the aggregate `pnpm run verify`; add local
  backend/browser smoke when GraphQL, routing, SSE, or SSR behavior is
  involved.

Quality blockers:

- React components directly calling generated GraphQL SDK methods.
- JSX components owning loading/error/retry behavior that belongs in a view
  model.
- View models doing raw GraphQL transport or environment parsing instead of
  delegating to services.
- Services importing React or Chakra UI.
- Generated artifacts changed without `gql:codegen:check`.

## Test design

- Each test verifies one externally meaningful behavior. Several assertions may
  establish that behavior; split unrelated failure and lifecycle scenarios.
- Keep actions and assertions at one abstraction level. Domain tests use domain
  fixtures; transport tests may inspect HTTP/SSE when the wire behavior matters.
  Put server setup, request scheduling, and cleanup in fixture helpers.
- Reuse existing fixtures. Keep helpers for one suite together; extract another
  file only for reuse or a substantial separate responsibility. Keep expected
  values explicit in tests instead of hiding them behind assertion wrappers.
- Test our public contracts, adapters, and regressions with a meaningful failure
  signal. Do not duplicate library conformance or the same happy path at several
  layers without a distinct integration risk.
- Views and presentation view models remain covered by browser/manual checks.

## CI gates (`.github/workflows/ci.yml`)

- `corepack enable && pnpm install --frozen-lockfile --ignore-scripts` then `pnpm run verify`.
- SonarCloud scan with `-Dsonar.qualitygate.wait=true` (uses `SONAR_TOKEN`).
- On pull requests, `pnpm run sonar:issues:local` inspects open Sonar issues.

## Notes

- Do not loosen `--max-warnings 0`, disable Sonar in CI, or relax Steiger rules
  beyond `fsd/insignificant-slice`.
- Do not hand-edit files in `src/__generated__`; update the schema or `.graphql`
  documents and rerun codegen.
- Install must be peer-clean; do not use `--legacy-peer-deps`.
- Local SonarCloud runs: copy `.env.sonar.example` to `.env.sonar`, then
  `pnpm run sonar:local` / `pnpm run sonar:issues:local` (requires Docker).
