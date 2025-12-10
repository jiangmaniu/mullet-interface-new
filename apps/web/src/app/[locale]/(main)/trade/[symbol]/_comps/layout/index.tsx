'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Layout, Responsive, WidthProvider } from 'react-grid-layout'

import './styles.css'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import { PageLoading } from '@/components/loading/page-loading'

import { TradeLayoutKey, TradeLayoutSlots } from './types'

const ResponsiveGridLayout = WidthProvider(Responsive)

// 固定高度配置（组件外部常量）
const FIXED_HEIGHTS = {
  [TradeLayoutKey.Tabs]: 34 + 8, // h值
  [TradeLayoutKey.Overview]: 60 + 8,
  [TradeLayoutKey.Tradingview]: 580 + 8,
  [TradeLayoutKey.Position]: 320 + 8,
  [TradeLayoutKey.Account]: 162 + 8,
}

const ROW_HEIGHT = 1
const MARGIN = 0
const CONTAINER_PADDING = 4

// 默认容器尺寸
const DEFAULT_CONTAINER_WIDTH = 1440
const DEFAULT_CONTAINER_HEIGHT = 1080

// 计算实际像素高度的辅助函数（无 margin）
const calculateActualHeight = (h: number) => h * ROW_HEIGHT

// 计算 tradingview 的动态高度
const calculateTradingviewHeight = (containerHeight: number) => {
  const tabsHeight = calculateActualHeight(FIXED_HEIGHTS[TradeLayoutKey.Tabs])
  const overviewHeight = calculateActualHeight(FIXED_HEIGHTS[TradeLayoutKey.Overview])
  const positionHeight = calculateActualHeight(FIXED_HEIGHTS[TradeLayoutKey.Position])

  // 容器内边距（上下）
  const totalContainerPadding = CONTAINER_PADDING * 2

  // 可用高度 = 容器高度 - 固定元素高度 - 容器内边距（无间距）
  const availableHeight = containerHeight - tabsHeight - overviewHeight - positionHeight - totalContainerPadding

  // 将像素高度转换回 h 值：h = height / rowHeight（无 margin）
  const tradingviewH = Math.floor(availableHeight / ROW_HEIGHT)

  return Math.max(tradingviewH, 6) // 最小高度为 6
}

// 固定宽度配置（像素）
const FIXED_WIDTHS = {
  action: 320 + 8,
  orderbooks: 320 + 8,
}

const TOTAL_COLS = 12

// 根据容器宽度计算固定宽度对应的列数
const calculateColsFromWidth = (targetWidth: number, containerWidth: number) => {
  const availableWidth = containerWidth - CONTAINER_PADDING * 2
  const colWidth = availableWidth / TOTAL_COLS
  const cols = targetWidth / colWidth
  return Math.min(cols, TOTAL_COLS)
}

// 根据容器尺寸计算所有布局参数
const calculateLayoutCols = (containerWidth: number) => {
  const actionCols = calculateColsFromWidth(FIXED_WIDTHS.action, containerWidth)
  const orderbooksCols = calculateColsFromWidth(FIXED_WIDTHS.orderbooks, containerWidth)
  const leftAreaCols = TOTAL_COLS - actionCols - orderbooksCols
  return { actionCols, orderbooksCols, leftAreaCols }
}

// 本地存储 key
const LAYOUT_CACHE_KEY = 'trade-layout-cache'

// 从本地存储读取布局配置
const getLayoutFromCache = () => {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem(LAYOUT_CACHE_KEY)
    if (cached) {
      const data = JSON.parse(cached)
      // 验证数据有效性
      if (data.layouts && data.containerWidth && data.containerHeight) {
        return data
      }
    }
  } catch (e) {
    console.warn('Failed to load layout from cache:', e)
  }
  return null
}

// 保存布局配置到本地存储
const saveLayoutToCache = (layouts: { [key: string]: Layout[] }, containerWidth: number, containerHeight: number) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      LAYOUT_CACHE_KEY,
      JSON.stringify({
        layouts,
        containerWidth,
        containerHeight,
        timestamp: Date.now(),
      }),
    )
  } catch (e) {
    console.warn('Failed to save layout to cache:', e)
  }
}

interface TradeLayoutProps {
  slots: TradeLayoutSlots
}

