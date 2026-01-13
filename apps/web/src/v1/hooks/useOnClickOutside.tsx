import { useEffect } from 'react'
/**
 * 判断是否点击自身元素，不是的话触发回调函数，（点击ref中的元素不会触发）
 * @param {Array} ref 每一项是ref的react的Dom元素，点击数组中传递过来的元素不会触发回调函数
 * @param {*} handler 回调函数
 */
const useClickOutside = (ref: any, handler: any) => {
  useEffect(() => {
    const listener = (event: any) => {
      const flag = ref.some((item: any) => {
        return !item.current || item.current.contains(event.target)
      })
      if (flag) {
        return
      }
      handler(event)
    }
    document.addEventListener('click', listener)
    return () => {
      document.removeEventListener('click', listener)
    }
  }, [ref, handler])
}

export default useClickOutside
