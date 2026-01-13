import { useEffect } from 'react'

import { useLang } from '@/context/languageProvider'

/**
 * 监听切换语言重新发起请求
 * @param callback useEffect回调函数
 * @param dependencies useEffect依赖项
 */
const useLangChange = (callback: () => void, dependencies?: any[]) => {
  const { lng } = useLang()
  useEffect(() => {
    callback()
  }, [lng, ...(dependencies || [])])
}

export default useLangChange
