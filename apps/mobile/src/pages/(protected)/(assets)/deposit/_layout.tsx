import { useEffect, useRef } from 'react'
import { Stack } from 'expo-router'

import { useDepositStore } from './_store'

export default function DepositLayout() {
  const reset = useDepositStore((s) => s.reset)
  const resetRef = useRef(reset)

  // 保持 ref 最新
  useEffect(() => {
    resetRef.current = reset
  }, [reset])

  // 离开整个 deposit 模块时重置状态
  useEffect(() => () => resetRef.current(), [])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="qr-deposit/index" />
      <Stack.Screen name="wallet-deposit/index" />
      <Stack.Screen name="wallet-deposit/swap/index" />
      <Stack.Screen name="wallet-deposit/swap/confirm/index" />
      <Stack.Screen name="wallet-deposit/usdc/index" />
      <Stack.Screen name="wallet-deposit/usdc/confirm/index" />
    </Stack>
  )
}
