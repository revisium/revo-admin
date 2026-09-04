export type Right<T> = {
  isRight: true
  data: T
}

export type Left<E> = {
  isRight: false
  error: E
}

export type Either<E, T> = Left<E> | Right<T>

export const isRight = <E, T>(result: Either<E, T>): result is Right<T> => result.isRight

export const isLeft = <E, T>(result: Either<E, T>): result is Left<E> => !result.isRight
