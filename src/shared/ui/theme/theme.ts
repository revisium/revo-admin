import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'
import { globalCss } from './globalCss'
import { palette } from './palette'
import { textStyles } from './textStyles'
import { semanticTokens } from './semanticTokens'

// The Revisium Monochrome theme: a neutral palette plus five semantic states. Forced light,
// no colour mode. CSS-var → Chakra-token mapping lives in docs/design-tokens.md.
const config = defineConfig({
  globalCss,
  theme: {
    textStyles,
    tokens: {
      colors: {
        palette,
        // The five states, resolved from the palette so a colour is defined once.
        status: {
          running: {
            fg: { value: '{colors.palette.info.ink}' },
            bg: { value: '{colors.palette.info.surface}' },
            border: { value: '{colors.palette.info.edge}' },
          },
          success: {
            fg: { value: '{colors.palette.success.ink}' },
            bg: { value: '{colors.palette.success.surface}' },
            border: { value: '{colors.palette.success.edge}' },
          },
          failed: {
            fg: { value: '{colors.palette.danger.ink}' },
            bg: { value: '{colors.palette.danger.surface}' },
            border: { value: '{colors.palette.danger.edge}' },
          },
          waiting: {
            fg: { value: '{colors.palette.warning.ink}' },
            bg: { value: '{colors.palette.warning.surface}' },
            border: { value: '{colors.palette.warning.edge}' },
          },
          neutral: {
            fg: { value: '{colors.palette.secondary}' },
            bg: { value: '{colors.palette.subtle}' },
            border: { value: '{colors.palette.divider}' },
          },
          muted: {
            fg: { value: '{colors.palette.secondary}' },
            bg: { value: '{colors.palette.subtle}' },
            border: { value: '{colors.palette.divider}' },
          },
        },
        // A dot is the same state at foreground strength, so it points at that state's fg.
        dot: {
          running: { value: '{colors.status.running.fg}' },
          success: { value: '{colors.status.success.fg}' },
          failed: { value: '{colors.status.failed.fg}' },
          waiting: { value: '{colors.status.waiting.fg}' },
          neutral: { value: '{colors.status.neutral.fg}' },
          muted: { value: '{colors.status.muted.fg}' },
        },
      },
      fonts: {
        heading: { value: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
        body: { value: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
        mono: { value: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace" },
      },
      radii: {
        control: { value: '6px' },
        card: { value: '8px' },
        dialog: { value: '12px' },
        pill: { value: '999px' },
      },
      shadows: {
        popover: { value: '0 8px 24px rgb(23 23 23 / 10%)' },
        dialog: { value: '0 16px 40px rgb(23 23 23 / 14%)' },
      },
      easings: {
        standard: { value: 'cubic-bezier(.2,0,0,1)' },
      },
      durations: {
        fast: { value: '150ms' },
        moderate: { value: '120ms' },
        slow: { value: '160ms' },
      },
    },
    semanticTokens: {
      colors: {
        ...semanticTokens.colors,
      },
    },
    // Breakpoint names are counter-intuitive here: `md` is 480px, not Chakra's default 768px.
    // DESIGN's three layout tiers map to base/lg/xl, not base/md/xl:
    //   compact  < 768px  -> base
    //   standard 768-1199px -> lg
    //   wide     >= 1200px -> xl
    // Using `md` for the 768px boundary silently drops to 480px with no gate catching it
    // (types still match, nothing renders it). Values are intentionally unchanged: DESIGN §9
    // pins the existing 768px/1200px boundaries.
    breakpoints: {
      base: '0px',
      sm: '360px',
      md: '480px',
      lg: '768px',
      xl: '1200px',
    },
  },
})

export const system = createSystem(defaultConfig, config)
