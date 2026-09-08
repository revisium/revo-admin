import { SystemConfig } from '@chakra-ui/react'

// Global shell from the prototype (.design/styles.css body + helpers). Warm
// canvas, Inter with cv05/ss01 features, mono/tnum helpers, custom scrollbar,
// warm ::selection, and the dotgrid radial util. The accessible :focus-visible
// ring is preserved (no global focus-killer).
export const globalCss: SystemConfig['globalCss'] = {
  'html, body, #root': {
    width: '100%',
    minHeight: '100dvh',
    overscrollBehavior: 'none',
  },
  body: {
    fontFamily: 'body',
    fontSize: '14px',
    lineHeight: '1.5',
    color: 'fg.default',
    bg: 'bg.canvas',
    textRendering: 'optimizeLegibility',
    fontFeatureSettings: "'cv05' 1, 'ss01' 1",
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
  },
  // Mono / tabular-number helpers (.mono / .tnum in the prototype).
  '.mono': { fontFamily: 'mono', fontVariantLigatures: 'none' },
  '.tnum': { fontVariantNumeric: 'tabular-nums' },
  '::selection': { background: 'selection.bg' },
  // Preserve scrollbar geometry; reveal only the thumb on hover.
  '*': { scrollbarWidth: 'thin', scrollbarColor: 'transparent transparent' },
  '*:hover': { scrollbarColor: '{colors.border.strong} transparent' },
  '*::-webkit-scrollbar': { width: '11px', height: '11px' },
  '*::-webkit-scrollbar-thumb': {
    background: 'transparent',
    backgroundClip: 'padding-box',
    borderRadius: '8px',
    border: '3px solid',
    borderColor: 'transparent',
  },
  '*:hover::-webkit-scrollbar-thumb': { background: '{colors.border.strong}' },
  // Dotted radial background used behind the DAG canvas (.dotgrid).
  '.dotgrid': {
    backgroundImage: 'radial-gradient({colors.border.structural} 1px, transparent 1px)',
    backgroundSize: '18px 18px',
  },
  // Accessible, theme-driven keyboard focus. Pointer focus stays quiet via
  // :focus-visible; keyboard users get a visible brand ring.
  '*:focus:not(:focus-visible)': {
    outline: 'none',
  },
  '*:focus-visible': {
    outline: '2px solid',
    outlineColor: 'focus.ring',
    outlineOffset: '2px',
    borderRadius: '2px',
  },
  // Media query nested inside the selector, not wrapping it: Chakra types the top-level
  // globalCss keys as free-form selectors but only recognizes at-rules inside a style
  // object, so this is the only shape that type-checks without a cast. Emotion hoists it
  // to the equivalent @media block.
  '*, *::before, *::after': {
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '1ms !important',
      animationIterationCount: '1 !important',
      transitionDuration: '1ms !important',
      scrollBehavior: 'auto !important',
    },
  },
}
