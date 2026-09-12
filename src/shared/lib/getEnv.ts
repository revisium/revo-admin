export const getEnv = (variableName: string): string | undefined => {
  const value = import.meta.env[variableName]

  return typeof value === 'string' ? value : undefined
}
