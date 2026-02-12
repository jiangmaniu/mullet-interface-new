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

  const inPublicGroup = segments[0]?.includes('(public)')

  useEffect(() => {
    if (!hasHydrated) return

    if (!accessToken && !inPublicGroup) {
      // 未登录且不在 auth 路由组，保存当前路径并跳转登录页
      setRedirectTo(pathname)
      router.replace('/login')
    }

    SplashScreen.hideAsync()
  }, [hasHydrated, accessToken, inPublicGroup, redirectTo, setRedirectTo, pathname])

  if (!hasHydrated) return null

  return children
}
