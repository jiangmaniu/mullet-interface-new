# SparkLine Loading + K线缓存 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 1) SparkLine 渲染时显示 loading 骨架屏，SVG 实际绘制完成后再显示图表；2) K线数据通过 MMKV 持久化到本地，App 重启后直接渲染缓存数据。

**Architecture:**
- 需求1：在 `SparkLine` 组件内部用 `InteractionManager.runAfterInteractions` 延迟将 `ready` 状态置为 true，在 ready 前显示 Skeleton 占位，避免 44 个 SVG 同时计算阻塞 JS 线程。
- 需求2：安装 `@tanstack/react-query-persist-client` + `@tanstack/query-sync-storage-persister`，用 MMKV 实例实现同步 storage 接口，在 `QueryProvider` 中包裹 `PersistQueryClientProvider`，仅对 `symbol-kline` queryKey 持久化。

**Tech Stack:** react-native-mmkv, @tanstack/react-query-persist-client, @tanstack/query-sync-storage-persister, InteractionManager (React Native)

---

### Task 1: 安装持久化依赖

**Files:**
- Modify: `apps/mobile/package.json`

- [ ] **Step 1: 安装依赖**

```bash
cd /Users/maniu/Documents/Web/company/stellux/mullet/interface-featuter/apps/mobile
pnpm add @tanstack/react-query-persist-client @tanstack/query-sync-storage-persister
```

Expected: 安装成功，package.json 中出现两个新依赖。

- [ ] **Step 2: 验证安装**

```bash
cd /Users/maniu/Documents/Web/company/stellux/mullet/interface-featuter/apps/mobile
pnpm list @tanstack/react-query-persist-client @tanstack/query-sync-storage-persister
```

Expected: 两个包均显示已安装版本。

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/package.json
git commit -m "chore(deps): add react-query persist client and sync storage persister"
```

---

### Task 2: 创建 MMKV kline 缓存 storage

**Files:**
- Create: `apps/mobile/src/lib/kline-storage.ts`

- [ ] **Step 1: 创建文件**

```typescript
// apps/mobile/src/lib/kline-storage.ts
import { MMKV } from 'react-native-mmkv'

// 专用于 K线缓存的 MMKV 实例
const klineMMKV = new MMKV({ id: 'kline-cache' })

// 实现 @tanstack/query-sync-storage-persister 所需的同步 storage 接口
export const klineStorage = {
  getItem: (key: string): string | null => {
    return klineMMKV.getString(key) ?? null
  },
  setItem: (key: string, value: string): void => {
    klineMMKV.set(key, value)
  },
  removeItem: (key: string): void => {
    klineMMKV.delete(key)
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/lib/kline-storage.ts
git commit -m "feat(cache): add MMKV storage adapter for kline cache"
```

---

### Task 3: 改造 QueryProvider 支持 K线持久化

**Files:**
- Modify: `apps/mobile/src/components/providers/query-provider.tsx`

- [ ] **Step 1: 修改 query-provider.tsx**

将文件内容替换为：

```typescript
import { useReactQueryDevTools } from '@dev-plugins/react-query'
import NetInfo from '@react-native-community/netinfo'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { focusManager, onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { PropsWithChildren, useEffect, useState } from 'react'
import { AppState, AppStateStatus, Platform } from 'react-native'

import { klineStorage } from '@/lib/kline-storage'

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
        refetchOnWindowFocus: false,
        retry: 3,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      },
      mutations: {
        retry: 1,
      },
    },
  })

// MMKV 同步 persister，仅持久化 symbol-kline 查询
const klinePersister = createSyncStoragePersister({
  storage: klineStorage,
  key: 'REACT_QUERY_KLINE_CACHE',
})

export function QueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => createQueryClient())

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
        // 只持久化 symbol-kline 查询，缓存有效期 7 天
        maxAge: 7 * 24 * 60 * 60 * 1000,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.queryKey[0] === 'symbol-kline' && query.state.status === 'success',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        {__DEV__ && <QueryDevtools queryClient={queryClient} />}
      </QueryClientProvider>
    </PersistQueryClientProvider>
  )
}

function QueryDevtools({ queryClient }: { queryClient: QueryClient }) {
  useEffect(() => {
    if (__DEV__) {
      // @ts-ignore
      global.queryClient = queryClient
    }
  }, [queryClient])

  return null
}

export { QueryClient }
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/components/providers/query-provider.tsx
git commit -m "feat(cache): integrate MMKV persister into QueryProvider for kline cache"
```

---

### Task 4: 更新 useSymbolKline 支持缓存初始数据

**Files:**
- Modify: `apps/mobile/src/pages/(protected)/(tabs)/home/_hooks/use-symbol-kline.ts`

- [ ] **Step 1: 修改 use-symbol-kline.ts，增加 initialData 和更长的 gcTime**

```typescript
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

import { ChartData } from '@/components/trading-view'
import { request } from '@/v1/utils/request'

interface KlineItem {
  klineTime: number
  open: number
  high: number
  low: number
  close: number
}

interface GetSymbolKlineParams {
  symbol: string
  klineType: string
  size: number
}

