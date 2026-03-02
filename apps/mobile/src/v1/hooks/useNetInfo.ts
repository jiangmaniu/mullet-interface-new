import { useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'

import { useStores } from '@/v1/provider/mobxProvider'

import { Config } from '../platform/config'

const ANDROID_PRIVACY_AGREEMENT = Config.ANDROID_PRIVACY_AGREEMENT

// 监听网络变化 动态导入库
const useNetInfo = () => {
  const { global } = useStores()
  const unsubscribe = useRef<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const privacyAccepted = global.showAndroidPrivacyModal === 1 // 已同意安卓弹窗协议

  const initModule = async () => {
    if (privacyAccepted || Platform.OS === 'ios' || !ANDROID_PRIVACY_AGREEMENT) {
      // @ts-ignore
      const netinfoModule = await import('@react-native-community/netinfo')
      unsubscribe.current = netinfoModule.addEventListener(async (state) => {
        const isConnected = state?.isConnected
        if (isConnected) {
          setIsConnected(true)
        }
      })
    }
  }

  useEffect(() => {
    initModule()
    return () => unsubscribe.current?.()
  }, [privacyAccepted])

  return {
    isConnected,
  }
}

export default useNetInfo
