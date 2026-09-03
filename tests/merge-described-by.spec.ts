import { describe, expect, it } from 'vitest'
import { mergeDescribedBy } from 'src/shared/ui/components/FormField/mergeDescribedBy'

describe('mergeDescribedBy', () => {
  it('returns undefined when no ids are given', () => {
    expect(mergeDescribedBy([])).toBeUndefined()
  })

  it('returns the single id unchanged', () => {
    expect(mergeDescribedBy(['field-hint'])).toBe('field-hint')
  })

  it('joins two ids with a single space', () => {
    expect(mergeDescribedBy(['field-hint', 'field-error'])).toBe('field-hint field-error')
  })

  it('drops undefined entries', () => {
    expect(mergeDescribedBy([undefined, 'field-hint', undefined, 'field-error', undefined])).toBe(
      'field-hint field-error',
    )
  })
})
