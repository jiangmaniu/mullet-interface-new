import { usePrivy } from '@privy-io/expo'
import { useEffect, useRef } from 'react'

import { useAuthStore } from '@/stores/auth'

/**
 * 初始化认证状态
 * 将 Privy 的 getAccessToken 函数注入到 auth store 中
 */
export function AuthInitializer() {
  const { isReady, user, getAccessToken } = usePrivy()
  const { setGetPrivyAccessToken, checkAuth, loginWithPrivy } = useAuthStore()
  const hasAttemptedAuth = useRef(false)

  // // 注入 Privy getAccessToken 函数（包装一层错误处理）
  // useEffect(() => {
  //   const safeGetAccessToken = async () => {
  //     try {
  //       return await getAccessToken()
  //     } catch (error) {
  //       // 嵌入式钱包未初始化时会抛出错误，返回 null 让调用方处理
  //       console.warn('getAccessToken failed (wallet may not be ready):', error)
  //       return null
  //     }
  //   }
  //   setGetPrivyAccessToken(safeGetAccessToken)
  // }, [getAccessToken, setGetPrivyAccessToken])

  // // 当 Privy 登录成功后，自动登录后端
  // useEffect(() => {
  //   // 防止重复执行
  //   if (!isReady || !user || hasAttemptedAuth.current) {
  //     return
  //   }

  //   // 延迟执行，给嵌入式钱包时间初始化
  //   const timer = setTimeout(async () => {
  //     hasAttemptedAuth.current = true

  //     try {
  //       const isBackendAuthenticated = await checkAuth()
  //       if (!isBackendAuthenticated) {
  //         // 后端未认证，使用 Privy token 登录
  //         await loginWithPrivy()
  //       }
  //     } catch (error) {
  //       console.warn('Auth initialization failed:', error)
  //     }
  //   }, 500) // 给嵌入式钱包 500ms 初始化时间

  //   return () => clearTimeout(timer)
  // }, [isReady, user, checkAuth, loginWithPrivy])

  // // 当用户登出时，重置标志
  // useEffect(() => {
  //   if (!user) {
  //     hasAttemptedAuth.current = false
  //   }
  // }, [user])

  return null
}
