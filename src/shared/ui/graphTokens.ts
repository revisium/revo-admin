import { system } from './theme/theme'
import { type StatusTone, toneForStatus } from './statusTone'

// xyflow renders raw SVG/DOM and needs concrete color strings, not Chakra
// props. Resolve them from the same `status.*` / `accent.*` / `dot.*` theme
// tokens (ported from .design/dag.jsx + styles.css) so the DAGs stay
// token-driven. Used only inside *.client.tsx graph modules.
export interface NodePalette {
  readonly fg: string
  readonly bg: string
  readonly border: string
}

const toneToken = (tone: StatusTone): NodePalette => ({
  fg: system.token(`colors.status.${tone}.fg`),
  bg: system.token('colors.bg.surface'),
  border: system.token('colors.border.structural'),
})

export const paletteForStatus = (status: string): NodePalette => toneToken(toneForStatus(status))

// Gate and role nodes share one neutral surface: in the monochrome system a node kind is
// carried by its icon and label, never by colour. Both names stay so the graphs keep reading
// as gate vs role at the call site.
const neutralNodePalette = (): NodePalette => ({
  fg: system.token('colors.fg.secondary'),
  bg: system.token('colors.bg.subtle'),
  border: system.token('colors.border.structural'),
})

export const gatePalette = neutralNodePalette
export const rolePalette = neutralNodePalette

export const neutralPalette = (): NodePalette => toneToken('neutral')

// Solid status dot colors (--dot-*), used for the per-node tone dot.
export const dotColor = (status: string): string => system.token(`colors.dot.${toneForStatus(status)}`)

// Edge colors: inactive hairline, active ink flow, dashed review loop.
export const edgeColor = system.token('colors.border.structural')
export const edgeActiveColor = system.token('colors.fg.default')
export const edgeLoopColor = system.token('colors.fg.muted')

// Node card surfaces: one neutral surface for every node kind, the current-step
// highlight ring and the dotgrid canvas background.
export const nodeSurface = system.token('colors.bg.surface')
export const nodeBorder = system.token('colors.border.structural')
export const nodeShadow = system.token('shadows.popover')
export const currentBorder = system.token('colors.fg.default')
export const currentRing = system.token('colors.bg.subtle')
export const dotgridColor = system.token('colors.border.structural')
export const nodeInk = system.token('colors.fg.default')
export const nodeMeta = system.token('colors.fg.secondary')
export const checkColor = system.token('colors.dot.success')
// Ink drawn on top of inverse fills (e.g. the done-badge ✓).
export const checkInk = system.token('colors.action.primary.fg')

// xyflow renders raw DOM, so node label font sizes are inline `style` literals.
// Centralize them here (like the color tokens above) so the DAGs stay
// consistent. `label` is the primary node title; `meta` is the secondary line
// (status / "optional" / "alt:" / edge labels).
export const NODE_FONT_SIZE = {
  label: 13,
  meta: 11,
  caption: 10,
} as const
