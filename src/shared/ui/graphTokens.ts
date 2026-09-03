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
  bg: system.token(`colors.status.${tone}.bg`),
  border: system.token(`colors.status.${tone}.border`),
})

export const paletteForStatus = (status: string): NodePalette => toneToken(toneForStatus(status))

export const gatePalette = (): NodePalette => ({
  fg: system.token('colors.accent.gate.fg'),
  bg: system.token('colors.accent.gate.bg'),
  border: system.token('colors.accent.gate.border'),
})

export const rolePalette = (): NodePalette => ({
  fg: system.token('colors.accent.role.fg'),
  bg: system.token('colors.accent.role.bg'),
  border: system.token('colors.accent.role.border'),
})

export const neutralPalette = (): NodePalette => toneToken('neutral')

// Solid status dot colors (--dot-*), used for the per-node tone dot.
export const dotColor = (status: string): string => system.token(`colors.dot.${toneForStatus(status)}`)

// Edge colors: inactive hairline, active brand flow, dashed review loop (teal).
export const edgeColor = system.token('colors.border.warmStrong')
export const edgeActiveColor = system.token('colors.brand.500')
export const edgeLoopColor = system.token('colors.accent.role.fg')

// Node card surfaces: raised surface for role nodes, gate-warm for gate nodes,
// current-step highlight (brand ring) and the warm dotgrid canvas background.
export const nodeSurface = system.token('colors.bg.2')
export const nodeBorder = system.token('colors.border.warmStrong')
export const nodeShadow = system.token('shadows.sh-1')
export const currentBorder = system.token('colors.brand.500')
export const currentRing = system.token('colors.brand.soft')
export const dotgridColor = system.token('colors.border.warmStrong')
export const nodeInk = system.token('colors.fg.0')
export const nodeMeta = system.token('colors.fg.2')
export const checkColor = system.token('colors.dot.success')
// Ink drawn on top of brand fills (e.g. the done-badge ✓) — tokenized white.
export const checkInk = system.token('colors.brand.on')

// xyflow renders raw DOM, so node label font sizes are inline `style` literals.
// Centralize them here (like the color tokens above) so the DAGs stay
// consistent. `label` is the primary node title; `meta` is the secondary line
// (status / "optional" / "alt:" / edge labels).
export const NODE_FONT_SIZE = {
  label: 13,
  meta: 11,
  caption: 10,
} as const
