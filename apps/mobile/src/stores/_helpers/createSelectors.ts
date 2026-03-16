import type { StoreApi, UseBoundStore } from 'zustand'

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

/**
 * 自动生成 selector hooks
 * 用法: const useStore = createSelectors(useStoreBase)
 * 访问: useStore.use.someField()
 */
export function createSelectors<S extends UseBoundStore<StoreApi<object>>>(_store: S) {
  const store = _store as WithSelectors<typeof _store>
  store.use = {} as Record<string, () => unknown>

  for (const key of Object.keys(store.getState())) {
    ;(store.use as Record<string, () => unknown>)[key] = () => store((s) => s[key as keyof typeof s])
  }

  return store
}
