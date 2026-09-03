import { defineTextStyles } from '@chakra-ui/react'

// The eight type roles of the Revisium Monochrome design system (DESIGN.md §4.2). This is the
// primary set: all new code uses these, and an ESLint rule rejects the legacy keys below.
//
// Sizes are rem, not px. At the default 16px root these render identically to the px values in
// the design document, but rem also honours a reader's browser font-size preference, which px
// silently ignores — the same WCAG 2.2 "Resize Text" reasoning that kept the spacing scale on
// Chakra's rem defaults. Browser zoom scales px too, but the font-size setting does not.
// The two display roles are responsive; every other role is fixed. Three things shape that.
//
// Shape follows the sibling project's convention (ved-landing `src/shared/ui/theme/textStyles.ts`):
// breakpoint keys inside `value` carry only `fontSize` and `lineHeight`, while the properties that
// do not vary — `fontWeight`, `letterSpacing` — sit beside them at the top level of `value`.
//
// Direction is downward only, which differs from that project. Its display type grows with the
// viewport because it is a marketing landing page; this is an admin UI, DESIGN §4.2 states 28px as
// the page title's size rather than its floor, and §9 says the extra room on wide viewports belongs
// to whitespace between regions, not to larger type. So the §4.2 values live at `lg` and the
// compact tier steps down. A 28px title inside a 328px content column at 360px is what that is for.
//
// Only titles move. `body` (14px), `small` (13px), `caption` and `mono` (12px) already sit on the
// floor §4.2 sets — "use no visible UI text below 12px" — and shrinking body copy on a small screen
// is the opposite of accessible. `componentTitle` would span 16px to 15px, one pixel, not worth it.
//
// `lg` is the 768px boundary in this theme. `md` is 480px and would put the step in the wrong place.
//
// This is a deliberate divergence from both sources: §4.2 specifies one fixed table, and none of
// the four exported layouts changes a font size inside a media query. Requested explicitly.
const designTextStyles = {
  pageTitle: {
    value: {
      base: { fontSize: '1.375rem', lineHeight: '1.75rem' },
      lg: { fontSize: '1.75rem', lineHeight: '2.25rem' },
      fontWeight: '600',
      letterSpacing: '-0.02em',
    },
  },
  sectionTitle: {
    value: {
      base: { fontSize: '1.125rem', lineHeight: '1.5rem' },
      lg: { fontSize: '1.25rem', lineHeight: '1.75rem' },
      fontWeight: '600',
      letterSpacing: '-0.02em',
    },
  },
  componentTitle: { value: { fontSize: '1rem', lineHeight: '1.5rem', fontWeight: '600', letterSpacing: 'normal' } },
  body: { value: { fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: '400', letterSpacing: 'normal' } },
  bodyStrong: { value: { fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: '600', letterSpacing: 'normal' } },
  small: { value: { fontSize: '0.8125rem', lineHeight: '1.125rem', fontWeight: '400', letterSpacing: 'normal' } },
  caption: { value: { fontSize: '0.75rem', lineHeight: '1rem', fontWeight: '500', letterSpacing: 'normal' } },
  mono: {
    value: {
      fontSize: '0.75rem',
      lineHeight: '1.125rem',
      fontWeight: '400',
      letterSpacing: 'normal',
      fontFamily: 'mono',
    },
  },
}

// DEPRECATED — scheduled for removal.
//
// The warm prototype's type ramp, generated as every weight × size combination. 284 call sites
// across src/pages, src/widgets and the flat legacy files in src/shared/ui still depend on it, so
// it cannot be deleted until those screens are torn down or migrated. It is the largest single
// item in .superpowers/sdd/scaffolding-debt.md.
//
// Do not add a key here, do not use one in new code, and do not migrate a legacy screen to the
// design roles piecemeal — the visual ramps differ (this one has no letter-spacing, a 21px body
// line-height and a 680 weight), so a partial migration produces a mixed scale on one screen.
// An ESLint rule already rejects these keys outside the legacy paths.
const LEGACY_SIZES: Record<string, { fontSize: string; lineHeight: string }> = {
  micro: { fontSize: '11px', lineHeight: '15px' },
  xs: { fontSize: '12px', lineHeight: '16px' }, // caption
  sm: { fontSize: '13px', lineHeight: '18px' },
  body: { fontSize: '14px', lineHeight: '21px' },
  md: { fontSize: '16px', lineHeight: '22px' }, // h2
  lg: { fontSize: '20px', lineHeight: '26px' }, // h1
  xl: { fontSize: '20px', lineHeight: '26px' }, // h1 (alias)
  xxl: { fontSize: '28px', lineHeight: '31px' }, // display
  display: { fontSize: '28px', lineHeight: '31px' },
}

const LEGACY_WEIGHTS: Record<string, string> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '680',
}

const legacyTextStyles = Object.fromEntries(
  Object.entries(LEGACY_WEIGHTS).flatMap(([weight, fontWeight]) =>
    Object.entries(LEGACY_SIZES).map(([size, { fontSize, lineHeight }]) => [
      `${weight}-${size}`,
      { value: { fontSize, lineHeight, fontWeight } },
    ]),
  ),
)

export const textStyles = defineTextStyles({
  ...legacyTextStyles,
  ...designTextStyles,
})
