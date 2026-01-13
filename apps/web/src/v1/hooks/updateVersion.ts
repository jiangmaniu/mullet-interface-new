import { isPCByWidth } from '@/utils'
import { checkVersion } from '@/utils/checkVersion'
import { useEffect, useState } from 'react'

export default function updateVersion() {
  const [isUpdateVersion, setIsUpdateVersion] = useState<boolean>(false)

  useEffect(() => {
    if (!isPCByWidth()) return

    let versionTimer
    // 交易版本是否更新
    if (isUpdateVersion) {
      clearInterval(versionTimer)
      return
    }
    versionTimer = setInterval(() => {
      checkVersion(() => {
        setIsUpdateVersion(true)
        console.log('版本更新')
      })
    }, 30 * 60 * 1000) // 30min

    return () => {
      // 清除定时器
      clearInterval(versionTimer)
    }
  }, [isUpdateVersion])
}
