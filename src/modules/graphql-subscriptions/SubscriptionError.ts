import type { GraphQLError } from 'graphql'
import { NetworkError } from 'graphql-sse'

export class SubscriptionExecutionError extends Error {
  public constructor(public readonly errors: readonly Pick<GraphQLError, 'message' | 'extensions'>[]) {
    super(errors.map((error) => error.message).join('; '))
    this.name = 'SubscriptionExecutionError'
  }
}

export class SubscriptionOverflowError extends Error {
  public constructor() {
    super('Subscription consumer fell behind. Resume from an applied cursor or reload a snapshot.')
    this.name = 'SubscriptionOverflowError'
  }
}

export async function subscriptionError(error: unknown): Promise<unknown> {
  if (!(error instanceof NetworkError) || !(error.response instanceof Response)) return error

  try {
    const body: unknown = await error.response.json()

    if (body === null || typeof body !== 'object' || !('errors' in body) || !Array.isArray(body.errors)) return error
    const errors = body.errors.flatMap((item: unknown) => {
      if (item === null || typeof item !== 'object' || !('message' in item) || typeof item.message !== 'string')
        return []
      const extensions =
        'extensions' in item && item.extensions !== null && typeof item.extensions === 'object'
          ? { ...item.extensions }
          : {}

      return [{ message: item.message, extensions }]
    })

    return errors.length ? new SubscriptionExecutionError(errors) : error
  } catch {
    return error
  }
}
