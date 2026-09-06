# Repository: revo-admin

Admin UI for the Revisium agent orchestrator. React Router v7 (SSR), Chakra UI v3,
MobX, `@xyflow/react`, organized with Feature-Sliced Design (FSD).

## Stack

- React 19 + React Router v7 in SSR mode (`react-router.config.ts`).
- Chakra UI v3 + Emotion; forced-light via Chakra props/system tokens (no color-mode toggle).
- MobX + `mobx-react-lite` and the `src/shared/lib/DIContainer` infrastructure are
  available for GraphQL-backed live state. The current prototype still contains
  presentational/static areas, but new live admin state must go through services
  and view models rather than direct component-owned IO.
- `@xyflow/react` for run-progress graphs, isolated to `*.client.tsx` modules.
- Vite 7 build; Vitest for unit tests; ESLint + Prettier + Steiger (FSD) gates.
- Package manager is pnpm 11.5.2. Do not reintroduce `package-lock.json`.

## Layout (FSD)

```text
src/
  root.tsx                 App shell: Chakra forced light, ErrorBoundary
  routes.ts                Route table (layout + all page routes)
  routes/                  Thin RR7 route modules (render page components)
  pages/                   Page slices (ui/ + index.ts), presentational only
    dashboard/ runs-board/ run-create/ run-detail/
    inbox/ inbox-item/
    method-roles/ method-role-detail/ method-pipelines/
    method-pipeline-detail/ method-playbooks/ run-graph-smoke/
  widgets/                 Composite UI slices (ui/ + index.ts)
    Layout/                Nav shell with <Outlet/>
    RunsBoard/ CreateRunWizard/ CostPanel/
    InboxList/ GateResolutionPanel/
    RolesList/ PipelinesList/ PlaybooksList/
  features/                Reusable leaf slices (ui/ + index.ts)
    RunCard/ RunProgressGraph/ RoutePreviewGraph/ PipelineGraph/
    # imported by multiple widgets; widget->widget imports are FSD-forbidden,
    # so these shared leaves drop to the lower features/ layer.
    # RunProgressGraph/RoutePreviewGraph/PipelineGraph are xyflow DAGs (*.client.tsx).
  shared/
    api/                   GraphQL transport/client code and system API services
      graphql/
      system/
    lib/                   DIContainer, hooks (useViewModel/useService/useHydrated)
    ui/                    Theme, status tokens, presentational atoms, Toaster
    fixtures/              Static prototype data modeled on the control-plane schema
```

Every slice exposes a `ui/` segment and an `index.ts` public API. Cross-slice
imports go through `index.ts`, enforced by Steiger.

## Client-only boundary

DOM-measuring / browser-only widgets (xyflow) live in `*.client.tsx`, which React
Router v7 excludes from the server bundle. A thin `*.tsx` wrapper renders an
SSR-safe placeholder and mounts the `.client` module after hydration. Never import
a `.client` module from a route loader or any server-reachable module. See
`docs/adr/0001-ssr-engine-and-client-only-graphs.md`.

## Backend boundary

Use GraphQL over same-origin `/graphql`.

- Local dev: Vite proxies `/graphql` HTTP and WS to the `revo serve` host.
- Production embedding: `@revisium/orchestrator` owns the HTTP server, mounts
  GraphQL first, then mounts the React Router SSR admin fallback.
- Do not import `@revisium/client` or use Revisium/DBOS storage APIs from this
  app. The admin talks to the orchestrator GraphQL front door only.

## Source of truth (order)

1. `docs/adr/` — architecture decisions.
2. `VERIFICATION.md` — gate commands.
3. `REVIEW.md` — review policy.
4. This file — structure and conventions.
5. Workspace `../agent-playbook` — canonical roles, pipelines, method.
