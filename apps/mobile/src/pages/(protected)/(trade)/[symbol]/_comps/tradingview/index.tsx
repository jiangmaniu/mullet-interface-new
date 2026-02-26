import { useRef, useCallback } from 'react'
import { View, Platform, type ViewStyle } from 'react-native'
import { WebView, type WebViewMessageEvent } from 'react-native-webview'
import { observer } from 'mobx-react-lite'

import { getSourceUri } from './utils'
import { useTradingviewConfig } from './hooks/use-tradingview-config'
import { useQuoteSync } from './hooks/use-quote-sync'
import { useWebviewLifecycle } from './hooks/use-webview-lifecycle'
import { useThemeColors } from '@/hooks/use-theme-colors'

function TradingviewChartInner() {
  const webviewRef = useRef<WebView>(null)
  const { backgroundColorSecondary } = useThemeColors()

  const {
    env,
    locale,
    urlQuery,
    injectedJS,
    symbolName,
    symbolItem,
    accountGroupId,
    isReady,
  } = useTradingviewConfig()

  useQuoteSync(webviewRef, accountGroupId, symbolName)
  useWebviewLifecycle(webviewRef, env, symbolName, symbolItem, accountGroupId)

  // ---- WebView 消息处理 ----
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    let msg: { type?: string } = JSON.parse(event.nativeEvent.data)

    if (msg.type === 'chartReady') {
      // 设置水印
      webviewRef.current?.postMessage(
        JSON.stringify({ type: 'setWatermark', payload: 'data:image/png;base64,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' }),
      )
    }
  }, [webviewRef])

  if (!isReady) return null

  return (
    <WebView
      key={locale}
      ref={webviewRef}
      source={{ uri: getSourceUri(urlQuery) }}
      injectedJavaScript={injectedJS}
      style={{ flex: 1, backgroundColor: backgroundColorSecondary }}
      allowingReadAccessToURL="*"
      allowUniversalAccessFromFileURLs
      allowFileAccess
      allowFileAccessFromFileURLs
      originWhitelist={['*']}
      domStorageEnabled
      javaScriptEnabled
      scalesPageToFit={false}
      scrollEnabled={false}
      bounces={false}
      allowsInlineMediaPlayback
      mixedContentMode="always"
      overScrollMode="never"
      webviewDebuggingEnabled={__DEV__}
      {...(Platform.OS === 'android' && { androidLayerType: 'hardware' as const })}
      onMessage={handleMessage}
    />
  )
}

export const TradingviewChart = observer(TradingviewChartInner)
