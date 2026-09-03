// Every colour the product can render lives here and nowhere else. Components must consume
// semantic roles (`fg.default`, `status.failed.fg`, …), never these names directly.
//
// Neutrals carry the interface; the five states carry meaning. Each state is a triplet:
// `ink` for text and dots, `surface` for the fill behind them, `edge` for the hairline.
export const palette = {
  ink: { value: '#171717' },
  white: { value: '#FFFFFF' },
  canvas: { value: '#F9F9F9' },
  subtle: { value: '#F5F5F5' },
  divider: { value: '#E5E5E5' },
  secondary: { value: '#525252' },
  muted: { value: '#737373' },

  info: {
    ink: { value: '#1B5C93' },
    surface: { value: '#E3EEF9' },
    edge: { value: '#A4C4E2' },
  },
  success: {
    ink: { value: '#237A52' },
    surface: { value: '#E3F4EA' },
    edge: { value: '#99D0AF' },
  },
  warning: {
    ink: { value: '#976A0F' },
    surface: { value: '#FFF2D6' },
    edge: { value: '#E8C477' },
  },
  danger: {
    ink: { value: '#B33636' },
    surface: { value: '#FCE9E9' },
    edge: { value: '#E8ADAD' },
  },
}
