import { useReactQueryDevTools } from '@dev-plugins/react-query'
import NetInfo from '@react-native-community/netinfo'
import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { PropsWithChildren, useEffect, useState } from 'react'
import { AppState, AppStateStatus, Platform } from 'react-native'

import { klinePersister } from '@/lib/kline-storage'

// 配置 onlineManager 以使用 NetInfo 检测网络状态
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected)
  })
})

// 创建默认的 QueryClient 配置
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // 在 React Native 中，通常不需要在窗口聚焦时重新获取
        refetchOnWindowFocus: false,
        // 失败后重试 3 次
        retry: 3,
        // 数据过期时间 5 分钟
        staleTime: 5 * 60 * 1000,
        // 缓存时间 10 分钟
        gcTime: 10 * 60 * 1000,
      },
      mutations: {
        // mutation 失败后重试 1 次
        retry: 1,
      },
    },
  })


export function QueryProvider({ children }: PropsWithChildren) {
  // 使用 useState 确保 QueryClient 只创建一次
  const [queryClient] = useState(() => createQueryClient())

  // 配置 focusManager 以监听 App 状态变化
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (Platform.OS !== 'web') {
        focusManager.setFocused(status === 'active')
      }
    })

    return () => subscription.remove()
  }, [])

  useReactQueryDevTools(queryClient)

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: klinePersister,
        // 缓存有效期 7 天
        maxAge: 7 * 24 * 60 * 60 * 1000,
        dehydrateOptions: {
          // 只持久化 symbol-kline 成功的查询
          shouldDehydrateQuery: (query) => {
            const [k0, k1, k2] = query.queryKey as string[]
            if (k0 === 'symbol-kline' && query.state.status === 'success') return true
            if (k0 === 'account' && k1 === 'wallet' && k2 === 'address' && query.state.status === 'success') return true
            return false
          },
        },
      }}
    >
      {children}
      {/* React Query DevTools - 仅在开发模式下启用 */}
      {__DEV__ && <QueryDevtools queryClient={queryClient} />}
    </PersistQueryClientProvider>
  )
}

/**
 * React Query DevTools 组件
 * 在开发模式下提供调试功能
 */
function QueryDevtools({ queryClient }: { queryClient: QueryClient }) {
  useEffect(() => {
    if (__DEV__) {
      // 在控制台暴露 queryClient 以便调试
      // @ts-ignore
      global.queryClient = queryClient

      // console.log('🔧 React Query DevTools enabled')
      // console.log('   Access queryClient via: global.queryClient')
      // console.log('   - global.queryClient.getQueryCache().getAll() - 查看所有查询')
      // console.log('   - global.queryClient.getMutationCache().getAll() - 查看所有 mutations')
      // console.log('   - global.queryClient.invalidateQueries() - 使所有查询失效')
    }
  }, [queryClient])

  return null
}

// 导出 queryClient 类型
export { QueryClient }