export const TradeLayout = ({ slots }: TradeLayoutProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const hasValidCache = useRef(false)

  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>(() => {
    // 尝试从缓存读取
    const cached = getLayoutFromCache()
    if (cached) {
      hasValidCache.current = true
      return cached.layouts
    }

    // 缓存不存在，使用默认值计算
    const containerWidth = DEFAULT_CONTAINER_WIDTH
    const containerHeight = DEFAULT_CONTAINER_HEIGHT

    const { actionCols, orderbooksCols, leftAreaCols } = calculateLayoutCols(containerWidth)
    const tradingviewHeight = Math.max(
      calculateTradingviewHeight(containerHeight),
      FIXED_HEIGHTS[TradeLayoutKey.Tradingview],
    )
    const orderbooksHeight =
      FIXED_HEIGHTS[TradeLayoutKey.Tabs] + FIXED_HEIGHTS[TradeLayoutKey.Overview] + tradingviewHeight
    const actionHeight =
      orderbooksHeight + FIXED_HEIGHTS[TradeLayoutKey.Position] - FIXED_HEIGHTS[TradeLayoutKey.Account]

    const initialLayout: Layout[] = [
      {
        i: TradeLayoutKey.Tabs,
        x: 0,
        y: 0,
        w: leftAreaCols,
        h: FIXED_HEIGHTS[TradeLayoutKey.Tabs],
      },
      {
        i: TradeLayoutKey.Overview,
        x: 0,
        y: FIXED_HEIGHTS[TradeLayoutKey.Tabs],
        w: leftAreaCols,
        h: FIXED_HEIGHTS[TradeLayoutKey.Overview],
      },
      {
        i: TradeLayoutKey.Tradingview,
        x: 0,
        y: FIXED_HEIGHTS[TradeLayoutKey.Tabs] + FIXED_HEIGHTS[TradeLayoutKey.Overview],
        w: leftAreaCols,
        h: tradingviewHeight,
        minW: 4,
        minH: FIXED_HEIGHTS[TradeLayoutKey.Tradingview],
      },
      {
        i: TradeLayoutKey.Position,
        x: 0,
        y: FIXED_HEIGHTS[TradeLayoutKey.Tabs] + FIXED_HEIGHTS[TradeLayoutKey.Overview] + tradingviewHeight,
        w: leftAreaCols + orderbooksCols,
        h: FIXED_HEIGHTS[TradeLayoutKey.Position],
        minW: 6,
        minH: FIXED_HEIGHTS[TradeLayoutKey.Position],
      },
      {
        i: TradeLayoutKey.Orderbooks,
        x: leftAreaCols,
        y: 0,
        w: orderbooksCols,
        h: orderbooksHeight,
        minW: 1,
        minH: 6,
      },
      {
        i: TradeLayoutKey.Account,
        x: leftAreaCols + orderbooksCols,
        y: 0,
        w: actionCols,
        h: FIXED_HEIGHTS[TradeLayoutKey.Account],
      },
      {
        i: TradeLayoutKey.Action,
        x: leftAreaCols + orderbooksCols,
        y: FIXED_HEIGHTS[TradeLayoutKey.Account],
        w: actionCols,
        h: actionHeight,
        minW: actionCols,
        minH: 6,
      },
    ]

    return { lg: initialLayout }
  })

  // 布局计算函数
  const recalculateLayout = useCallback((containerWidth: number, containerHeight: number) => {
    const { actionCols, orderbooksCols, leftAreaCols } = calculateLayoutCols(containerWidth)
    const tradingviewHeight = Math.max(
      calculateTradingviewHeight(containerHeight),
      FIXED_HEIGHTS[TradeLayoutKey.Tradingview],
    )
    const orderbooksHeight =
      FIXED_HEIGHTS[TradeLayoutKey.Tabs] + FIXED_HEIGHTS[TradeLayoutKey.Overview] + tradingviewHeight
    const actionHeight =
      orderbooksHeight + FIXED_HEIGHTS[TradeLayoutKey.Position] - FIXED_HEIGHTS[TradeLayoutKey.Account]

    const newLayout: Layout[] = [
      {
        i: TradeLayoutKey.Tabs,
        x: 0,
        y: 0,
        w: leftAreaCols,
        h: FIXED_HEIGHTS[TradeLayoutKey.Tabs],
      },
      {
        i: TradeLayoutKey.Overview,
        x: 0,
        y: FIXED_HEIGHTS[TradeLayoutKey.Tabs],
        w: leftAreaCols,
        h: FIXED_HEIGHTS[TradeLayoutKey.Overview],
      },
      {
        i: TradeLayoutKey.Tradingview,
        x: 0,
        y: FIXED_HEIGHTS[TradeLayoutKey.Tabs] + FIXED_HEIGHTS[TradeLayoutKey.Overview],
        w: leftAreaCols,
        h: tradingviewHeight,
        minW: 4,
        minH: FIXED_HEIGHTS[TradeLayoutKey.Tradingview],
      },
      {
        i: TradeLayoutKey.Position,
        x: 0,
        y: FIXED_HEIGHTS[TradeLayoutKey.Tabs] + FIXED_HEIGHTS[TradeLayoutKey.Overview] + tradingviewHeight,
        w: leftAreaCols + orderbooksCols,
        h: FIXED_HEIGHTS[TradeLayoutKey.Position],
        minW: 6,
        minH: FIXED_HEIGHTS[TradeLayoutKey.Position],
      },
      {
        i: TradeLayoutKey.Orderbooks,
        x: leftAreaCols,
        y: 0,
        w: orderbooksCols,
        h: orderbooksHeight,
        minW: 1,
        minH: 6,
      },
      {
        i: TradeLayoutKey.Account,
        x: leftAreaCols + orderbooksCols,
        y: 0,
        w: actionCols,
        h: FIXED_HEIGHTS[TradeLayoutKey.Account],
      },
      {
        i: TradeLayoutKey.Action,
        x: leftAreaCols + orderbooksCols,
        y: FIXED_HEIGHTS[TradeLayoutKey.Account],
        w: actionCols,
        h: actionHeight,
        minW: actionCols,
        minH: 6,
      },
    ]

    const updatedLayouts = { lg: newLayout }
    setLayouts(updatedLayouts)

    // 保存到缓存并标记为有效
    saveLayoutToCache(updatedLayouts, containerWidth, containerHeight)
    hasValidCache.current = true

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsMounted(true)
      })
    })
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const containerWidth = containerRef.current.clientWidth || DEFAULT_CONTAINER_WIDTH
    const containerHeight = containerRef.current.clientHeight || DEFAULT_CONTAINER_HEIGHT

    // 如果有有效缓存，检查是否需要重新计算
    if (hasValidCache.current) {
      const cached = getLayoutFromCache()
      const shouldUseCache =
        cached &&
        Math.abs(cached.containerWidth - containerWidth) < 100 &&
        Math.abs(cached.containerHeight - containerHeight) < 100

      // 如果缓存尺寸匹配，直接使用，不重新计算
      if (shouldUseCache) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsMounted(true)
          })
        })
        return
      }

      // 缓存尺寸不匹配，需要重新计算 - 先显示加载动画
      setIsMounted(false)
      hasValidCache.current = false

      // 给加载动画一点时间显示
      setTimeout(() => {
        recalculateLayout(containerWidth, containerHeight)
      }, 100)
      return
    }

    // 缓存不存在或尺寸差异较大，重新计算布局
    recalculateLayout(containerWidth, containerHeight)
  }, [recalculateLayout])

  return (
    <div ref={containerRef} className="relative h-full">
      {/* Loading 动画 */}
      {/* <PageLoading show={!isMounted} className="absolute inset-0 z-50" duration={500} /> */}

      <div className={`transition-opacity duration-500 ease-in-out ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        <ResponsiveGridLayout
          className={`layout ${isMounted ? 'mounted' : 'mounting'}`}
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={ROW_HEIGHT}
          margin={[0, 0]}
          containerPadding={[CONTAINER_PADDING, CONTAINER_PADDING]}
          isDraggable={false}
          isResizable={false}
          onLayoutChange={(layout, allLayouts) => {
            setLayouts(allLayouts)
            // 布局变化时更新缓存
            if (containerRef.current) {
              const width = containerRef.current.clientWidth || DEFAULT_CONTAINER_WIDTH
              const height = containerRef.current.clientHeight || DEFAULT_CONTAINER_HEIGHT
              saveLayoutToCache(allLayouts, width, height)
            }
          }}
          useCSSTransforms={true}
          draggableHandle=".drag-handle"
        >
          {Object.entries(slots).map(([key, content]) => (
            <div key={key} className="relative p-1">
              {content}
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  )
}
