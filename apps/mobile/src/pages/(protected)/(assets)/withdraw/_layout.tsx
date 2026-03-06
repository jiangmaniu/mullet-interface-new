import { useEffect, useRef } from 'react'
import { Stack } from 'expo-router'

import { useWithdrawStore } from './_store'

export default function WithdrawLayout() {
  const reset = useWithdrawStore((s) => s.reset)
  const resetRef = useRef(reset)

  // 保持 ref 最新
  useEffect(() => {
    resetRef.current = reset
  }, [reset])

  // 离开整个 withdraw 模块时重置状态
  useEffect(() => () => resetRef.current(), [])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="crypto/index" />
      <Stack.Screen name="crypto/usdc/index" />
      <Stack.Screen name="crypto/verify/index" />
      <Stack.Screen name="crypto/usdc/confirm/index" />
      <Stack.Screen name="crypto/swap/index" />
    </Stack>
  )
}
