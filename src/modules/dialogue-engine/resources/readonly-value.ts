const snapshots = new WeakMap<object, unknown>()

export function readonlyValue<T>(value: T): Readonly<T> {
  if (!value || typeof value !== 'object') return value
  const cached = snapshots.get(value)

  if (cached) return cached as Readonly<T>

  const copy = Array.isArray(value)
    ? value.map((item) => readonlyValue(item))
    : Object.fromEntries(Object.entries(value).map(([key, item]) => [key, readonlyValue(item)]))
  Object.freeze(copy)
  snapshots.set(value, copy)

  return copy as Readonly<T>
}
