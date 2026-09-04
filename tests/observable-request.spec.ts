import type { ClientError } from 'graphql-request'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isLeft, isRight } from 'src/shared/lib/Either'
import { AbortError, ObservableRequest } from 'src/shared/lib/ObservableRequest'

type Deferred<T> = {
  promise: Promise<T>
  resolve: (value: T) => void
}

const deferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolveFn) => {
    resolve = resolveFn
  })

  return { promise, resolve }
}

const clientError = (message: string): ClientError =>
  ({ response: { errors: [{ message }] } }) as unknown as ClientError

describe('ObservableRequest', () => {
  let consoleError: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleError.mockRestore()
  })

  it('creates a request with the upstream factory and passes only declared arguments', async () => {
    const fetchFunction = vi.fn(async (projectId: string) => `project-${projectId}`)
    const request = ObservableRequest.of<string, [string], ClientError>(fetchFunction)

    const result = await request.fetch('7')

    expect(isRight(result) && result.data).toBe('project-7')
    expect(fetchFunction).toHaveBeenCalledWith('7')
  })

  it('sets data directly as a loaded value', () => {
    const request = new ObservableRequest<string, [], ClientError>(async () => 'value')

    request.setDataDirectly('cached')

    expect(request.data).toBe('cached')
    expect(request.isLoaded).toBe(true)
    expect(request.isLoading).toBe(false)
  })

  it('exposes the first GraphQL error message after a failed request', async () => {
    const failure = clientError('offline')
    const request = new ObservableRequest<string, [], ClientError>(() => Promise.reject(failure))

    const result = await request.fetch()

    expect(isLeft(result) && result.error).toBe(failure)
    expect(request.errorMessage).toBe('offline')
    expect(consoleError).toHaveBeenCalledWith(failure)
  })

  it('returns an AbortError and completes loading when a request is aborted', async () => {
    const call = deferred<string>()
    const request = new ObservableRequest<string, [], ClientError>(() => call.promise)

    const settled = request.fetch()
    request.abort()
    call.resolve('discarded')

    const result = await settled

    expect(isLeft(result) && result.error).toBeInstanceOf(AbortError)
    expect(request.data).toBeNull()
    expect(request.isLoading).toBe(false)
    expect(request.isLoaded).toBe(true)
  })

  it('keeps the loaded state while resetting data for a subsequent request', async () => {
    const second = deferred<string>()
    const request = new ObservableRequest<string, [], ClientError>(
      vi.fn().mockResolvedValueOnce('first').mockReturnValueOnce(second.promise),
    )

    await request.fetch()
    const secondSettled = request.fetch()

    expect(request.data).toBeNull()
    expect(request.error).toBeNull()
    expect(request.isLoaded).toBe(true)
    expect(request.isLoading).toBe(true)

    second.resolve('second')
    await secondSettled
  })

  it('preserves previous values between calls when skipResetting is set', async () => {
    const second = deferred<string>()
    const failure = clientError('offline')
    const request = new ObservableRequest<string, [], ClientError>(
      vi.fn().mockRejectedValueOnce(failure).mockReturnValueOnce(second.promise),
      { skipResetting: true },
    )

    await request.fetch()
    const secondSettled = request.fetch()

    expect(request.data).toBeNull()
    expect(request.errorMessage).toBe('offline')
    expect(request.isLoaded).toBe(true)
    expect(request.isLoading).toBe(true)

    second.resolve('second')
    await secondSettled
  })

  it('allows a superseded request to complete the shared loading state in its finally block', async () => {
    const first = deferred<string>()
    const second = deferred<string>()
    const fetchFunction = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const request = new ObservableRequest<string, [], ClientError>(fetchFunction)

    const firstSettled = request.fetch()
    const secondSettled = request.fetch()
    first.resolve('first')

    const firstResult = await firstSettled

    expect(isLeft(firstResult) && firstResult.error).toBeInstanceOf(AbortError)
    expect(request.isLoading).toBe(false)
    expect(request.isLoaded).toBe(true)
    expect(request.data).toBeNull()

    second.resolve('second')
    await secondSettled
  })
})
