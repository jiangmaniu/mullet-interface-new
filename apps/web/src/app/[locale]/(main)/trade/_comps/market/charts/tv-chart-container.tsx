'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { isNull } from 'lodash-es'
import Script from 'next/script'
import type {
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  LanguageCode,
  ResolutionString,
} from '~/static/charting_library/charting_library'

import { PageLoading } from '@/components/loading/page-loading'

import { useWidgetOptions } from './use-widget-options'

const defaultWidgetProps: Partial<ChartingLibraryWidgetOptions> = {
  symbol: 'AAPL',
  interval: '1D' as ResolutionString,
  library_path: '/static/charting_library/',
  locale: 'en',
  charts_storage_url: 'https://saveload.tradingview.com',
  charts_storage_api_version: '1.1',
  client_id: 'tradingview.com',
  user_id: 'public_user_id',
  fullscreen: false,
  autosize: true,
}

export const TvChartContainer = () => {
  const [scriptReadyCount, setScriptReadyCount] = useState(0)

  const TV_CHART_COUNT = 2
  const isAllScriptReady = scriptReadyCount === TV_CHART_COUNT
  const handleScriptReady = (isReady: boolean) => {
    setScriptReadyCount((prev) => (isReady ? prev + 1 : prev))
  }

  return (
    <div id="tv_chart_container" className="size-full">
      <Script
        src="/static/charting_library/charting_library.js"
        strategy="lazyOnload"
        onReady={() => {
          handleScriptReady(true)
        }}
      />
      <Script
        src="/static/datafeeds/udf/dist/bundle.js"
        strategy="lazyOnload"
        onReady={() => {
          handleScriptReady(true)
        }}
      />

      {isAllScriptReady && <TvChart options={defaultWidgetProps} />}
    </div>
  )
}

export const TvChart = ({ options }: { options: Partial<ChartingLibraryWidgetOptions> }) => {
  const tvWidget = useRef<IChartingLibraryWidget>(null)
  const id = useId()
  const [isMounted, setIsMounted] = useState(false)

  const { widgetOptions, widgetContainer } = useWidgetOptions({
    containerId: id,
  })

  useLayoutEffect(() => {
    if (!widgetOptions) return

    tvWidget.current = new window.TradingView.widget(widgetOptions)

    if (isNull(tvWidget.current)) return

    tvWidget.current.onChartReady(() => {
      // tvWidget.current?.headerReady().then(() => {
      //   const button = tvWidget.current?.createButton()
      //   if (button) {
      //     button?.setAttribute('title', 'Click to show a notification popup')
      //     button?.classList.add('apply-common-tooltip')
      //     button?.addEventListener('click', () =>
      //       tvWidget.current?.showNoticeDialog({
      //         title: 'Notification',
      //         body: 'TradingView Charting Library API works correctly',
      //         callback: () => {
      //           console.log('Noticed!')
      //         },
      //       }),
      //     )
      //     button.innerHTML = 'Check API'
      //   }
      // })
      setIsMounted(true)
    })

    return () => {
      if (!tvWidget.current) return
      tvWidget.current?.remove?.()
    }
  }, [options])

  return (
    <div className="relative size-full">
      {<PageLoading show={!isMounted} className="absolute inset-0 z-50 bg-[#0a0c27]" duration={500} />}

      <div ref={widgetContainer} id={id} style={{ height: '100%', width: '100%' }}></div>
    </div>
  )
}
