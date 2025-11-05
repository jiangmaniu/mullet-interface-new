import { atom, createStore } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import type { WritableAtom } from 'jotai'
import type { AsyncStorage, SyncStorage } from 'jotai/vanilla/utils/atomWithStorage'

export const jotaiStore = createStore()

export function atomWithToggle(initialValue?: boolean): WritableAtom<boolean, unknown[], boolean | undefined> {
  const anAtom = atom(initialValue, (get, set, nextValue?: boolean) => {
    const update = nextValue ?? !get(anAtom)
    set(anAtom, update)
  })

  return anAtom as unknown as WritableAtom<boolean, unknown[], boolean | undefined>
}

export function atomWithToggleAndStorage(
  ...arg: Parameters<typeof atomWithStorage<boolean>>
): WritableAtom<boolean, [nextValue?: boolean | undefined], void> {
  const anAtom = atomWithStorage(...arg)
  anAtom.debugPrivate = false
  const derivedAtom = atom(
    (get) => get(anAtom),
    (get, set, nextValue?: boolean) => {
      const update = nextValue ?? !get(anAtom)
      set(anAtom, update)
    },
  )

  derivedAtom.debugPrivate = false
  return derivedAtom
}

const isPromiseLike = (x: unknown): x is PromiseLike<unknown> => typeof (x as any)?.then === 'function'

export interface AsyncStringStorage {
  getItem: (key: string) => PromiseLike<string | null>
  setItem: (key: string, newValue: string) => PromiseLike<void>
  removeItem: (key: string) => PromiseLike<void>
}

export interface SyncStringStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, newValue: string) => void
  removeItem: (key: string) => void
}

export function createStorage<Value>(getStringStorage: () => AsyncStringStorage): AsyncStorage<Value>

export function createStorage<Value>(getStringStorage: () => SyncStringStorage): SyncStorage<Value>

export function createStorage<Value extends string>(
  getStringStorage: () => AsyncStringStorage | SyncStringStorage | undefined,
): AsyncStorage<Value> | SyncStorage<Value> {
  let lastStr: string | undefined
  let lastValue: any
  const storage: AsyncStorage<Value> | SyncStorage<Value> = {
    getItem: (key, initialValue) => {
      const parse = (str: string | null = '') => {
        if (str === null) {
          return initialValue
        }
        if (lastStr !== str) {
          lastValue = str
          lastStr = str
        }
        return lastValue
      }
      const str = getStringStorage()?.getItem(key) ?? null
      if (isPromiseLike(str)) {
        return str.then(parse)
      }
      return parse(str)
    },
    setItem: (key, newValue) => getStringStorage()?.setItem(key, newValue),
    removeItem: (key) => getStringStorage()?.removeItem(key),
  }
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    storage.subscribe = (key, callback, initialValue) => {
      if (!(getStringStorage() instanceof window.Storage)) {
        return () => {}
      }
      const storageEventCallback = (e: StorageEvent) => {
        if (e.storageArea === getStringStorage() && e.key === key) {
          const newValue: Value = (e.newValue as Value) ?? initialValue
          callback(newValue)
        }
      }
      window.addEventListener('storage', storageEventCallback)
      return () => {
        window.removeEventListener('storage', storageEventCallback)
      }
    }
  }
  return storage
}

export const defaultStorage = createStorage<any>(() =>
  typeof window !== 'undefined' ? (window.localStorage as any) : (undefined as unknown as Storage),
)

export const defaultJSONStorage = createJSONStorage<any>(() =>
  typeof window !== 'undefined' ? (window.localStorage as any) : (undefined as unknown as Storage),
)
