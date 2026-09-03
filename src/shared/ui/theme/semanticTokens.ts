export const semanticTokens = {
  colors: {
    'bg.canvas': { value: '{colors.palette.canvas}' },
    'bg.surface': { value: '{colors.palette.white}' },
    'bg.subtle': { value: '{colors.palette.subtle}' },
    'bg.inverse': { value: '{colors.palette.ink}' },
    'fg.default': { value: '{colors.palette.ink}' },
    'fg.secondary': { value: '{colors.palette.secondary}' },
    'fg.muted': { value: '{colors.palette.muted}' },
    'fg.inverse': { value: '{colors.palette.white}' },
    'border.structural': { value: '{colors.palette.divider}' },
    'border.control': { value: '{colors.palette.muted}' },
    'border.strong': { value: '{colors.palette.secondary}' },
    'action.primary.bg': { value: '{colors.palette.ink}' },
    'action.primary.hoverBg': { value: '{colors.palette.secondary}' },
    'action.primary.fg': { value: '{colors.palette.white}' },
    'action.secondary.bg': { value: '{colors.palette.white}' },
    'action.secondary.hoverBg': { value: '{colors.palette.subtle}' },
    'action.disabled.bg': { value: '{colors.palette.divider}' },
    'action.disabled.fg': { value: '{colors.palette.secondary}' },
    'focus.ring': { value: '{colors.palette.ink}' },
    'selection.bg': { value: '{colors.palette.divider}' },
    'overlay.scrim': { value: 'rgb(23 23 23 / 48%)' },

    // Risk is a ranked scale, and ranking is what a neutral surface cannot express. It rides
    // the same three states rather than inventing its own hues, so success/warning/danger and
    // low/medium/high can never drift apart. The level word is always rendered, so colour
    // stays a second channel and never the only one.
    'risk.low.fg': { value: '{colors.palette.success.ink}' },
    'risk.low.bg': { value: '{colors.palette.success.surface}' },
    'risk.low.border': { value: '{colors.palette.success.edge}' },
    'risk.medium.fg': { value: '{colors.palette.warning.ink}' },
    'risk.medium.bg': { value: '{colors.palette.warning.surface}' },
    'risk.medium.border': { value: '{colors.palette.warning.edge}' },
    'risk.high.fg': { value: '{colors.palette.danger.ink}' },
    'risk.high.bg': { value: '{colors.palette.danger.surface}' },
    'risk.high.border': { value: '{colors.palette.danger.edge}' },
  },
}
