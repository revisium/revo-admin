# Review policy: revo-admin

## Before review

- `pnpm run verify` is green locally.
- CI and the SonarCloud quality gate are green on the PR.

## Review focus

- **Layering (FSD).** Renderer components and widgets render and wire events
  only. Business behavior, async orchestration, validation, URL construction, and
  derived read-models belong in view models / services / loaders. Cross-slice
  imports go through `index.ts` public APIs.
- **Client-only boundary.** xyflow and other DOM-measuring code stay in
  `*.client.tsx`; no `.client` import from route modules or initial-render
  modules. Wrappers render a placeholder until hydration.
- **Theme.** Styling through Chakra props and `system` tokens / `textStyles`;
  forced light, no color-mode toggle; no inline-style theming (the `globalCss`
  outline rules are the only raw CSS).
- **States.** Loading, empty, error, success, permission, and narrow-viewport
  states are preserved for any touched UI.
- **Tests.** Non-trivial behavior has real behavior tests.

## Blocking conditions

- Red CI or SonarCloud quality gate.
- New lint warnings (gate is `--max-warnings 0`).
- Steiger violations (other than the allowed `fsd/insignificant-slice`).
- Suppressions used to bypass lint or review findings.

## Threads

Answer PR review threads in-thread; resolve only after validation.
