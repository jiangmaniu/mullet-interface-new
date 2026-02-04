export interface IStore {
  hydrate?: () => PVoid
}

export type PVoid = Promise<void>
export type AnyObj = Record<string, unknown>
export type PureFunc = () => void
export type PureFuncAsync = () => PVoid
export type PureFuncArg<T> = (value?: T) => void
