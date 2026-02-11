import { useLoginAuthStore } from "@/stores/login-auth"
import { useSegments, SplashScreen, router, usePathname } from "expo-router"
import { useEffect } from "react"

SplashScreen.preventAutoHideAsync()

export const LoginGuard = ({ children }: { children: React.ReactNode }) => {
  const accessToken = useLoginAuthStore((s) => s.accessToken)
  const hasHydrated = useLoginAuthStore((s) => s._hasHydrated)
  const redirectTo = useLoginAuthStore((s) => s.redirectTo)
  const { setRedirectTo } = useLoginAuthStore()
  const segments = useSegments()
  const pathname = usePathname()

  const inAuthGroup = segments[0] === '(auth)'

  useEffect(() => {
    if (!hasHydrated) return

    if (!accessToken && !inAuthGroup) {
      // 未登录且不在 auth 路由组，保存当前路径并跳转登录页
      setRedirectTo(pathname)
      router.replace('/(auth)/login')
    } else if (accessToken && inAuthGroup) {
      // 已登录且在 auth 路由组，重定向到回跳页面或首页
      const target = redirectTo || '/(tabs)'
      setRedirectTo(undefined)
      router.replace(target as '/')
    }

    SplashScreen.hideAsync()
  }, [hasHydrated, accessToken, inAuthGroup, redirectTo, setRedirectTo, pathname])

  if (!hasHydrated) return null

  return children
}
