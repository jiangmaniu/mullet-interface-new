import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useState } from 'react'
import { Platform, Text, View } from 'react-native'

import { fetchRemoteConfig } from '@/v1/env'

let unsubscribe: (() => void) | undefined

export const GlobalStateInitializer = observer(({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false)

  const startApp = async () => {
    // 拉取动态域名配置信息
    await fetchRemoteConfig()
  }

  const initApp = useCallback(async () => {
    if (Platform.OS === 'android') {
      await startApp()
      setReady(true)
      return
    } else {
      // @ts-ignore
      const netinfoModule = await import('@react-native-community/netinfo')
      unsubscribe = netinfoModule.addEventListener(async (state) => {
        const isConnected = state?.isConnected
        if (isConnected) {
          await startApp()
        }
      })
      setReady(true)
      return unsubscribe
    }
  }, [])

  useEffect(() => {
    initApp()
  }, [initApp])

  if (!ready) {
    return (
      <View className="flex flex-1 items-center justify-center">
        <Text className="text-content-1 text-paragraph-p2">loading...</Text>
      </View>
    )
  }

  return <>{children}</>
})
