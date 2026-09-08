export const compareSequence = (left: string, right: string): number => {
  const a = BigInt(left)
  const b = BigInt(right)

  if (a === b) {
    return 0
  }

  return a > b ? 1 : -1
}

export const newerSequence = (left: string, right: string): string => (compareSequence(left, right) > 0 ? left : right)
