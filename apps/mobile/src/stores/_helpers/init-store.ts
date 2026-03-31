import { useRootStore } from '..'

// 递归调用各 slice 及子命名空间的 initSubscribe（如果存在）
const callInitSubscribe = (slice: any) => {
  if (!slice || typeof slice !== 'object') return
  if (typeof slice.initSubscribe === 'function') slice.initSubscribe()
  Object.values(slice).forEach((child) => {
    if (child && typeof child === 'object' && typeof (child as any).initSubscribe === 'function') {
      callInitSubscribe(child)
    }
  })
}

/** 在 i18n 激活后调用，确保 initSubscribe 中使用 Lingui 的逻辑不会报错 */
export const initStoreSubscribes = () => {
  Object.values(useRootStore.getState()).forEach(callInitSubscribe)
}
