# revo-admin

Admin UI for the Revisium agent orchestrator. This repository is a child of the
Revisium workspace and follows the canonical agent playbook in the workspace
`../agent-playbook` directory.

## Context

- Canonical roles, pipelines, and method live in the workspace
  `../agent-playbook`.
- This file holds only repo-specific facts; it does not redefine roles.
- Repo-local overlays win for concrete commands, paths, policies, and domain
  facts. Canonical roles and pipelines stay in `../agent-playbook`.

## Repo-local overlays

- `REPOSITORY.md` — structure and source-of-truth order.
- `VERIFICATION.md` — exact verification commands and quality gates.
- `REVIEW.md` — review policy.
- `docs/adr/` — architecture decision records.

## Pull requests

Write pull request descriptions in English. A description represents the final
change; it is not a restatement of the diff or a work log.

`Description` is required. Add `Manual validation` only for a user or business
scenario checked outside automated tests and CI. Add `Notes for the reviewer`
only for a specific review focus, non-obvious risk, or deliberate tradeoff. Do
not list automated verification commands or their results in the pull request
description — `VERIFICATION.md` owns those and CI reports them. Do not hard-wrap
prose in the pull request body; let GitHub wrap it for display.

Create a new pull request from the repository template:

```sh
gh pr create --template .github/pull_request_template.md
```

If the runner cannot open the interactive editor, fill the same template in a
temporary file and pass it through `--body-file`. Do not replace the template
with `--fill` or an ad hoc `--body`.

After updating the branch of an open pull request and before handing it back for
review, compare the description with the final diff against the base branch.
Update it when the outcome, scope, public contract, compatibility impact,
related documents, or review focus changed. Remove stale claims and questions.
Do not append a change log: the description always represents the current pull
request. Leave an accurate description unchanged, and preserve relevant text
added by a human.

## Selected playbook references

Use these references from `../agent-playbook` for this repository:

- `references/quality/readable-code.md`
- `references/quality/idiomatic-code.md`
- `references/quality/minimal-sufficient-code.md`
- `references/quality/verification.md`
- `stacks/js-ts/references/idiomatic-js-ts.md`
- `stacks/js-ts/references/react-mobx-mvvm.md`
- `stacks/js-ts/references/react-ui-boundary.md`
- `stacks/js-ts/references/mvvm-frontend.md` — canonical presentation contract
  and public view-model boundary rules (`Hard Rules`).
- `stacks/js-ts/references/mobx-reactivity.md`
- `stacks/js-ts/references/frontend-di-composition.md`
- `stacks/js-ts/references/frontend-fsd.md`
- `stacks/js-ts/references/graphql-api.md`
- `stacks/js-ts/references/verification.md`

## Required workflow

- Inspect the relevant code before editing.
- Use `VERIFICATION.md` for the canonical local checks.
- When GraphQL operations, schema snapshots, generated SDK, or GraphQL services
  change, run the GraphQL checks in `VERIFICATION.md` before broader `verify`.
- Run local verification before commit.
- Check CI, SonarCloud, and review threads after push.

## Boundaries

- Use same-origin `/graphql` for backend access. Local development proxies that
  path to `revo serve`; production embedding mounts GraphQL on the same host.
- Keep general-purpose GraphQL transport in `src/shared/api/graphql`. Feature/page code must go
  through service/view-model classes registered in `src/shared/lib/DIContainer`;
  do not call generated SDK methods from React components.
- React components render state and wire events only. Components may derive
  trivial display text, but loading, refresh, expected failures, and product
  visible state transitions belong in services or MobX view models.
- React components do not own workflow logic, option or suggestion arrays,
  filtering, derived labels, state-dependent copy, or submission decisions.
  Put these in a MobX view model and keep the component limited to rendering
  model state and wiring user events.
- Declare component props with a named `interface`; do not use inline object
  types in component signatures.
- Put each new React component in its own file. Do not add a second component
  to an existing component file; extract it and import it instead.
- Use MobX view models for live admin state. Components observe view models via
  `useViewModel`; view models own observable state, derived state, UI actions,
  and lifecycle. Services own IO and generated clients.
- View-model async requests use the existing `ObservableRequest`: derive loading,
  data, and error state from the request instead of duplicating its lifecycle
  manually, and call `abort()` on owned requests during disposal. This suppresses
  late results; do not claim transport cancellation unless the transport receives
  and honors an abort signal. Keep form validation and submission guards in their
  existing owners.
- Follow the existing DI boundary. Concrete services and view models are
  registered in `src/shared/lib/DIContainer`; units that need tests should
  accept dependencies through constructors instead of reading globals directly.
  Resolve each constructor dependency into a named local inside the registration
  factory, then pass those locals to `new Model(...)`. Do not resolve dependencies
  in constructor defaults. Preserve the registered lifetime when changing wiring.
- Group data and model type contracts by responsibility: use local `model/types.ts`
  for one cohesive group, or `<responsibility>.types.ts` for independent groups
  in the same directory. Avoid one file per type and a shared `types` dump.
  Private one-off types and component props may stay colocated with their owner.
  Keep runtime functions, constants, and enums out of type-only files.
- Independent engines live in `src/modules/<module>` outside FSD. Follow the
  module boundary contract in `REPOSITORY.md`. Keep dialogue-engine tests and helpers under its `__tests__/` directory;
  see the module README for the layout.
- Keep scenario tests focused on observable behavior. Put request scheduling and
  fixture construction in test support; keep actions and assertions explicit.
  Protocol-level tests retain the wire details and timing they verify.
- Order class members as fields, constructor (when needed), public getters and
  methods, then protected/private methods. Apply the same order to test helpers.
- Separate class methods and meaningful execution phases with blank lines,
  including before guards and after their early-return blocks.
- Keep each method at one level of abstraction. Orchestration methods name
  the steps of a use case; cursor handling, state mutation, pagination,
  request bookkeeping and protocol details belong in focused methods or
  collaborators. Do not inline those implementations into orchestration.
  Extract meaningful operations, not wrappers that merely rename a statement.
- Preserve Feature-Sliced Design import direction. Shared API/client code stays
  in `shared`, domain read models/services in `entities`, user actions in
  `features`, composed blocks in `widgets`, and routes/screens in `pages`.
- Check in `src/__generated__/schema.graphql` and
  `src/__generated__/graphql-request.ts`. Treat generated drift as a failing
  quality gate, not as an optional local artifact.
- Dialogue GraphQL operations, generated client, HTTP/SSE transport and command
  persistence belong in `src/modules/dialogue-engine`. Shared owns only its
  application composition: endpoint, storage provider and DI registration.
- Do not import `@revisium/client` or read Revisium/DBOS state directly from the
  admin app.
- xyflow and other DOM-measuring widgets live only in `*.client.tsx` modules and
  are never imported server-side (see `docs/adr/0001`).
- Theme via Chakra props and `system` tokens / `textStyles`; forced light, no
  color-mode toggle.
