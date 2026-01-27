import { usePrivy } from '@privy-io/expo'
import { useEffect } from 'react'

import { useAuthStore } from '@/stores/auth'

/**
 * 初始化认证状态
 * 将 Privy 的 getAccessToken 函数注入到 auth store 中
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { isReady, user, getAccessToken } = usePrivy()
  const { setGetPrivyAccessToken, checkAuth, loginWithPrivy } = useAuthStore()

  // 注入 Privy getAccessToken 函数
  useEffect(() => {
    setGetPrivyAccessToken(getAccessToken)
  }, [getAccessToken, setGetPrivyAccessToken])

  // 当 Privy 登录成功后，自动登录后端
  useEffect(() => {
    if (isReady && user) {
      // Privy 已登录，检查并同步后端认证状态
      checkAuth().then((isBackendAuthenticated) => {
        if (!isBackendAuthenticated) {
          // 后端未认证，使用 Privy token 登录
          loginWithPrivy()
        }
      })
    }
  }, [isReady, user, checkAuth, loginWithPrivy])

  return <>{children}</>
}
