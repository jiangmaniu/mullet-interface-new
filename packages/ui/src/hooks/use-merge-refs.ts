import { useMemo } from 'react'
import type { Ref, RefCallback } from 'react'

export type ReactRef<T> = Ref<T>

export function mergeRefs<T>(...refs: ReactRef<T>[]): RefCallback<T> {
  return (value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value)
      } else if (ref != null && typeof ref === 'object') {
        ;(ref as { current: T | null }).current = value
      }
    })
  }
}

export function useMergeRefs<T>(...refs: ReactRef<T>[]): RefCallback<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => mergeRefs(...refs), refs)
}
