# Repository: revo-admin

Admin UI for the Revisium agent orchestrator. React Router 8 static SPA, Chakra UI v3,
MobX, `@xyflow/react`, organized with Feature-Sliced Design (FSD).

## Stack

- React 19 + React Router 8 Framework SPA Mode (`ssr: false`) with static
  `build/client` output and no runtime SSR.
- Chakra UI v3 + Emotion; forced-light via Chakra props/system tokens (no color-mode toggle).
- MobX + `mobx-react-lite` and the `src/shared/lib/DIContainer` infrastructure are
  available for GraphQL-backed live state. The current prototype still contains
  presentational/static areas, but new live admin state must go through services
  and view models rather than direct component-owned IO.
- `@xyflow/react` for run-progress graphs, isolated to `*.client.tsx` modules.
- Vite 7 via the React Router Framework plugin; Vitest for unit tests; ESLint +
  Prettier + Steiger (FSD) gates.
- Package manager is pnpm 11.5.2. Do not reintroduce `package-lock.json`.

## Layout (FSD)

```text
src/
  root.tsx                 Framework document, app shell, and route error UI
  routes.ts                Framework route config (layout + all page routes)
  routes/                  Thin route modules (render page components)
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

DOM-measuring / browser-only widgets (xyflow) live in `*.client.tsx`. A thin
`*.tsx` wrapper renders a placeholder and mounts the `.client` module lazily in
the browser. Keep these boundaries so loading a route does not eagerly load
DOM-heavy graph code.

## Backend boundary

Use GraphQL over same-origin `/graphql`.

- Local dev: React Router's Vite dev server proxies `/graphql` HTTP requests
  and `/graphql/stream` multiplex SSE to the backend host.
- Production embedding: `@revisium/orchestrator` owns the HTTP server, mounts
  GraphQL and backend namespaces first, then serves `build/client/` and its
  guarded SPA fallback. No admin runtime server or separate admin port is
  needed; Framework SPA Mode has `ssr: false` and emits no `build/server`.
- Do not import `@revisium/client` or use Revisium/DBOS storage APIs from this
  app. The admin talks to the orchestrator GraphQL front door only.

## Source of truth (order)

1. `VERIFICATION.md` — gate commands.
2. This file — structure, stack, and conventions.
3. Workspace `../agent-playbook` — canonical roles, pipelines, method.

## Independent modules

`src/modules/<module>/index.ts` is the public entry for a standalone TypeScript
module. FSD organizes the application; module internals use responsibility-based
directories instead of FSD layers. Modules may import external non-UI packages
and other modules' public entries, but never application layers, application-generated SDKs,
React, routing, or the application DI container. Module-owned generated clients
are allowed inside their transport adapter. Constructor injection supplies
IO dependencies.

`dialogue-engine` owns engine lifecycle, commands, normalized state, event
projection, synchronization, agent configuration and backend/storage contracts.
GraphQL documents, its generated client, HTTP/domain subscription adapter and command-storage
implementation live inside the engine. `shared/api/dialogue` only configures
endpoint/storage and registers the engine in application DI. The root schema
snapshot is shared code-generation input, not a runtime dependency. `observable-request` owns the reusable MobX request
primitive; the existing shared exports remain compatibility entry points.

`graphql-subscriptions` owns the common multiplex SSE connection, leases, bounded queues,
heartbeat and reconnect lifecycle. The application registers one singleton shared by dialogue
and future features. Each domain owns its typed documents, snapshots and applied cursors;
there is no global topic registry. See the module README for the adapter contract.

Application consumers use module public exports. Dialogue-engine tests live in
`__tests__/`: engine, projection, transport, storage integration and support.
Keep application views and presentation view models out of these tests.
Production imports of test code are forbidden; there is no public test entry.
Vitest discovers the specs, and Sonar classifies helpers as test sources.

Dialogue-engine internal dependency direction: contracts
and errors are foundational; state depends on contracts; projection uses state;
commands use state and ports; synchronization applies events and snapshots;
lifecycle owns feeds and loading; resources expose state and actions; engine
composes them. Transport and storage adapters depend on contracts, never on
resources or engine composition.

## Dialogue presentation

The engine owns IO and dialogue state. View models expose presentation values
and actions, never engine records or transport handles. List models own stable
item models and dispose their pending requests with the list lifecycle.

- `entities/dialogue`: shared draft and scroll state per dialogue.
- `pages/assistant`: opening, read acknowledgement and page actions.
- `features/DiscussionComposer/model/agent`: agent selection and configuration fields.
- `features/DialogueInteractions/model/list` and `item`: pending requests and question forms.
- `widgets/DialogueTimeline/model/list`, `item` and `scroll`: grouping, message/activity presentation and scroll intent.
- `widgets/Layout/model/dialogue`: chat list and sidebar items.

React adapts DOM/router/viewport events and renders these models. Navigation
after creation and scroll-follow decisions belong to models. Presentation is verified manually in the browser; see `VERIFICATION.md`.
