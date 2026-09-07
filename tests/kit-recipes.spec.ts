import { describe, expect, it } from 'vitest'
import { buttonRecipe } from 'src/shared/ui/kit/Button/button.recipe'
import { iconButtonRecipe } from 'src/shared/ui/kit/IconButton/iconButton.recipe'
import { textInputRecipe } from 'src/shared/ui/kit/TextInput/textInput.recipe'
import { textareaRecipe } from 'src/shared/ui/kit/Textarea/textarea.recipe'
import { checkboxRecipe } from 'src/shared/ui/kit/Checkbox/checkbox.recipe'
import { cardRecipe } from 'src/shared/ui/kit/Card/card.recipe'
import { badgeRecipe } from 'src/shared/ui/kit/Badge/badge.recipe'
import { confirmDialogRecipe } from 'src/shared/ui/kit/ConfirmDialog/confirmDialog.recipe'
import { skeletonRecipe } from 'src/shared/ui/kit/Skeleton/skeleton.recipe'
import { navLinkRecipe } from 'src/shared/ui/kit/NavLink/navLink.recipe'

const hasTransform = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false
  if (Array.isArray(value)) {
    return value.some((item) => hasTransform(item))
  }

  if ('transform' in value) return true

  return Object.values(value).some((item) => hasTransform(item))
}

// Recipe style values are typed as a broad Chakra responsive union, so reading the
// `base` breakpoint back out needs a runtime-narrowed accessor rather than direct
// property access.
const responsiveBase = (value: unknown): unknown =>
  value && typeof value === 'object' && 'base' in value ? (value as Record<string, unknown>).base : undefined

describe('kit recipes', () => {
  it('defines all ten recipes', () => {
    expect(buttonRecipe).toBeDefined()
    expect(iconButtonRecipe).toBeDefined()
    expect(textInputRecipe).toBeDefined()
    expect(textareaRecipe).toBeDefined()
    expect(checkboxRecipe).toBeDefined()
    expect(cardRecipe).toBeDefined()
    expect(badgeRecipe).toBeDefined()
    expect(confirmDialogRecipe).toBeDefined()
    expect(skeletonRecipe).toBeDefined()
    expect(navLinkRecipe).toBeDefined()
  })

  it('exposes the three button variants with primary on the action.primary.bg token', () => {
    expect(buttonRecipe).toMatchObject({
      variants: {
        variant: {
          primary: expect.any(Object),
          secondary: expect.any(Object),
          quiet: expect.any(Object),
        },
      },
    })
    const variant = buttonRecipe.variants?.variant
    if (!variant) throw new Error('buttonRecipe is missing its variant map')
    expect(Object.keys(variant)).toHaveLength(3)
    expect(variant.primary.bg).toBe('action.primary.bg')
  })

  it('exposes exactly the two badge tones and no domain vocabulary', () => {
    expect(badgeRecipe).toMatchObject({
      variants: {
        tone: {
          default: expect.any(Object),
          quiet: expect.any(Object),
        },
      },
    })
    const tone = badgeRecipe.variants?.tone
    if (!tone) throw new Error('badgeRecipe is missing its tone map')
    expect(Object.keys(tone)).toHaveLength(2)
    // The base layer must stay free of business meaning: a lifecycle vocabulary belongs to the
    // entity that owns it, mapped onto these tones there.
    expect(Object.keys(badgeRecipe.variants ?? {})).not.toContain('status')
  })

  it('gives checkbox the root, control, label slots', () => {
    expect(checkboxRecipe.slots).toEqual(['root', 'control', 'label'])
  })

  it('gives confirm dialog the backdrop, positioner, content, title, body, footer slots', () => {
    expect(confirmDialogRecipe.slots).toEqual(['backdrop', 'positioner', 'content', 'title', 'body', 'footer'])
  })

  it('keeps the programmatically focused confirm dialog title visually quiet', () => {
    expect(confirmDialogRecipe.base?.title).toMatchObject({
      _focusVisible: { outline: 'none' },
    })
  })

  it('never uses transform in base or variants', () => {
    const recipes = [
      buttonRecipe,
      iconButtonRecipe,
      textInputRecipe,
      textareaRecipe,
      cardRecipe,
      badgeRecipe,
      skeletonRecipe,
      navLinkRecipe,
    ]

    for (const recipe of recipes) {
      expect(hasTransform(recipe.base)).toBe(false)
      expect(hasTransform(recipe.variants)).toBe(false)
    }

    for (const recipe of [checkboxRecipe, confirmDialogRecipe]) {
      expect(hasTransform(recipe.base)).toBe(false)
      expect(hasTransform(recipe.variants)).toBe(false)
    }
  })

  it('gives compact viewports a 44px control height for interactive recipes', () => {
    expect(responsiveBase(buttonRecipe.base?.minH)).toBe('44px')
    expect(responsiveBase(iconButtonRecipe.base?.boxSize)).toBe('44px')
    expect(responsiveBase(textInputRecipe.base?.height)).toBe('44px')
    expect(responsiveBase(checkboxRecipe.base?.root?.minH)).toBe('44px')
  })
})
