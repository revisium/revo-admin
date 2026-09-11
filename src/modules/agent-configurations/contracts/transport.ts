import type { AgentConfigurationsSnapshot, AgentDefinitionPage } from './types'

export interface AgentConfigurationsTransportState {
  readonly status: string
  readonly error: string
}

export interface AgentConfigurationsTransport {
  definitions(signal: AbortSignal, after?: string): Promise<AgentDefinitionPage>
  subscribe(options: {
    readonly signal: AbortSignal
    readonly prepare: (signal: AbortSignal) => Promise<void>
    readonly next: (snapshot: AgentConfigurationsSnapshot, signal: AbortSignal) => void | Promise<void>
    readonly changed?: (state: AgentConfigurationsTransportState) => void
  }): { readonly done: Promise<void>; dispose(): void }
}
