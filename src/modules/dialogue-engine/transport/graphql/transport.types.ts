export interface GraphqlDialogueOptions {
  readonly endpoint: string
  readonly fetch?: typeof globalThis.fetch
  readonly headers?: Record<string, string>
  readonly credentials?: RequestCredentials
}
