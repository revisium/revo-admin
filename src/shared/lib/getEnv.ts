declare global {
  var __env__: Record<string, string | undefined> | undefined
}

export const getEnv = (variableName: string): string | undefined => {
  if (import.meta.env.SSR) {
    return process.env[variableName] ?? import.meta.env[variableName]
  }

  return globalThis.__env__?.[variableName] ?? import.meta.env[variableName]
}
