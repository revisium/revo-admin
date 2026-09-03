export const mergeDescribedBy = (items: ReadonlyArray<string | undefined>): string | undefined => {
  const ids = items.filter((value): value is string => Boolean(value))
  return ids.length > 0 ? ids.join(' ') : undefined
}
