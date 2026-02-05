import { stores } from "@/v1/provider/mobxProvider"

/**
 * AuthInitializer - 认证初始化组件
 *
 * 注意：getPrivyAccessToken 不再存储在 store 中，
 * 而是由各组件直接从 usePrivy() 获取并传入 loginWithPrivy(token)
 */
export function AuthInitializer() {

  const startApp = async () => {
    try {
      await stores.global.onStartApp()
    } catch (e) {
    } finally {
      // 用来控制APP加载启动前做的一些事情、如果没有授权网络先启动应用
      setReady(true)
    }
  }

  return null
}
