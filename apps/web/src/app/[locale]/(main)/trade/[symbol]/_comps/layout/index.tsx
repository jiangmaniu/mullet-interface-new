'use client'

import { useEffect, useRef, useState } from 'react'
import { Layout, Responsive, WidthProvider } from 'react-grid-layout'

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './styles.css'

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
  action: 280 + 8,
  orderbooks: 280 + 8,
}

const TOTAL_COLS = 12

// 根据容器宽度计算固定宽度对应的列数
const calculateColsFromWidth = (targetWidth: number, containerWidth: number) => {
  // 可用宽度 = 容器宽度 - 容器内边距 * 2
  const availableWidth = containerWidth - CONTAINER_PADDING * 2

  // 每列宽度 = 可用宽度 / 列数（无间距）
  const colWidth = availableWidth / TOTAL_COLS

  // 目标列数 = 目标宽度 / 列宽
  const cols = targetWidth / colWidth

  return Math.min(cols, TOTAL_COLS)
}

// 根据容器尺寸计算所有布局参数
const calculateLayoutCols = (containerWidth: number) => {
  const actionCols = calculateColsFromWidth(FIXED_WIDTHS.action, containerWidth)
  const orderbooksCols = calculateColsFromWidth(FIXED_WIDTHS.orderbooks, containerWidth)
  const leftAreaCols = TOTAL_COLS - actionCols - orderbooksCols

  console.log(TOTAL_COLS, actionCols, orderbooksCols, leftAreaCols)
  return { actionCols, orderbooksCols, leftAreaCols }
}

interface TradeLayoutProps {
  slots: TradeLayoutSlots
}

export const TradeLayout = ({ slots }: TradeLayoutProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>({ lg: [] })

  // 初始化：基于容器尺寸计算布局
  useEffect(() => {
    if (!containerRef.current) return

    // 获取容器实际尺寸
    const containerWidth = containerRef.current.clientWidth || 1200
    const containerHeight = containerRef.current.clientHeight || 1080

    // 基于容器宽度计算列数
    const { actionCols, orderbooksCols, leftAreaCols } = calculateLayoutCols(containerWidth)

    // 基于容器高度计算 tradingview 高度
    const tradingviewHeight = Math.max(
      calculateTradingviewHeight(containerHeight),
      FIXED_HEIGHTS[TradeLayoutKey.Tradingview],
    )
    const orderbooksHeight =
      FIXED_HEIGHTS[TradeLayoutKey.Tabs] + FIXED_HEIGHTS[TradeLayoutKey.Overview] + tradingviewHeight
    const actionHeight =
      orderbooksHeight + FIXED_HEIGHTS[TradeLayoutKey.Position] - FIXED_HEIGHTS[TradeLayoutKey.Account]

    console.log(tradingviewHeight, FIXED_HEIGHTS[TradeLayoutKey.Tradingview])
    // 生成布局配置
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

    setLayouts({ lg: initialLayout })

    // 使用 requestAnimationFrame 确保首次渲染完成后再启用过渡
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsMounted(true)
      })
    })
  }, [])

  return (
    <div ref={containerRef} className="relative h-full">
      {/* Loading 动画 */}
      <PageLoading show={!isMounted} className="absolute inset-0 z-50" duration={500} />

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
