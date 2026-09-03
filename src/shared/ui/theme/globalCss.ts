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
    color: 'fg.0',
    bg: 'bg.0',
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
  // Warm custom scrollbar (prototype .app__scroll).
  '*::-webkit-scrollbar': { width: '11px', height: '11px' },
  '*::-webkit-scrollbar-thumb': {
    background: '#d8d2c4',
    borderRadius: '8px',
    border: '3px solid',
    borderColor: 'bg.0',
  },
  '*::-webkit-scrollbar-thumb:hover': { background: '#c7c0af' },
  // Dotted radial background used behind the DAG canvas (.dotgrid).
  '.dotgrid': {
    backgroundImage: 'radial-gradient(#d6cfbd 1px, transparent 1px)',
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
