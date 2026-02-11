import { stores } from "@/v1/provider/mobxProvider"
import { useCallback, useEffect, useState } from "react"
import { Platform, Text, View } from "react-native"

let unsubscribe: (() => void) | undefined

export const GlobalStateInitializer = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false)

  const startApp = async () => {
    await stores.global.onStartApp()
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
    return <View className="flex justify-center items-center">
      <Text className="text-content-1 text-paragraph-p2">loading...</Text>
    </View>
  }

  return (
    <>
      {children}
    </>
  )
}
