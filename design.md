# Revo Admin Design System

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| Version       | `0.3.0`                                                      |
| Status        | **Draft**                                                    |
| Direction     | **Revisium Monochrome**                                      |
| Last updated  | `2026-09-03`                                                 |
| Applies to    | `revo-admin` product UI                                      |
| Document type | Living visual and interaction contract for humans and agents |

This document defines how Revo Admin should look and behave at the design-system
level. It is intentionally narrower than a product UX specification: product
behavior comes from `revo-docs`, while this file supplies the visual language,
component contracts, state grammar, responsive rules, and implementation
guardrails.

The document follows the agent-readable structure popularized by
[Awesome DESIGN.md](https://github.com/VoltAgent/awesome-design-md/), but it does
not copy the visual identity of any design in that collection.

## 1. Authority and scope

### 1.1 Source-of-truth order

Use the sources in this order for their own concerns:

1. Product meaning and behavior:
   [`../revo-docs/product/`](../revo-docs/product/),
   [`../revo-docs/requirements/`](../revo-docs/requirements/), and
   [`../revo-docs/ux/`](../revo-docs/ux/).
2. Visual language and component presentation: this `design.md`.
3. Repository architecture and delivery rules: [`AGENTS.md`](AGENTS.md),
   [`REPOSITORY.md`](REPOSITORY.md), [`VERIFICATION.md`](VERIFICATION.md), and
   [`docs/adr/`](docs/adr/).
4. Existing implementation: `src/pages/`, `src/widgets/`, `src/features/`, and
   `src/shared/ui/` as a reusable inventory, not as product or visual authority.

If these sources disagree, do not reconcile them by intuition. Preserve the
higher-authority contract and raise the conflict. In particular:

- the current Revo Admin is a vibe-coded prototype and visual inventory;
- [`docs/design-tokens.md`](docs/design-tokens.md) documents the prototype's
  warm/rust token set and is not the target visual direction;
- `../revo-docs/legacy/` is historical material and is not a source for new UI;
- a route, widget, fixture, or label in the prototype does not confirm a product
  requirement.

### 1.2 Status model

The governing UX documents `UX-001` through `UX-004` are Draft. Consequently,
this document is also Draft. “Current” below means the working baseline that is
safe to design against now; it does not upgrade the source UX documents to
Accepted.

### 1.3 Current confirmed surface

The current information architecture is Project-centered:

```text
Projects
├── Project list
│   └── Create project
└── Project shell
    ├── Overview
    ├── Records
    ├── Workspaces
    ├── Runs
    ├── Activity
    └── Settings
        ├── Edit details
        ├── Archive project
        └── Restore project
```

The working contract includes:

- `Projects`: search by name or ID, `Include archived`, creation, and the
  loading, empty, no-results, initial-error, continuation-loading, and
  continuation-error states;
- `Create project`: name, optional description, validation, pending, and error
  states;
- a persistent Project shell identified by stable `projectId`;
- `Overview`, the six-section Project navigation, and stable canonical URLs;
- Project details, archive, and restore behavior in `Settings`;
- a reversible archive lifecycle: archived Projects retain their identity and
  content, remain navigable and read-only, and expose `Restore project`;
- partial failure isolation: an error in one summary card or continuation page
  does not replace otherwise usable page content.

Canonical routes:

| Surface          | URL                               |
| ---------------- | --------------------------------- |
| `Projects`       | `/projects`                       |
| `Create project` | `/projects/new`                   |
| `Overview`       | `/projects/:projectId`            |
| `Records`        | `/projects/:projectId/records`    |
| `Workspaces`     | `/projects/:projectId/workspaces` |
| `Runs`           | `/projects/:projectId/runs`       |
| `Activity`       | `/projects/:projectId/activity`   |
| `Settings`       | `/projects/:projectId/settings`   |

Project URLs use `projectId`, never a mutable name. Rename, archive, and restore
must not change the Project URL. Search uses `q`; the archived filter uses
`includeArchived=true`.

### 1.4 Out-of-scope and unresolved boundaries

The following boundaries are visible but not designed as detailed flows here.
This inventory is not a roadmap, delivery promise, or commitment to expose a
prototype route in the product.

| Boundary                                       | Current safe treatment                                                                           | Required before expansion                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| `Records`                                      | Preserve its shell route and Project context; do not invent inner screens or actions             | Dedicated UX linked to governing REQ                |
| `Workspaces`                                   | Preserve its shell route and Project context; do not invent connection or file flows             | Dedicated UX linked to governing REQ                |
| `Runs`                                         | Preserve its shell route and Project context; `Create run` may link to an already specified flow | Dedicated UX for list, creation, detail, and states |
| `Activity`                                     | Preserve its shell route and Project context; do not invent audit filtering or detail flows      | Dedicated UX linked to Audit Event requirements     |
| Prototype-derived non-Project routes           | Out of scope; do not expose them as product destinations or infer a global IA                    | Governing REQ, UX, and an explicit IA decision      |
| Graphs, diffs, editors, logs, and dense tables | Reuse the base tokens and accessibility rules only                                               | Surface-specific component extension and UX states  |

“Future” in this document means unresolved and outside the current scope; it
does not mean planned. No new surface may be inferred from the prototype alone.
New surfaces require a linked UX and governing REQ, reuse the semantic tokens
and component contracts in this document, and preserve compatibility with the
Project URL and IA model unless a later approved decision explicitly replaces
it.

## 2. Visual theme and atmosphere

### 2.1 Direction: Revisium Monochrome

Revo Admin is a calm, precise operational interface. Its visual language is
derived from the public [Revisium](https://revisium.io/) presence:

- white and near-white surfaces;
- dark neutral ink for identity and action;
- restrained typography;
- thin dividers;
- generous whitespace;
- minimal depth.

Brightness comes from whitespace and the contrast between white surface and
dark ink. It does not come from saturated accents.

### 2.2 Design principles

1. **Meaning before decoration.** Hierarchy comes from order, type, spacing,
   and contrast.
2. **One Project context.** Project name, status, stable ID, and current section
   remain legible through navigation and state changes.
3. **Quiet chrome, clear actions.** Navigation recedes; the current task and its
   primary action remain obvious.
4. **Local failure, local recovery.** A recoverable card, form, or continuation
   error stays near the failed unit.
5. **Monochrome is not low contrast.** Text, focus, selection, and state remain
   explicit without relying on hue.
6. **Density is earned.** Operational data may be compact, but controls and
   labels keep readable spacing and stable alignment.

### 2.3 Explicit exclusions

Do not introduce:

- blue, rust, terracotta, teal, or other brand accents;
- the Anthropic/Claude-inspired warm theme from the prototype;
- gradients, glass effects, glows, neon, or decorative color washes;
- a dark theme or color-mode toggle;
- decorative illustrations as a substitute for useful empty-state copy;
- heavy shadows or card lift as the main hierarchy mechanism;
- arbitrary one-off colors in components.

## 3. Color system

### 3.1 Primitive palette

These are the complete base colors for this version. Components consume
semantic roles, not primitive names or raw hex values.

| Primitive           | Value     | Purpose                                             |
| ------------------- | --------- | --------------------------------------------------- |
| `palette.ink`       | `#171717` | Primary text, selected state, primary action, focus |
| `palette.white`     | `#FFFFFF` | Main surface, inverse text                          |
| `palette.canvas`    | `#F9F9F9` | Application canvas                                  |
| `palette.subtle`    | `#F5F5F5` | Quiet fills, hover, disabled or archived surface    |
| `palette.divider`   | `#E5E5E5` | Structural dividers, separators, skeleton blocks    |
| `palette.secondary` | `#525252` | Secondary text and strong neutral boundary          |
| `palette.muted`     | `#737373` | Nonessential metadata and default control boundary  |

`palette.ink` may be used with documented alpha only for scrims and shadows.
Alpha-derived values are not new brand colors.

### 3.2 Semantic roles

Target token names describe intent. The Chakra theme may map them to its local
token shape, but components must reference the semantic role.

| Semantic token                    | Resolves to           | Usage                                          |
| --------------------------------- | --------------------- | ---------------------------------------------- |
| `colors.bg.canvas`                | `palette.canvas`      | App background                                 |
| `colors.bg.surface`               | `palette.white`       | Cards, forms, main panels                      |
| `colors.bg.subtle`                | `palette.subtle`      | Quiet group, hover, archived badge             |
| `colors.bg.inverse`               | `palette.ink`         | Selected item and primary action               |
| `colors.fg.default`               | `palette.ink`         | Primary text and icons                         |
| `colors.fg.secondary`             | `palette.secondary`   | Supporting copy and metadata on subtle fills   |
| `colors.fg.muted`                 | `palette.muted`       | Nonessential metadata on white or canvas only  |
| `colors.fg.inverse`               | `palette.white`       | Text on ink                                    |
| `colors.border.structural`        | `palette.divider`     | Noninteractive separation and grouping         |
| `colors.border.control`           | `palette.muted`       | Default author-styled control boundary         |
| `colors.border.strong`            | `palette.secondary`   | Hovered control or emphasized neutral boundary |
| `colors.action.primary.bg`        | `palette.ink`         | Primary button                                 |
| `colors.action.primary.hoverBg`   | `palette.secondary`   | Primary button hover                           |
| `colors.action.primary.fg`        | `palette.white`       | Primary button text/icon                       |
| `colors.action.secondary.bg`      | `palette.white`       | Secondary button                               |
| `colors.action.secondary.hoverBg` | `palette.subtle`      | Secondary and quiet hover                      |
| `colors.action.disabled.bg`       | `palette.divider`     | Disabled control fill                          |
| `colors.action.disabled.fg`       | `palette.secondary`   | Disabled control label                         |
| `colors.focus.ring`               | `palette.ink`         | Keyboard focus ring                            |
| `colors.selection.bg`             | `palette.divider`     | Selected text/background highlight             |
| `colors.overlay.scrim`            | `rgb(23 23 23 / 48%)` | Modal backdrop                                 |

Rules:

- Never encode status with color alone.
- Inline links use `fg.default` and an underline. Hover increases underline
  thickness rather than changing hue.
- `fg.muted` has AA contrast on white and canvas, but not on `bg.subtle`; use
  `fg.secondary` for meaningful text on subtle fills.
- `border.structural` is limited to noninteractive cards, grouping, dividers,
  and skeletons. It must not outline an author-styled interactive control.
- `border.control` is required for the default boundary of author-styled
  inputs, textareas, selects, unchecked checkboxes/radios, and secondary
  buttons. Its `#737373` boundary exceeds `3:1` against every supported light
  surface: approximately `4.74:1` on white, `4.50:1` on canvas, and `4.35:1` on
  subtle.
- Divider color must not be used as text.
- Pure black `#000000` is not part of the palette.

### 3.3 Confirmed Project lifecycle status

The current UX confirms only the Project lifecycle labels `Active` and
`Archived`. They use text, icon shape, border, and fill without a chromatic
status palette.

| State    | Confirmed text | Icon/pattern  | Surface treatment                              |
| -------- | -------------- | ------------- | ---------------------------------------------- |
| Active   | `Active`       | Filled circle | White, ink text, structural border             |
| Archived | `Archived`     | Archive box   | Subtle fill, secondary text, structural border |

No other domain status label, icon, or state mapping is normative in this
version. For any additional status, the governing UX must define the product
vocabulary and state behavior before this visual contract is extended. Generic
status names or prototype fixtures are not implementation requirements.

If a later product decision adds status colors, it must define accessible
semantic roles, non-color equivalents, and a versioned update to this document.
Prototype status colors remain non-reusable.

## 4. Typography

### 4.1 Families

| Role      | Family                                      | Allowed content                                                                |
| --------- | ------------------------------------------- | ------------------------------------------------------------------------------ |
| UI        | `Inter`, system sans-serif fallback         | All headings, body copy, controls, navigation, labels, timestamps, and numbers |
| Technical | `JetBrains Mono`, system monospace fallback | Code, filesystem paths, stable IDs, and log content only                       |

Do not use JetBrains Mono for headings, buttons, navigation, generic metadata,
timestamps, or numeric dashboards. Use tabular numerals in Inter when columns of
counts or dates need alignment.

### 4.2 Type roles

| Token                 | Size / line height | Weight | Use                              |
| --------------------- | ------------------ | ------ | -------------------------------- |
| `text.pageTitle`      | `28 / 36 px` †     | `600`  | One page title                   |
| `text.sectionTitle`   | `20 / 28 px` †     | `600`  | Major page section               |
| `text.componentTitle` | `16 / 24 px`       | `600`  | Card or dialog title             |
| `text.body`           | `14 / 20 px`       | `400`  | Default UI copy                  |
| `text.bodyStrong`     | `14 / 20 px`       | `600`  | Emphasis and control labels      |
| `text.small`          | `13 / 18 px`       | `400`  | Secondary UI copy                |
| `text.caption`        | `12 / 16 px`       | `500`  | Nonessential metadata and badges |
| `text.mono`           | `12 / 18 px`       | `400`  | Code, path, ID, log              |

† These two roles step down on compact viewports. See _Responsive type_ below.

Typography rules:

- Use sentence case. Reserve uppercase for established abbreviations.
- Use no visible UI text below `12 px`, at every viewport.
- Keep one `h1` per page and a logical heading order.
- Page and section titles may use `-0.02em` tracking; body and control text use
  normal tracking.
- Long explanatory text should stay below `72ch`.
- Weight, not color, supplies ordinary emphasis. Avoid `700+` for routine UI.

#### Responsive type

The sizes in the table are the values from `768 px` up. Only the two display
roles change below that boundary:

| Token               | Compact (below `768 px`) | Standard and wide (`768 px`+) |
| ------------------- | ------------------------ | ----------------------------- |
| `text.pageTitle`    | `22 / 28 px`             | `28 / 36 px`                  |
| `text.sectionTitle` | `18 / 24 px`             | `20 / 28 px`                  |

Rules:

- Every other role is fixed at every viewport. `text.body`, `text.small`,
  `text.caption`, and `text.mono` already sit at or near the `12 px` floor, and
  reducing body copy on a small screen works against legibility rather than for
  it.
- Type never grows above the table. Additional room on wide viewports belongs to
  whitespace between regions, per section 9.
- `text.componentTitle` is deliberately not responsive: a `16 px` to `15 px`
  range is not worth a breakpoint.
- Express the step at the `768 px` layout boundary the rest of this document
  uses. Do not introduce a separate typographic breakpoint.
- Size in relative units, not `px`. A `px` font size ignores the reader's
  browser font-size preference; browser zoom scales it, but that preference does
  not. This applies to every role, responsive or fixed.
- A viewport-derived size such as a bare `vw` value is not acceptable on its own
  for the same reason.

## 5. Spacing, shape, and depth

### 5.1 Spacing scale

Use a 4 px base grid.

| Token      | Value   | Typical use                       |
| ---------- | ------- | --------------------------------- |
| `space.0`  | `0`     | Reset                             |
| `space.1`  | `4 px`  | Icon/label micro-gap              |
| `space.2`  | `8 px`  | Inline gap, compact stack         |
| `space.3`  | `12 px` | Control group                     |
| `space.4`  | `16 px` | Card padding on compact screens   |
| `space.5`  | `20 px` | Default control region            |
| `space.6`  | `24 px` | Default card padding, section gap |
| `space.8`  | `32 px` | Major region gap                  |
| `space.10` | `40 px` | Page-header separation            |
| `space.12` | `48 px` | Large page section                |
| `space.16` | `64 px` | Top-level wide-screen rhythm      |

Do not create one-off spacing values unless a browser/platform constraint
requires one. Dense data may reduce internal gaps by one scale step; it may not
reduce interactive target size.

### 5.2 Layout

- Maximum content width: `1280 px` (`80rem`), centered.
- Horizontal page gutters: `16 px` below `768 px`, `24 px` from `768 px`, and
  `32 px` from `1200 px`.
- Reading/form columns: up to `640 px` unless the UX requires side-by-side
  content.
- `Projects` remains a single scan-ordered list rather than a masonry grid.
- `Overview` summaries use two columns from `768 px` and one column below it.
- All grid/flex children that contain data set a shrinkable content boundary;
  long IDs and paths wrap or truncate with an accessible full-value affordance.
- Use whitespace between major regions before adding boxes inside boxes.

### 5.3 Controls and targets

- Default control height: `40 px`.
- Compact pointer-only density may use `32 px`, but compact viewports and touch
  contexts use at least `44 × 44 px` targets.
- Icon-only actions use a minimum `40 × 40 px` hit area and an accessible name.
- Adjacent irreversible or consequential actions need at least `8 px` visual
  separation from safe actions.

### 5.4 Radius and borders

| Token           | Value    | Use                           |
| --------------- | -------- | ----------------------------- |
| `radii.control` | `6 px`   | Inputs, buttons, small badges |
| `radii.card`    | `8 px`   | Cards and inline messages     |
| `radii.dialog`  | `12 px`  | Dialogs and popovers          |
| `radii.pill`    | `999 px` | Status badges only            |

Default boundaries are `1 px`. Do not use pill shapes for ordinary buttons,
cards, search fields, or navigation.

### 5.5 Elevation

- Page regions and cards are flat: surface plus border.
- Hover changes border/fill; it does not lift or scale the card.
- Popovers may use `0 8px 24px rgb(23 23 23 / 10%)`.
- Dialogs may use `0 16px 40px rgb(23 23 23 / 14%)`.
- Do not use shadows to distinguish routine sibling content.

## 6. Interaction and state grammar

Every interactive component implements the applicable states in the same
order: default, hover, active, focus-visible, selected, disabled, busy, and
error.

### 6.1 State rules

| State          | Contract                                                                           |
| -------------- | ---------------------------------------------------------------------------------- |
| Hover          | Add subtle fill or strong neutral border; never move the layout                    |
| Active/pressed | Return to ink emphasis or use an inset boundary; keep the label stable             |
| Focus-visible  | `2 px` ink ring with `2 px` offset; never remove without replacement               |
| Selected       | Ink surface with white text, or ink underline for navigation                       |
| Disabled       | Keep label readable; remove from action flow only when native semantics require it |
| Busy           | Preserve component dimensions, expose progress text, and prevent duplicate action  |
| Invalid        | Put the reason next to the field/unit and associate it programmatically            |
| Error          | Preserve user input and unaffected content; expose a next action                   |

### 6.2 Page and collection states

| State                | Rendering rule                                           | Recovery                                    |
| -------------------- | -------------------------------------------------------- | ------------------------------------------- |
| Initial loading      | Keep page header, toolbar, and stable skeletons visible  | Wait or use independent actions             |
| Loaded               | Render current data in stable order                      | Normal actions                              |
| True empty           | Explain that no Project exists                           | `Create project` in the message             |
| Archived-only empty  | Explain that active list is empty                        | `Create project`; secondary `Show archived` |
| No results           | Repeat query/filter context; do not look like true empty | `Clear search`, change filter, or create    |
| Initial error        | Replace only the collection region                       | `Retry`; preserve header and create action  |
| Continuation loading | Keep loaded cards; append a stable progress row          | Continue after load                         |
| Continuation error   | Keep loaded cards; append an inline error row            | `Retry` at the failed boundary              |
| Partial card error   | Keep every unaffected card/summary working               | Local `Retry`                               |
| Action error         | Keep entered data and current entity state               | Retry or cancel                             |

Success must be visible through changed content, state, or navigation. A toast
may confirm success but never acts as the only evidence.

### 6.3 Archived behavior

An archived Project is a durable read-only state, not a disabled page:

- keep Project name, ID, description, status, navigation, and content visible;
- replace the active primary action with `Restore project`;
- remove or clearly disable Actor mutations and explain the read-only reason;
- keep ordinary read navigation available;
- show saved settings values as read-only content;
- preserve the same `projectId` and URLs through restore;
- if restore fails, keep `Archived`, show the reason, and expose `Retry`.

## 7. Component contracts

Components use Chakra props and `system` semantic tokens. Raw color values and
inline-style theming are not allowed in feature/page code.

### 7.1 App shell

**Purpose:** hold global navigation and a stable main-content landmark without
competing with the current Project.

- Canvas uses `bg.canvas`; main content uses surface only where a bounded
  region needs it.
- `Projects` stays selected on the list, create page, and every Project route.
- Global navigation contains confirmed destinations only.
- Provide a keyboard skip link to the main content.
- Do not derive new global destinations from prototype routes.

### 7.2 Page header

**Anatomy:** breadcrumb, one `h1`, optional supporting copy, status/context, and
one primary action region.

- The title and context appear before actions in DOM order.
- Secondary actions use secondary or quiet buttons.
- On compact screens, actions wrap below the title without changing meaning.
- Loading keeps the header in place; errors replace only the affected content
  region whenever possible.

### 7.3 Buttons

| Variant   | Treatment                                           | Use                                   |
| --------- | --------------------------------------------------- | ------------------------------------- |
| Primary   | Ink background, white text                          | One main action in the current region |
| Secondary | White background, control border, ink text          | Safe alternative action               |
| Quiet     | Transparent background, ink text                    | Low-emphasis local action             |
| Icon      | Quiet square target with tooltip/accessibility name | Copy, overflow, close                 |

`Archive project` is consequential but not deletion. On `Settings` it remains a
separated secondary action; inside its confirmation dialog it may become that
dialog's primary ink action. Consequence is communicated by copy, confirmation,
and focus—not by introducing red.

Busy buttons retain a meaningful label such as `Creating…` or `Saving…`, keep
their width stable, and reject duplicate submission.

### 7.4 Inputs and form fields

**Anatomy:** persistent label, optional hint, control, and reserved error area.

- Inputs and textareas use white surface, `border.control`, and ink text.
- Hover uses strong border; focus uses the global focus ring.
- Placeholder uses muted text and never replaces the label.
- Field errors appear below the field and are associated with it.
- Submission errors appear above the action row, preserve values, and do not
  clear field errors.
- Read-only Project values are presented as readable text or explicitly
  read-only controls, not low-contrast disabled placeholders.
- `Cancel` restores saved values when the governing UX says so.

### 7.5 Search and filter toolbar

- Search has a visible label or accessible name matching “Search by name or
  ID”.
- `Include archived` is a checkbox with a text label, not an unlabeled icon or
  color toggle.
- Its unchecked author-styled boundary uses `border.control`, not the structural
  divider.
- Search and filter remain visible during loading, initial error, and no-results
  states.
- On compact screens, search takes the full row and the checkbox follows below.
- Updating `q` or `includeArchived` must not steal focus or announce the entire
  list repeatedly.

### 7.6 Project card

**Anatomy:** name, `Active`/`Archived`, updated time, optional description,
Workspace summary, and all required counters.

- The card is a single coherent navigation target to the Project.
- Use one column and stable vertical alignment to support scanning by update
  order.
- Show all counters, including zero.
- Workspace type uses icon shape plus accessible text, never color alone.
- Counters and Workspace previews are not nested actions.
- Long names truncate only when the full value remains available to assistive
  technology and pointer/keyboard users.
- Hover uses subtle fill or strong border; never scale or translate the card.
- Archived treatment remains readable and does not imply unavailable.

Avoid invalid nested interactive elements. If the card contains a copy or menu
action in a later approved UX, split the navigation and utility actions into
explicit sibling controls.

### 7.7 Status badge

**Anatomy:** optional icon plus required text.

- Use the lifecycle table in section 3.3 for `Active` and `Archived` only.
- Badge text is always present in the accessible name.
- Any other status requires vocabulary, behavior, and non-color meaning from
  its governing UX; do not infer its label or icon from the prototype or from a
  generic status set.
- When a governing UX requires progress, animation remains supplementary and
  the product state stays readable with motion disabled.
- Status badges do not become filters unless a UX explicitly makes them
  interactive.

### 7.8 Project identity block

**Anatomy:** breadcrumb, Project name, optional description, status, technical
`projectId`, copy action, and state-appropriate primary action.

- Keep the identity block stable across all six Project sections.
- Render `projectId` in `text.mono`; keep labels and copied confirmation in
  Inter.
- Rename updates the visible name but not the URL or ID.
- Copy success is announced without moving focus.
- `Project update failed` appears as a persistent inline message with a path to
  `Settings`; it does not replace the current section.

### 7.9 Project section navigation

- Use ordinary links, not tabs with local-only state, because each section has
  a canonical URL.
- Wide/standard screens show the six links in source order.
- The active link uses ink text and a `2 px` ink underline; inactive links use
  secondary text.
- On compact screens, use a visible trigger labeled with the current section
  that opens a compact list of all six ordinary links. The current section and
  `Back to projects` remain visible without opening the list.
- Route change moves focus to the new section heading; Back/Forward retain
  browser semantics.

### 7.10 Summary card

**Anatomy:** title, summary value or local state, supporting copy, and one link
to the section.

- Cards share equal padding but may grow with content; do not force fixed text
  heights.
- A missing value uses useful copy rather than a dash when absence has meaning.
- A local loading or error state changes only that card.
- Local error includes `Retry`; sibling cards remain interactive.
- The link label names its destination: `Open records`, `Open workspaces`,
  `Open runs`, or `Open activity`.

### 7.11 Feedback and empty states

| Component        | Placement                                     | Required content                                    |
| ---------------- | --------------------------------------------- | --------------------------------------------------- |
| Empty state      | Inside the empty collection/summary region    | What is absent, why it matters, one next action     |
| No-results state | Inside the collection region                  | Current query/filter, `Clear search`, alternatives  |
| Inline error     | At the failed card, continuation row, or form | What failed, preserved content, `Retry`/next action |
| Page error       | At the Project/collection content boundary    | Clear reason, `Retry`, safe navigation              |
| Toast            | Nonblocking supplement                        | Short outcome; never the only evidence              |

Errors use plain text, ink, neutral borders, and an alert icon where helpful.
Do not add red. Severity comes from placement, wording, heading level, and
boundary strength.

### 7.12 Dialogs

- Maximum width: `576 px`; compact screens keep `16 px` viewport margins.
- Order: title, consequences/context, local status or blocker list, secondary
  action, primary action.
- Initial focus goes to the title or safe action; destructive/consequential
  confirmation never receives surprise initial focus.
- Trap focus while open, close on supported cancel behavior, and return focus
  to the invoking control.
- Busy state prevents dismissal only when leaving would create ambiguous
  operation state; otherwise follow the governing UX.
- Archive blocker lists keep each Run status and link textual.
- Restore progress and failure keep the Project state explicit.

### 7.13 Skeleton and progress

- Skeletons match the final block geometry to prevent layout shift.
- Prefer static divider-colored blocks. Do not require an infinite shimmer.
- Progress text accompanies spinners or progress icons.
- Loading more appends progress after loaded items and never resets the list.

## 8. Canonical surface composition

This section composes existing UX contracts; it does not add child flows.

### 8.1 `Projects`

Order from top to bottom:

1. Page header with `Projects` and, when applicable, one `Create project`.
2. Search and `Include archived` toolbar.
3. Result count.
4. Single-column Project list or the state occupying that list region.
5. Continuation progress/error row.

`Create project` appears once. In true empty and archived-only empty states it
belongs inside the message; otherwise it remains in the page header. Initial and
continuation errors are visually different because continuation errors preserve
the loaded list.

### 8.2 `Create project`

Use a focused form column up to `640 px`:

1. `Projects / Create project` breadcrumb.
2. Page title.
3. `Name` and optional `Description`.
4. Form-level error region.
5. `Cancel` and primary `Create`.

On entry, focus `Name`. Validation appears at the field; creation errors retain
both values. Success navigates to `/projects/:projectId` and is evident from the
new Project shell.

### 8.3 Project shell and `Overview`

Order from top to bottom:

1. App navigation with `Projects` selected.
2. Breadcrumb and persistent Project identity block.
3. Optional Project update error.
4. Project section navigation.
5. Current section heading and content.

`Overview` uses the four summary cards `Records`, `Workspaces`, `Runs`, and
`Activity`. At standard/wide widths they form a two-column grid; at compact
widths they form one column. Any card may load or fail independently.

### 8.4 `Settings`

Order from top to bottom:

1. `Settings` section heading.
2. `Project details` form or read-only archived values.
3. Project update failure and `Retry update`, when present.
4. Visually separated `Project state` region.

For an active Project, details can be edited and `Archive project` is available
after saved changes are resolved. For an archived Project, details stay
readable, mutations are absent, and `Restore project` is the state action.
Archive and restore use the dialog contract above and remain on the stable
`/projects/:projectId/settings` URL.

## 9. Responsive behavior

Use the repository's existing `768 px` and `1200 px` layout boundaries unless a
later token migration renames them.

### Compact: below `768 px`

- Use `16 px` page gutters and a single content column.
- Stack page title, Project context, and actions in DOM order.
- Keep `Back to projects`, current section, and Project status visible.
- Replace the full Project section row with the compact link-list trigger.
- Stack search before `Include archived`.
- Keep one Workspace preview plus `+N` in a Project card.
- Allow counters to wrap onto additional rows without horizontal scrolling.
- Put form actions after fields; use full-width primary action when space
  requires it.
- Maintain `44 × 44 px` touch targets.
- Use the compact values of `text.pageTitle` and `text.sectionTitle` from
  section 4.2. All other type roles are unchanged.

### Standard: `768–1199 px`

- Use `24 px` gutters.
- Keep primary page actions aligned with the title when they fit.
- Use two Overview columns.
- Allow Project navigation to wrap only between links, never inside labels.

### Wide: `1200 px` and above

- Use `32 px` gutters and the `1280 px` content maximum.
- Preserve readable line lengths; do not stretch forms or explanatory copy to
  fill the viewport.
- Additional whitespace belongs between regions, not as oversized card padding.

Responsive changes may reorder presentation but must not remove state, recovery
actions, or stable Project context.

## 10. Accessibility

Target WCAG 2.2 AA for current surfaces.

### 10.1 Keyboard and focus

- Every action and link is keyboard reachable in a predictable order.
- Use native button, link, input, checkbox, and dialog semantics before custom
  roles.
- Show the global focus ring for keyboard focus.
- Route navigation moves focus to the destination `h1` or section heading.
- Opening and closing dialogs follows the focus contract in section 7.12.
- Automatic continuation loading never changes focus.
- Do not create whole-card click handlers on noninteractive elements.

### 10.2 Names, status, and announcements

- Page regions have headings and landmarks.
- Icon-only controls have accessible names and visible tooltips where useful.
- Icon and color never replace visible status text.
- Copy confirmation, local async errors, and completed async actions use a
  polite live region when the visible update would otherwise be missed.
- Initial/page errors may use assertive announcement only when they prevent the
  current task.
- Error announcements include the next available action.

### 10.3 Contrast and readability

- Default and secondary text meet AA on white, canvas, and subtle surfaces.
- Muted text is limited to white/canvas and nonessential metadata.
- Default author-styled inputs, textareas, selects, unchecked checkboxes/radios,
  and secondary buttons use `border.control`, which exceeds `3:1` against every
  supported light surface. Interactive boundaries never use the low-contrast
  structural divider alone.
- Zoom to 200% and reflow to 400% must not hide content or recovery actions.
- Technical strings can wrap, scroll within their own region, or offer copy;
  they must not force the page wider than the viewport.

### 10.4 Motion

Default transitions are restrained:

- color/border/opacity: `120–160 ms`;
- dialogs: opacity plus no more than `4 px` movement;
- no card scaling, parallax, decorative loops, or motion-only state.

Under `prefers-reduced-motion: reduce`:

- remove translation and smooth scrolling;
- make transitions effectively immediate;
- replace animated progress with a static icon plus text;
- keep all status and completion information intact.

## 11. Do and don't

### Do

- Use semantic tokens through the Chakra `system`.
- Use whitespace, type, and borders before adding another container.
- Keep one clear primary action per task region.
- Render Project identity and lifecycle state persistently.
- Preserve list data and form input through recoverable errors.
- Distinguish true empty, no results, initial error, and continuation error.
- Keep card/summary failures local.
- Use Inter for UI and JetBrains Mono only for code, path, ID, and log.
- Provide textual status, visible focus, keyboard access, and reduced motion.
- Read the governing UX/REQ before generating a surface.

### Don't

- Do not use the prototype's rust/blue/teal colors or warm canvas.
- Do not hardcode raw colors in components.
- Do not create a chromatic “status rainbow.”
- Do not use monospace to make ordinary UI look technical.
- Do not hide archived content behind a generic disabled page.
- Do not replace an entire page for a card or continuation error.
- Do not use a toast as the only success or error signal.
- Do not make status legible only through icon or color.
- Do not use a mutable Project name in a canonical URL.
- Do not treat prototype-derived routes or widgets as a roadmap commitment.
- Do not invent child flows or global navigation from prototype inventory.

## 12. Agent prompt guide

### 12.1 Required reading sequence

Before creating or changing UI, an agent must:

1. Read this `design.md`.
2. Read the exact governing UX and its linked REQ.
3. Read `AGENTS.md`, `REPOSITORY.md`, and `VERIFICATION.md`.
4. Inspect nearby components and theme tokens as implementation inventory.
5. List the applicable states and confirm whether the surface is Current or
   out of scope according to section 1.

If the requested surface lacks UX/REQ coverage, stop and request that source
material instead of designing a plausible flow.

### 12.2 Generation prompt pattern

Use a prompt with these explicit inputs:

> Implement the named Revo Admin surface using `design.md` as the visual and
> component contract and the linked UX/REQ as the behavior contract. Use only
> Revisium Monochrome semantic tokens. Preserve stable `projectId` URLs and the
> current Project IA. Include every applicable loading, empty, no-results,
> partial-error, action-error, archived, responsive, keyboard, focus, and
> reduced-motion state. Reuse local Chakra/MobX/FSD boundaries, but do not copy
> prototype-only product behavior or rust/chromatic styling. Do not design
> adjacent or out-of-scope flows.

Append the concrete surface name, source paths, and acceptance states to that
prompt. Do not replace them with assumptions.

### 12.3 Agent review checklist

Before handoff, verify:

- every color resolves through a semantic token from section 3;
- author-styled control boundaries use `border.control`, not the structural
  divider;
- there is no rust, blue, gradient, dark theme, or unexplained raw color;
- Inter and JetBrains Mono follow their content boundaries;
- Project identity and current section persist;
- archived state is read-only and restorable on the same URL;
- initial, empty, no-results, continuation, partial, and action errors remain
  distinct where applicable;
- focus, keyboard order, text status, touch targets, and reduced motion work;
- no child flow or global surface was added without UX/REQ;
- the repository's required verification gates pass.

## 13. Living-system rules

### 13.1 Versioning

- Patch: clarification that does not change rendered intent.
- Minor: additive token, component, or approved surface contract.
- Major: incompatible visual language, token meaning, or IA contract.

Every change updates the version, date, source register when needed, open
decisions, and changelog in the same edit.

### 13.2 Extension contract

New design work must:

1. link to a governing REQ and UX;
2. classify the surface as Current or out of scope;
3. reuse existing semantic tokens before adding any;
4. define component anatomy and all applicable states;
5. define responsive, keyboard, focus, status, and reduced-motion behavior;
6. preserve Project URL/IA compatibility or link to the approved decision that
   changes it;
7. add no raw color without a named role, contrast evidence, and documented
   reason.

### 13.3 Open decisions

These are explicit boundaries, not invitations for an implementing agent to
choose silently:

| Decision                                                    | Safe default in `0.2.0`                                           | Resolution source                         |
| ----------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------- |
| Detailed `Records`, `Workspaces`, `Runs`, and `Activity` UI | Shell route and Project context only                              | Dedicated UX + governing REQ              |
| Prototype-derived non-Project routes                        | Out of scope; not a roadmap or product destination                | Product IA UX/ADR                         |
| Chromatic operational status                                | Monochrome text, icon, border, and fill                           | Accessible design decision + token update |
| Graph, diff, editor, log, and dense-table variants          | Base monochrome tokens and generic accessibility only             | Surface-specific UX/design extension      |
| Final UX copy and scenario acceptance                       | Follow current UX Draft literally where specified; do not broaden | UX-001 through UX-004 review              |

No open decision blocks use of the current monochrome baseline. It blocks only
the unapproved extension named in its row.

## 14. Source register

### Product and UX

- [`../revo-docs/product/overview.md`](../revo-docs/product/overview.md)
- [`../revo-docs/product/domain-model.md`](../revo-docs/product/domain-model.md)
- [`../revo-docs/requirements/REQ-002-project-management.md`](../revo-docs/requirements/REQ-002-project-management.md)
- [`../revo-docs/ux/README.md`](../revo-docs/ux/README.md)
- [`../revo-docs/ux/UX-001-project.md`](../revo-docs/ux/UX-001-project.md)
- [`../revo-docs/ux/UX-002-project-list-create.md`](../revo-docs/ux/UX-002-project-list-create.md)
- [`../revo-docs/ux/UX-003-project-shell-navigation.md`](../revo-docs/ux/UX-003-project-shell-navigation.md)
- [`../revo-docs/ux/UX-004-project-management.md`](../revo-docs/ux/UX-004-project-management.md)

### Repository and implementation boundaries

- [`AGENTS.md`](AGENTS.md)
- [`REPOSITORY.md`](REPOSITORY.md)
- [`VERIFICATION.md`](VERIFICATION.md)
- [`REVIEW.md`](REVIEW.md)
- [`docs/design-tokens.md`](docs/design-tokens.md) — prototype inventory only
- `src/shared/ui/theme/` — implementation inventory only
- `src/shared/ui/` — component inventory only

### External references

- [Revisium public site](https://revisium.io/) — source of the monochrome public
  visual language.
- [VoltAgent Awesome DESIGN.md](https://github.com/VoltAgent/awesome-design-md/)
  — structural inspiration for an agent-readable design contract, not a visual
  source.

## 15. Changelog

### `0.3.0` — `2026-09-03`

- Made `text.pageTitle` and `text.sectionTitle` responsive, stepping down to
  `22 / 28 px` and `18 / 24 px` below `768 px`. The table values are now the
  standard and wide sizes; type does not grow above them.
- Stated that every other type role is fixed at every viewport, and why: the
  smaller roles already sit at the `12 px` floor.
- Required relative units for type size, and ruled out a bare viewport unit,
  because a `px` size ignores the reader's browser font-size preference.
- Recorded the same rule in the compact responsive section.

### `0.2.0` — `2026-09-02`

- Limited normative status treatment to the confirmed Project lifecycle states
  `Active` and `Archived`; other status vocabulary now requires governing UX.
- Classified prototype-derived non-Project routes as out of scope and explicitly
  not a roadmap commitment.
- Added `border.control` with at least `3:1` contrast across supported light
  surfaces and reserved the divider token for structural boundaries.

### `0.1.0` — `2026-09-02`

- Established the Revisium Monochrome direction.
- Defined semantic color, typography, spacing, shape, elevation, motion, and
  accessibility rules.
- Defined reusable component and state contracts for the current Project IA.
- Separated current working scope from unresolved and out-of-scope surfaces.
- Marked the existing warm/rust prototype as implementation inventory rather
  than visual or product canon.
