import { makeAutoObservable } from 'mobx'
import type { Either } from './Either'
import { errorMessageOf } from './error-formatting'

type FetchFunction<T, A extends any[]> = (...args: A) => Promise<T>
type Options = { skipResetting?: boolean }

export class AbortError extends Error {
  constructor() {
    super('Aborted')
    this.name = 'AbortError'
  }
}

export class ObservableRequest<T, Args extends any[], E = unknown> {
  private _data: T | null = null
  private _error: E | null = null
  private _isLoading: boolean = false
  private _isLoaded: boolean = false
  private _abortController: AbortController | null = null
  private _generation = 0

  public static of<T, Args extends any[], E = unknown>(fetchFunction: FetchFunction<T, Args>, options?: Options) {
    return new ObservableRequest<T, Args, E>(fetchFunction, options)
  }

  constructor(
    private readonly fetchFunction: FetchFunction<T, Args>,
    private readonly options?: Options,
  ) {
    makeAutoObservable(this)
  }

  public get data(): T | null {
    return this._data
  }

  public get isLoading(): boolean {
    return this._isLoading
  }

  public get isLoaded(): boolean {
    return this._isLoaded
  }

  public get error(): E | null {
    return this._error
  }

  public get errorMessage() {
    return errorMessageOf(this._error)
  }

  public abort(): void {
    this._generation += 1
    this._abortController?.abort()
    this._abortController = null
    this._isLoading = false
    this._isLoaded = true
  }

  public setDataDirectly(value: T | null): void {
    this._data = value
    this._isLoaded = true
  }

  public async fetch(...args: Args): Promise<Either<E | AbortError, T>> {
    const { signal, generation } = this.beginRequest()

    try {
      const result = await this.fetchFunction(...args)

      return this.acceptResult(signal, result)
    } catch (error) {
      return this.rejectResult(signal, error)
    } finally {
      this.finish(generation)
    }
  }

  private beginRequest(): { signal: AbortSignal; generation: number } {
    this._abortController?.abort()
    this._generation += 1
    this._abortController = new AbortController()

    if (!this.options?.skipResetting) {
      this.reset()
    }

    this.setIsLoading(true)

    return { signal: this._abortController.signal, generation: this._generation }
  }

  private acceptResult(signal: AbortSignal, result: T): Either<E | AbortError, T> {
    if (signal.aborted) {
      return this.abortedResult()
    }

    this.setError(null)
    this.setData(result)

    return { isRight: true, data: result }
  }

  private rejectResult(signal: AbortSignal, error: unknown): Either<E | AbortError, T> {
    if (signal.aborted) {
      return this.abortedResult()
    }

    console.error(error)
    this.setError(error as E)

    return { isRight: false, error: error as E }
  }

  private abortedResult(): Either<E | AbortError, T> {
    return { isRight: false, error: new AbortError() }
  }

  private reset() {
    this.setIsLoading(false)
    this.setData(null)
    this.setError(null)
  }

  private setData(value: T | null): void {
    this._data = value
  }

  private setIsLoading(value: boolean) {
    this._isLoading = value
  }

  private setError(value: E | null): void {
    this._error = value
  }

  private finish(generation: number): void {
    if (generation !== this._generation) {
      return
    }

    this._abortController = null
    this._isLoading = false
    this._isLoaded = true
  }
}
