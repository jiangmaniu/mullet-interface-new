import { router } from 'expo-router'

// 处理 Universal Link / Deep Link 的路径映射
// https://docs.expo.dev/router/advanced/native-intent/
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  // 取 /app-redirect 之后的路径，忽略前面的任何内容
  // /app-redirect/login → /login
  // /zh-tw/app-redirect/login → /login
  if (path.includes('/app-redirect')) {
    const url = new URL(path, 'https://placeholder.com')
    const idx = url.pathname.indexOf('/app-redirect')
    const mapped = url.pathname.substring(idx + '/app-redirect'.length) || '/'
    const result = mapped + url.search + url.hash

    if (initial) {
      return result
    }

    router.replace(result as any)
    return null
  }

  return path
}