export const useGetSymbolKlineOptions = (params: GetSymbolKlineParams) => {
  const getSymbolKlineOptions = queryOptions({
    queryKey: ['symbol-kline', params.symbol, params.klineType],
    placeholderData: keepPreviousData,
    queryFn: useCallback(async () => {
      const res = await request<API.Response<string[]>>('/api/trade-market/marketApi/kline/symbol/klineList', {
        params: {
          symbol: params.symbol,
          klineType: params.klineType,
          size: params.size,
          current: 1,
        },
      })

      if (res?.data) {
        const klineData: KlineItem[] = res.data
          .map((item) => {
            const [klineTime, open, high, low, close] = item.split(',')
            return {
              klineTime: Number(klineTime),
              open: Number(open),
              high: Number(high),
              low: Number(low),
              close: Number(close),
            }
          })
          .reverse()

        const chartData: ChartData[] = klineData.map((item) => ({
          time: Math.floor(item.klineTime / 1000),
          value: item.close,
        }))

        return chartData
      }

      return []
    }, [params]),
    refetchInterval: 15 * 60 * 1000,
    staleTime: 14 * 60 * 1000,
    // 延长内存缓存时间，配合持久化缓存
    gcTime: 7 * 24 * 60 * 60 * 1000,
    refetchOnMount: true,
  })

  return { getSymbolKlineOptions }
}

export const useSymbolKline = (symbol: string) => {
  const { getSymbolKlineOptions } = useGetSymbolKlineOptions({
    symbol,
    klineType: '15min',
    size: 100,
  })

  return useQuery(getSymbolKlineOptions)
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/pages/(protected)/(tabs)/home/_hooks/use-symbol-kline.ts
git commit -m "feat(cache): extend gcTime for kline queries to support persistence"
```

---

### Task 5: SparkLine 添加 InteractionManager 延迟渲染

**Files:**
- Modify: `apps/mobile/src/components/charts/spark-line.tsx`

- [ ] **Step 1: 修改 spark-line.tsx，加入 ready 状态和 Skeleton**

```typescript
import React, { useEffect, useMemo, useState } from 'react'
import { InteractionManager, ViewStyle } from 'react-native'
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg'

import { Skeleton } from '@/components/ui/skeleton'

interface SparkLineProps {
  /** 数据点数组，空数组时显示居中横线 */
  data: { time: number; value: number }[]
  /** 线条颜色 */
  color: string
  /** 宽度 */
  width: number
  /** 高度 */
  height: number
  /** 线条宽度 */
  strokeWidth?: number
  /** 是否显示面积填充 */
  fillEnabled?: boolean
  style?: ViewStyle
}

function buildLinePath(data: { value: number }[], width: number, height: number, padding = 1): string {
  if (data.length < 2) return ''

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min

  if (range === 0) {
    const midY = height / 2
    return `M0,${midY.toFixed(2)} L${width.toFixed(2)},${midY.toFixed(2)}`
  }

  const stepX = width / (data.length - 1)

  return data
    .map((point, i) => {
      const x = i * stepX
      const y = height - padding - ((point.value - min) / range) * (height - padding * 2)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
}

function buildAreaPath(linePath: string, width: number, height: number): string {
  if (!linePath) return ''
  return `${linePath} L${width.toFixed(2)},${height} L0,${height} Z`
}

export const SparkLine = React.memo(function SparkLine({
  data = [],
  color,
  width,
  height,
  strokeWidth = 1,
  fillEnabled = false,
  style,
}: SparkLineProps) {
  // 等待交互动画完成后再渲染 SVG，避免列表滚动时 44 个 SVG 同时计算阻塞 JS 线程
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true)
    })
    return () => task.cancel()
  }, [])

  const { linePath, areaPath } = useMemo(() => {
    if (data.length < 2) {
      const midY = height / 2
      const line = `M0,${midY.toFixed(2)} L${width.toFixed(2)},${midY.toFixed(2)}`
      const area = fillEnabled ? buildAreaPath(line, width, height) : ''
      return { linePath: line, areaPath: area }
    }
    const line = buildLinePath(data, width, height)
    const area = fillEnabled ? buildAreaPath(line, width, height) : ''
    return { linePath: line, areaPath: area }
  }, [data, width, height, fillEnabled])

  if (!ready) {
    return <Skeleton style={{ width, height, borderRadius: 4, ...(style as object) }} />
  }

  if (!linePath) return null

  const gradientId = `sparkGrad_${color.replace('#', '')}`

  return (
    <Svg width={width} height={height} style={style}>
      {fillEnabled && (
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.4} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
      )}
      {fillEnabled && areaPath ? <Path d={areaPath} fill={`url(#${gradientId})`} /> : null}
      <Path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
})
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/components/charts/spark-line.tsx
git commit -m "feat(ui): defer SparkLine SVG render with InteractionManager to show skeleton during load"
```

---

### Task 6: 验证

- [ ] **Step 1: 检查 TypeScript 编译**

```bash
cd /Users/maniu/Documents/Web/company/stellux/mullet/interface-featuter/apps/mobile
npx tsc --noEmit
```

Expected: 无类型错误。

- [ ] **Step 2: 验证 MMKV 缓存写入**

启动 App，进入首页，等待 K线数据加载完成后，在 Metro 控制台执行：

```javascript
// 在 __DEV__ 模式下验证缓存
global.queryClient.getQueryCache().findAll({ queryKey: ['symbol-kline'] }).length
// Expected: > 0，说明有 K线查询被缓存
```

- [ ] **Step 3: 验证持久化**

重启 App（不清除数据），进入首页，观察 K线图是否立即显示（无 loading），说明缓存命中。

- [ ] **Step 4: 验证 SparkLine loading**

首次进入首页时，K线图区域应显示 Skeleton 骨架屏，交互动画完成后切换为 SVG 图表。

