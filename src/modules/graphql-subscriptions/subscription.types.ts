import type { TypedDocumentNode } from '@graphql-typed-document-node/core'

export type SubscriptionStatus = 'Connecting' | 'Live' | 'Reconnecting' | 'Offline' | 'Stopped'

export interface SubscriptionState {
  readonly status: SubscriptionStatus
  readonly error: string
}

export interface SubscriptionOptions<Data, Variables extends Record<string, unknown>> {
  readonly signal: AbortSignal
  readonly prepare: (signal: AbortSignal) => Variables | Promise<Variables>
  readonly next: (data: Data, signal: AbortSignal) => void | Promise<void>
  readonly changed?: (state: SubscriptionState) => void
  readonly recover?: (error: unknown, signal: AbortSignal) => boolean | Promise<boolean>
}

export interface SubscriptionLease {
  readonly done: Promise<void>
  dispose(): void
}

export interface SubscriptionTransport {
  subscribe<Data, Variables extends Record<string, unknown>>(
    document: TypedDocumentNode<Data, Variables>,
    options: SubscriptionOptions<Data, Variables>,
  ): SubscriptionLease
}

export interface GraphqlSubscriptionsOptions {
  readonly endpoint: string
  readonly fetch?: typeof globalThis.fetch
  readonly headers?: Record<string, string>
  readonly credentials?: RequestCredentials
  readonly enabled?: () => boolean
  readonly heartbeatTimeoutMs?: number
  readonly connectTimeoutMs?: number
  readonly idleGraceMs?: number
  readonly retryAttempts?: number
  readonly retryDelayMs?: number
  readonly queueLimit?: number
}
