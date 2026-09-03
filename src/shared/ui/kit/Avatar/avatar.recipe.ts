import { defineRecipe } from '@chakra-ui/react'

// One square-or-round identity tile for every avatar in the app. `size` couples box, corner
// radius and type scale so callers cannot invent an unlisted combination; `tone` names a surface
// treatment, never a domain state — the entity that owns a vocabulary (project tone, actor kind)
// maps it onto these names.
export const avatarRecipe = defineRecipe({
  className: 'avatar',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
    textTransform: 'lowercase',
    borderWidth: '1px',
    borderStyle: 'solid',
    bg: 'bg.subtle',
  },
  variants: {
    size: {
      xs: { boxSize: '22px', borderRadius: '8px', textStyle: 'caption' },
      sm: { boxSize: '26px', borderRadius: '8px', textStyle: 'caption' },
      md: { boxSize: '30px', borderRadius: '8px', textStyle: 'bodyStrong' },
      lg: { boxSize: '40px', borderRadius: '8px', textStyle: 'componentTitle' },
      xl: { boxSize: '50px', borderRadius: '10px', textStyle: 'componentTitle' },
    },
    shape: {
      square: {},
      circle: { borderRadius: 'full' },
    },
    tone: {
      muted: { color: 'fg.secondary', borderColor: 'border.structural' },
      neutral: { color: 'fg.default', borderColor: 'border.structural' },
      waiting: { color: 'status.waiting.fg', borderColor: 'border.structural' },
      system: { color: 'fg.secondary', borderColor: 'border.strong' },
      accent: { color: 'action.primary.bg', borderColor: 'border.strong' },
      brand: {
        color: 'action.primary.fg',
        borderWidth: '0',
        bgGradient: 'to-br',
        gradientFrom: 'fg.default',
        gradientTo: 'action.primary.hoverBg',
      },
    },
  },
  defaultVariants: {
    size: 'sm',
    shape: 'square',
    tone: 'muted',
  },
})
