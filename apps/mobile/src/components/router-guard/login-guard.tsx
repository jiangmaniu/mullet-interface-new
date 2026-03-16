import { useRootStore } from "@/stores"
import { useSegments, SplashScreen, router, usePathname } from "expo-router"
import { useEffect } from "react"

SplashScreen.preventAutoHideAsync()

export const LoginGuard = ({ children }: { children: React.ReactNode }) => {
  const accessToken = useRootStore((s) => s.user.auth.accessToken)
  const redirectTo = useRootStore((s) => s.user.auth.redirectTo)
  const setAuth = useRootStore((s) => s.user.auth.setAuth)
  const segments = useSegments()
  const pathname = usePathname()

  const inPublicGroup = segments[0]?.includes('(public)')

  useEffect(() => {
    if (!accessToken && !inPublicGroup) {
      // 未登录且不在 auth 路由组，保存当前路径并跳转登录页
      setAuth({ redirectTo: pathname })
      router.replace('/login')
    }

    SplashScreen.hideAsync()
  }, [accessToken, inPublicGroup, redirectTo, setAuth, pathname])

  return children
}
