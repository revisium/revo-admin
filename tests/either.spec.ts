import { describe, expect, it } from 'vitest'
import { isLeft, isRight, type Either } from 'src/shared/lib/Either'

const right: Either<string, number> = { isRight: true, data: 7 }
const left: Either<string, number> = { isRight: false, error: 'boom' }

describe('Either', () => {
  it('identifies a Right', () => {
    expect(isRight(right)).toBe(true)
    expect(isLeft(right)).toBe(false)
  })

  it('identifies a Left', () => {
    expect(isLeft(left)).toBe(true)
    expect(isRight(left)).toBe(false)
  })

  it('narrows a Right to its data', () => {
    if (!isRight(right)) {
      throw new Error('expected a Right')
    }

    expect(right.data).toBe(7)
  })

  it('narrows a Left to its error', () => {
    if (!isLeft(left)) {
      throw new Error('expected a Left')
    }

    expect(left.error).toBe('boom')
  })
})
