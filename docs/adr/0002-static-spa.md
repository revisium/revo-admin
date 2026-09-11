# ADR 0002: Revo Admin as a static SPA

- Status: Accepted
- Date: 2026-09-11
- Supersedes: [ADR 0001](0001-ssr-engine-and-client-only-graphs.md)

## Context

Revo Admin is a local and self-hosted dashboard for the agent orchestrator. It
has no SEO or server-rendered content requirement. Its data is loaded by the
browser from the same backend GraphQL service, and the embedding backend owns
one HTTP boundary for both the dashboard and its API.

## Decision

- Keep React Router Framework Mode without runtime server rendering and publish
  the browser application as a static SPA.
- Keep browser GraphQL access behind the same-origin backend boundary and one
  embedding host. Preserve client-only isolation for DOM-measuring widgets so
  the build-time initial render remains safe.

The build and embedding mechanics are maintained in [REPOSITORY.md](../../REPOSITORY.md)
and [VERIFICATION.md](../../VERIFICATION.md), rather than being duplicated in
this decision record.

## Alternatives considered

- **Runtime SSR.** Rejected because this dashboard has no SEO requirement and
  would add a production server entrypoint and runtime coupling.
- **Declarative Mode with BrowserRouter.** Rejected because it would discard
  Framework Mode route modules and code splitting for no current benefit.
- **Per-route client rendering.** Rejected because the application is wholly a
  browser dashboard; one explicit SPA strategy is clearer.

## Consequences

- Production packaging contains static client assets only. The embedding host
  must provide a guarded SPA fallback for admin deep links while preserving
  backend-owned API boundaries.
- The initial document and hydration fallback must remain deterministic and free
  of browser-only globals or DOM-only imports.
- Route content is available only after browser JavaScript loads and hydration
  completes; this is an accepted trade-off for the local dashboard.
- The decision can be revisited if a concrete requirement appears, such as SEO,
  server-side authentication/session enforcement, server-rendered first paint
  on a constrained client, or another backend capability that cannot be
  implemented through the existing same-origin API. Reintroducing SSR would
  require a new ADR, an explicit server deployment contract, and a review of
  route data-loading boundaries; it is not implied by this decision.
