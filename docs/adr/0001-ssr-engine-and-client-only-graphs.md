# ADR 0001: SSR engine and client-only graph widgets

- Status: Superseded by [ADR 0002](0002-static-spa.md)
- Date: 2026-06-13

## Context

`revo-admin` is a new admin UI for the agent orchestrator. We need
a rendering engine that supports server-rendered routes for fast first paint and
crawlable shells, while still hosting interactive, DOM-measuring widgets such as
the run-progress DAG built on `@xyflow/react`. xyflow reads layout from the live
DOM and `window`, so it cannot render meaningfully during server rendering.

The sibling `revisium-admin` app is a client-side SPA; this app intentionally
diverges to gain SSR.

## Decision

- Use **React Router v7 in SSR mode** (`ssr: true`, `appDirectory: 'src'`) as the
  rendering engine. Routes render on the server and hydrate on the client.
- Establish a **`.client.tsx` boundary** for any widget that must measure the DOM
  or depends on browser-only APIs (xyflow first). All xyflow imports — including
  `import '@xyflow/react/dist/style.css'` — live in a `*.client.tsx` module that
  React Router v7 excludes from the server bundle.
- Each such widget exposes a thin SSR-safe `*.tsx` wrapper that renders a
  fixed-size placeholder, detects hydration with `useHydrated`
  (`useSyncExternalStore`), and only then lazily imports and mounts the `.client`
  module. The slice exposes a single `index.ts` public API.
- A `.client` module is never imported from a route loader, server module, or any
  module reachable during server rendering.

## Alternatives considered

- **CSR-only SPA (as in `revisium-admin`).** Simpler client boundary, but loses
  server rendering and the shared SSR shell we want for this surface.
- **Runtime `isClient()` gate inside one component.** Keeps xyflow in the server
  bundle and risks accidental server-side evaluation of browser-only code; the
  build cannot prove the boundary.
- **Per-route `ssr: false`.** Disables SSR for whole routes that may also contain
  server-renderable content; too coarse for a widget-level concern.

## Consequences

- xyflow and other DOM-measuring widgets are guaranteed out of the server bundle;
  the build itself enforces the boundary via the `.client` convention.
- A brief placeholder renders for client-only widgets until hydration completes;
  containers reserve height to avoid layout shift.
- New DOM-measuring widgets must follow the same `*.client.tsx` + SSR-safe wrapper
  pattern; the `RunProgressGraph` widget is the reference implementation and the
  seed of the real `/runs/:runId` DAG.
