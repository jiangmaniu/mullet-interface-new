import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'
import { useAppKitEventSubscription } from '@reown/appkit-react-native'

import { useAccount, useAppKit, useAppKitState } from '@/lib/appkit'
import { useLoginAuthStore } from '@/stores/login-auth'

interface UseWeb3LoginFlowOptions {
  /** 是否自动授权（用于 401 重定向且钱包已连接的情况） */
  autoAuth?: boolean
}

/**
 * Web3 登录流程 hook
 * 处理 iOS/Android 平台差异：
 * - iOS: 先打开 AppKit 连接钱包，成功后再拉起签名 Drawer（避免 Modal 叠加）
 * - Android: 直接拉起 Drawer，在 Drawer 内打开 AppKit 连接钱包
 */
export function useWeb3LoginFlow({ autoAuth = false }: UseWeb3LoginFlowOptions = {}) {
  const { open: openAppKit } = useAppKit()
  const { isConnected: isWalletConnected } = useAccount()
  const { isOpen: isAppKitOpen } = useAppKitState()
  const isBackendAuthenticated = useLoginAuthStore((state) => state.accessToken)

  // Drawer 可见状态
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)
  // iOS 钱包连接错误信息
  const [connectionError, setConnectionError] = useState('')
  // 标记是否在等待钱包连接后打开 Drawer（避免 iOS Modal 叠加）
  const pendingDrawerOpenRef = useRef(false)
  const prevAppKitOpenRef = useRef(false)

  // 处理 autoAuth - 当 401 重定向且钱包已连接时自动打开抽屉
  useEffect(() => {
    if (autoAuth && isWalletConnected && !isBackendAuthenticated) {
      console.log('Auto auth mode: wallet connected, opening drawer for re-authorization...')
      setIsDrawerVisible(true)
    }
  }, [autoAuth, isWalletConnected, isBackendAuthenticated])

  // iOS: 检测 AppKit 关闭但未成功连接的情况
  useEffect(() => {
    if (Platform.OS === 'ios' && prevAppKitOpenRef.current && !isAppKitOpen && pendingDrawerOpenRef.current) {
      // AppKit 模态框关闭但未触发 CONNECT_SUCCESS
      pendingDrawerOpenRef.current = false
      setConnectionError('钱包连接已取消')
    }
    prevAppKitOpenRef.current = isAppKitOpen
  }, [isAppKitOpen])

  // 打开 Web3 登录
  const startLogin = useCallback(() => {
    setConnectionError('')
    if (Platform.OS === 'ios' && !isWalletConnected) {
      // iOS: 钱包未连接时先打开 AppKit 连接，避免 Drawer Modal 与 AppKit Modal 叠加
      pendingDrawerOpenRef.current = true
      openAppKit({ view: 'Connect' })
    } else {
      // Android / 钱包已连接：直接打开 Drawer
      setIsDrawerVisible(true)
    }
  }, [isWalletConnected, openAppKit])

  // 监听钱包连接成功事件，AppKit 关闭后再打开 Drawer
  useAppKitEventSubscription(
    'CONNECT_SUCCESS',
    useCallback((event) => {
      if (event.data.event === 'CONNECT_SUCCESS' && event.data.address && pendingDrawerOpenRef.current) {
        pendingDrawerOpenRef.current = false
        // 等 AppKit 模态框关闭后再打开 Drawer
        setTimeout(() => {
          setIsDrawerVisible(true)
        }, 300)
      }
    }, []),
  )

  // 关闭抽屉
  const closeDrawer = useCallback(() => {
    setIsDrawerVisible(false)
  }, [])

  return {
    isDrawerVisible,
    connectionError,
    startLogin,
    closeDrawer,
  }
}
