import { observer } from 'mobx-react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useNetwork } from 'ahooks'

import usePageVisibility from '@/v1/hooks/usePageVisibility'
import { useStores } from '@/v1/provider/mobxProvider'
import { checkPageShowTime } from '@/v1/utils/business'
import { STORAGE_SET_TRADE_PAGE_SHOW_TIME } from '@/v1/utils/storage'

// import { PageLoading } from '@ant-design/pro-components'

type IProps = {
  style?: React.CSSProperties
}

const TradingViewComp = lazy(() => import('./index'))

// 交易图表组件加载容器
export const TradingviewWrapper = observer(({ style }: IProps) => {
  const { kline, ws } = useStores()
  const [forceUpdateKey, setForceUpdateKey] = useState(0)
  const switchSymbolLoading = kline.switchSymbolLoading
  const loadingTimerRef = useRef<NodeJS.Timeout>(null)
  const networkState = useNetwork()
  const isOnline = networkState.online
  const tradingViewRef = useRef<any>(null)
  const [pageVisible, setPageVisible] = useState(true)

  // 监听switchSymbolLoading状态，如果超过10s则强制刷新
  useEffect(() => {
    if (switchSymbolLoading) {
      // 清除之前的定时器
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current)
      }
      // 设置新的定时器
      loadingTimerRef.current = setTimeout(() => {
        console.log('切换品种超时，强制刷新')
        // 只有在强制刷新次数不超过3次时才刷新
        setForceUpdateKey((prev) => {
          // 如果已经刷新了3次或以上，则不再刷新
          if (prev >= 3) {
            console.log('已强制刷新3次，不再刷新')
            return prev
          }
          return prev + 1
        })
        kline.setSwitchSymbolLoading(false)
      }, 10 * 1000)
    } else {
      // 如果loading结束，清除定时器
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current)
      }
    }

    // 组件卸载时清除定时器
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current)
      }
    }
  }, [switchSymbolLoading])

  useEffect(() => {
    // 记录初始化的时间
    STORAGE_SET_TRADE_PAGE_SHOW_TIME(Date.now())
  }, [])

  useEffect(() => {
    setForceUpdateKey((prev) => prev + 1)
  }, [isOnline])

  usePageVisibility(
    () => {
      setPageVisible(true)
      const shouldForceUpdate = checkPageShowTime(1 * 60 * 1000)
      console.log('Tradingview页面回到前台')
      // setForceUpdateKey(shouldForceUpdate ? forceUpdateKey + 1 : forceUpdateKey)
      // setForceUpdateKey(forceUpdateKey + 1)

      // if (kline.tvWidget && !shouldForceUpdate) {
      //   kline.tvWidget.onChartReady(() => {
      //     kline.forceRefreshKlineData()
      //   })
      // }
      // 刷新整个图表，否则v28版本图表短暂闪烁
      tradingViewRef.current?.reload?.()

      // 不用刷新图表
      // if (kline.tvWidget) {
      //   // 不需要重载k线实例
      //   kline.tvWidget.onChartReady(() => {
      //     kline.forceRefreshKlineData()
      //   })
      // }
    },
    () => {
      console.log('Tradingview页面切换到后台')
      // STORAGE_SET_TRADE_PAGE_SHOW_TIME(Date.now())
      // 清空ws的quotes缓存，否则绘制有问题
      ws.quotes.clear()
      kline.lastbar = {}

      // 销毁图表实例
      tradingViewRef.current?.clean?.()
      setPageVisible(false)
    },
  )

  return (
    <div style={{ ...style }} className="h-full">
      {pageVisible && (
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center">
              {/* <PageLoading /> */}
              loading...
            </div>
          }
        >
          <TradingViewComp ref={tradingViewRef} />
        </Suspense>
      )}
    </div>
  )
})
