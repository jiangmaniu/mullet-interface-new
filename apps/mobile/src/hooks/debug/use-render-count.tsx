import { useEffect, useRef } from 'react'

/**
 * 组件渲染计数
 * useRenderCount(`Item-${symbol}`)
 * @param name
 */
export const useRenderCount = (name: string) => {
  const count = useRef(0)

  count.current++

  useEffect(() => {
    if (__DEV__) {
      // console.log(`[render] ${name}:`, count.current)
    }
  })
}
