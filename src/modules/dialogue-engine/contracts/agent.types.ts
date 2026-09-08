export interface AgentDefinition {
  readonly id: string
  readonly version: string
  readonly name: string
  readonly description: string
}

export type AgentOption =
  | { readonly kind: 'boolean'; readonly id: string; readonly name: string; readonly value: boolean }
  | {
      readonly kind: 'select'
      readonly id: string
      readonly name: string
      readonly value: string
      readonly choices: readonly { readonly value: string; readonly name: string }[]
    }

export interface AgentConfiguration {
  readonly revision: string
  readonly options: readonly AgentOption[]
}
