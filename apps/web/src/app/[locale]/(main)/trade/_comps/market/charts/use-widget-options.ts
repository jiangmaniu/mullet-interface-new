import { useMemo, useRef } from 'react'

import { DEFAULT_LOCALE, LOCALE_KEY_MAP } from '@/constants/locale'
import { useCurrentLocale } from '@/hooks/common/use-current-locale'

import {
  ChartingLibraryWidgetOptions,
  ResolutionString,
  WidgetOverrides,
} from '~/static/charting_library/charting_library'

export const useWidgetOptions = ({ containerId }: { containerId: string }) => {
  const currentLocale = useCurrentLocale()
  const widgetContainer = useRef<HTMLDivElement | null>(null)
  const { widgetOverrides } = useWidgetOverrides()
  const { widgetFeatures } = useWidgetFeatures()

  const widgetOptions = useMemo(() => {
    const options: ChartingLibraryWidgetOptions = {
      symbol: 'AAPL',
      interval: '1D' as ResolutionString,
      container: containerId,
      datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed('https://demo_feed.tradingview.com', undefined, {
        maxResponseLength: 1000,
        expectedOrder: 'latestFirst',
      }),
      autosize: true,
      library_path: '/static/charting_library/',
      custom_css_url: './tv_theme.css',
      locale: LOCALE_KEY_MAP[currentLocale].tradingview,
      charts_storage_url: 'https://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      ...widgetOverrides,
      ...widgetFeatures,
    }

    return options
  }, [containerId])

  return { widgetOptions, widgetContainer }
}

const useWidgetOverrides = () => {
  const widgetOverrides = useMemo(() => {
    const overrides: Pick<ChartingLibraryWidgetOptions, 'overrides' | 'theme' | 'loading_screen'> = {
      theme: 'dark',
      loading_screen: {
        backgroundColor: 'rgba(10, 12, 39, 1)',
        foregroundColor: '#eed94c',
      },

      overrides: {
        'paneProperties.background': 'rgba(10, 12, 39, 1)',
        'paneProperties.backgroundType': 'solid',

        'paneProperties.vertGridProperties.style': 1,
        'paneProperties.vertGridProperties.color': 'rgba(255, 255, 255, 0.1)',
        'paneProperties.horzGridProperties.style': 1,
        'paneProperties.horzGridProperties.color': 'rgba(255, 255, 255, 0.1)',

        // 刻度文字颜色
        'scalesProperties.textColor': 'rgba(118, 119, 131, 1)',
        // 刻度线颜色
        'scalesProperties.lineColor': 'rgba(255, 255, 255, 0.1)',
        'scalesProperties.fontSize': 10,
      },
    }
    return overrides
  }, [])

  return { widgetOverrides }
}

const useWidgetFeatures = () => {
  const widgetFeatures = useMemo(() => {
    const widgetFeatures: Pick<ChartingLibraryWidgetOptions, 'enabled_features' | 'disabled_features'> = {
      enabled_features: ['chart_zoom'],
      disabled_features: ['header_symbol_search', 'header_compare'],
    }
    return widgetFeatures
  }, [])

  return { widgetFeatures }
}
