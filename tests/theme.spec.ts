import { describe, expect, it } from 'vitest'
import { system } from 'src/shared/ui/theme/theme'

describe('theme system', () => {
  it('builds a Chakra system with brand tokens', () => {
    expect(system).toBeDefined()
    expect(system.token('colors.brand.500')).toBe('#b23a17')
  })

  describe('monochrome tokens', () => {
    it('builds monochrome palette primitives', () => {
      expect(system.token('colors.palette.ink')).toBe('#171717')
      expect(system.token('colors.palette.white')).toBe('#FFFFFF')
      expect(system.token('colors.palette.canvas')).toBe('#F9F9F9')
      expect(system.token('colors.palette.subtle')).toBe('#F5F5F5')
      expect(system.token('colors.palette.divider')).toBe('#E5E5E5')
      expect(system.token('colors.palette.secondary')).toBe('#525252')
      expect(system.token('colors.palette.muted')).toBe('#737373')
    })

    it('builds monochrome semantic tokens', () => {
      const tokens = system.tokens
      const resolveToken = (path: string) => {
        const token = tokens.getByName(path)
        const tokenValue = token?.value
        if (typeof tokenValue !== 'string') return tokenValue

        const varMatch = tokenValue.match(/^var\(--chakra-colors-(.+?)\)$/)
        if (!varMatch) return tokenValue

        const reference = varMatch[1]
        const normalizedReference = `colors.${reference.replace(/\\\./g, '.').replace(/-/g, '.')}`

        if (normalizedReference === path) {
          return token?.originalValue
        }

        return tokens.getByName(normalizedReference)?.value
      }

      expect(resolveToken('colors.bg.canvas')).toBe('#F9F9F9')
      expect(resolveToken('colors.bg.surface')).toBe('#FFFFFF')
      expect(resolveToken('colors.bg.subtle')).toBe('#F5F5F5')
      expect(resolveToken('colors.bg.inverse')).toBe('#171717')
      expect(resolveToken('colors.fg.default')).toBe('#171717')
      expect(resolveToken('colors.fg.secondary')).toBe('#525252')
      expect(resolveToken('colors.fg.muted')).toBe('#737373')
      expect(resolveToken('colors.fg.inverse')).toBe('#FFFFFF')
      expect(resolveToken('colors.border.structural')).toBe('#E5E5E5')
      expect(resolveToken('colors.border.control')).toBe('#737373')
      expect(resolveToken('colors.border.strong')).toBe('#525252')
      expect(resolveToken('colors.action.primary.bg')).toBe('#171717')
      expect(resolveToken('colors.action.primary.hoverBg')).toBe('#525252')
      expect(resolveToken('colors.action.primary.fg')).toBe('#FFFFFF')
      expect(resolveToken('colors.action.secondary.bg')).toBe('#FFFFFF')
      expect(resolveToken('colors.action.secondary.hoverBg')).toBe('#F5F5F5')
      expect(resolveToken('colors.action.disabled.bg')).toBe('#E5E5E5')
      expect(resolveToken('colors.action.disabled.fg')).toBe('#525252')
      expect(resolveToken('colors.focus.ring')).toBe('#171717')
      expect(resolveToken('colors.selection.bg')).toBe('#E5E5E5')
      expect(resolveToken('colors.overlay.scrim')).toBe('rgb(23 23 23 / 48%)')
    })

    it('keeps legacy warm border strong under warmStrong', () => {
      expect(system.token('colors.border.warmStrong')).toBe('#d6cfbd')
    })
  })
})
