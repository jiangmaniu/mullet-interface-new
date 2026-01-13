'use client'

import { useEffect, useRef, useState } from 'react'
import { Layout, Responsive, ResponsiveLayouts, useContainerWidth } from 'react-grid-layout'

import { cn } from '@mullet/ui/utils'

import {
  FIXED_HEIGHTS_ACCOUNT,
  FIXED_HEIGHTS_ACTION,
  FIXED_HEIGHTS_MARGIN_RATE,
  FIXED_HEIGHTS_ORDERBOOKS,
  FIXED_HEIGHTS_OVERVIEW,
  FIXED_HEIGHTS_POSITION,
  FIXED_HEIGHTS_TAB,
  FIXED_HEIGHTS_TRADINGVIEW,
} from './height-config'
import { TradeLayoutKey, TradeLayoutSlots } from './types'

// import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './styles.css'

interface TradeLayoutProps {
  slots: TradeLayoutSlots
}

// 本地存储 key
const LAYOUT_CACHE_KEY = 'trade-layout-cache-v1'

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
const saveLayoutToCache = (layouts: ResponsiveLayouts, containerWidth: number, containerHeight: number) => {
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

export const TradeLayout = ({ slots }: TradeLayoutProps) => {
  const hasValidCacheWidth = useRef(null)
  const [layouts, setLayouts] = useState<ResponsiveLayouts>(() => {
    // 尝试从缓存读取
    const cached = getLayoutFromCache()
    if (cached) {
      hasValidCacheWidth.current = cached.containerWidth

      return cached.layouts
    }

    const initialLayout: ResponsiveLayouts = {
      lg: [
        { i: TradeLayoutKey.Tabs, x: 0, y: 0, w: 20, h: FIXED_HEIGHTS_TAB.lg },
        { i: TradeLayoutKey.Overview, x: 0, y: FIXED_HEIGHTS_TAB.lg, w: 20, h: FIXED_HEIGHTS_OVERVIEW.lg },
        {
          i: TradeLayoutKey.Tradingview,
          x: 0,
          y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_OVERVIEW.lg,
          w: 12,
          h: FIXED_HEIGHTS_ACTION.lg + FIXED_HEIGHTS_ACCOUNT.lg,
        },
        {
          i: TradeLayoutKey.Position,
          x: 0,
          y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_OVERVIEW.lg + FIXED_HEIGHTS_TRADINGVIEW.lg,
          w: 16,
          h: FIXED_HEIGHTS_POSITION.lg,
        },
        {
          i: TradeLayoutKey.Orderbooks,
          x: 12,
          y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_OVERVIEW.lg,
          w: 4,
          h: FIXED_HEIGHTS_ACTION.lg + FIXED_HEIGHTS_ACCOUNT.lg,
        },
        {
          i: TradeLayoutKey.Account,
          x: 20,
          y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_OVERVIEW.lg,
          w: 4,
          h: FIXED_HEIGHTS_ACCOUNT.lg,
        },
        {
          i: TradeLayoutKey.Action,
          x: 20,
          y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_OVERVIEW.lg + FIXED_HEIGHTS_ACCOUNT.lg,
          w: 4,
          h: FIXED_HEIGHTS_ACTION.lg,
        },
        {
          i: TradeLayoutKey.MarginRate,
          x: 20,
          y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_OVERVIEW.lg + FIXED_HEIGHTS_ACCOUNT.lg + FIXED_HEIGHTS_ACTION.lg,
          w: 4,
          h: FIXED_HEIGHTS_MARGIN_RATE.lg,
        },
      ],
      md: [
        { i: TradeLayoutKey.Tabs, x: 0, y: 0, w: 15, h: FIXED_HEIGHTS_TAB.lg },
        { i: TradeLayoutKey.Overview, x: 0, y: FIXED_HEIGHTS_TAB.lg, w: 15, h: FIXED_HEIGHTS_OVERVIEW.lg },
        {
          i: TradeLayoutKey.Tradingview,
          x: 0,
          y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_OVERVIEW.lg,
          w: 10,
          h: FIXED_HEIGHTS_ACTION.lg + FIXED_HEIGHTS_ACCOUNT.lg,
        },
        {
          i: TradeLayoutKey.Position,
          x: 0,
          y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_OVERVIEW.lg + FIXED_HEIGHTS_TRADINGVIEW.lg,
          w: 15,
          h: FIXED_HEIGHTS_POSITION.lg,
        },
        {
          i: TradeLayoutKey.Orderbooks,
          x: 10,
          y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_OVERVIEW.lg,
          w: 5,
          h: FIXED_HEIGHTS_ACTION.lg + FIXED_HEIGHTS_ACCOUNT.lg,
        },
        { i: TradeLayoutKey.Account, x: 15, y: 0, w: 5, h: FIXED_HEIGHTS_ACCOUNT.lg },
        {
          i: TradeLayoutKey.Action,
          x: 15,
          y: FIXED_HEIGHTS_ACCOUNT.lg,
          w: 5,
          h: FIXED_HEIGHTS_ACTION.lg + FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_OVERVIEW.lg,
        },
        {
          i: TradeLayoutKey.MarginRate,
          x: 15,
          y: FIXED_HEIGHTS_ACCOUNT.lg + FIXED_HEIGHTS_ACTION.lg,
          w: 5,
          h: FIXED_HEIGHTS_MARGIN_RATE.lg,
        },
      ],
    }

    const smTradingviewHeight = FIXED_HEIGHTS_ACTION.lg - 250

    initialLayout['sm'] = [
      { i: TradeLayoutKey.Tabs, x: 0, y: 0, w: 20, h: FIXED_HEIGHTS_TAB.lg },
      { i: TradeLayoutKey.Overview, x: 0, y: FIXED_HEIGHTS_TAB.lg, w: 20, h: FIXED_HEIGHTS_OVERVIEW.lg },

      {
        i: TradeLayoutKey.Tradingview,
        x: 0,
        y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_OVERVIEW.lg,
        w: 15,
        h: smTradingviewHeight,
      },
      {
        i: TradeLayoutKey.Position,
        x: 0,
        y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_OVERVIEW.lg + FIXED_HEIGHTS_TRADINGVIEW.lg,
        w: 20,
        h: FIXED_HEIGHTS_POSITION.lg,
      },
      {
        i: TradeLayoutKey.Orderbooks,
        x: 0,
        y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_OVERVIEW.lg + smTradingviewHeight,
        w: 5,
        h: 250,
      },
      {
        i: TradeLayoutKey.Account,
        x: 10,
        y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_TAB.lg + smTradingviewHeight,
        w: 5,
        h: 250,
      },
      { i: TradeLayoutKey.Action, x: 15, y: FIXED_HEIGHTS_ACCOUNT.lg, w: 5, h: FIXED_HEIGHTS_ACTION.lg },
      {
        i: TradeLayoutKey.MarginRate,
        x: 5,
        y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_OVERVIEW.lg + smTradingviewHeight,
        w: 5,
        h: 250,
      },
    ]

    const xsTradingviewHeight = 350
    initialLayout['xs'] = [
      { i: TradeLayoutKey.Tabs, x: 0, y: 0, w: 20, h: FIXED_HEIGHTS_TAB.lg },
      { i: TradeLayoutKey.Overview, x: 0, y: FIXED_HEIGHTS_TAB.lg, w: 20, h: FIXED_HEIGHTS_OVERVIEW.lg },
      {
        i: TradeLayoutKey.Tradingview,
        x: 0,
        y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_OVERVIEW.lg,
        w: 20,
        h: xsTradingviewHeight,
      },
      {
        i: TradeLayoutKey.Orderbooks,
        x: 0,
        y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_OVERVIEW.lg + smTradingviewHeight,
        w: 6,
        h: 650,
      },
      {
        i: TradeLayoutKey.Position,
        x: 0,
        y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_OVERVIEW.lg + FIXED_HEIGHTS_TRADINGVIEW.lg + 500,
        w: 20,
        h: FIXED_HEIGHTS_POSITION.lg,
      },
      {
        i: TradeLayoutKey.Account,
        x: 6,
        y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_TAB.lg + smTradingviewHeight,
        w: 6,
        h: 250,
      },
      {
        i: TradeLayoutKey.Action,
        x: 12,
        y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_TAB.lg + smTradingviewHeight,
        w: 8,
        h: 650,
      },
      {
        i: TradeLayoutKey.MarginRate,
        x: 6,
        y: FIXED_HEIGHTS_TAB.lg + FIXED_HEIGHTS_OVERVIEW.lg + smTradingviewHeight + 250,
        w: 6,
        h: 650 - 250,
      },
    ]
    return initialLayout
  })

  const { width, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: true,
    initialWidth: hasValidCacheWidth.current || 1440,
  })

  const [layoutClassName, setLayoutClassName] = useState('')

  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => setLayoutClassName(cn('react-grid-layout-animated')), 1)
      return () => clearTimeout(timer)
    }
  }, [mounted])

  return (
    <div
      ref={containerRef}
      // className="w-full"
    >
      {mounted && (
        <Responsive
          className={cn(layoutClassName)}
          layouts={layouts}
          breakpoints={{ lg: 1700, md: 1200, sm: 968, xs: 768, xxs: 0 }}
          cols={{ lg: 20, md: 20, sm: 20, xs: 20, xxs: 2 }}
          width={width}
          margin={[0, 0]}
          containerPadding={[4, 4]}
          rowHeight={1}
          dragConfig={{
            enabled: false,
          }}
          onLayoutChange={(_, allLayouts) => {
            setLayouts(allLayouts)
            // 布局变化时更新缓存
            if (containerRef.current) {
              saveLayoutToCache(allLayouts, width, containerRef.current?.clientHeight || 0)
            }
          }}
        >
          {Object.entries(slots).map(([key, content]) => (
            <div key={key} className="relative p-1">
              {content}
            </div>
          ))}
        </Responsive>
      )}
    </div>
  )
}
