import { cn } from '@/lib/utils'
import React, { useState, useMemo, useCallback } from 'react'
import { LayoutChangeEvent, StyleSheet, View } from 'react-native'
import { WebView, WebViewProps } from 'react-native-webview'
import { LIGHTWEIGHT_CHARTS_SCRIPT } from './lib/lightweight-charts-inline'
import { useWebViewPool } from './webview-pool'

export interface ChartBaseProps extends Omit<WebViewProps, 'source'> {
  script: string
  className?: string
}

export const ChartBase = React.memo(function ChartBase({
  script,
  style,
  className,
  ref,
  ...props
}: ChartBaseProps & { ref?: React.Ref<WebView> }) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { getPooledHTML } = useWebViewPool()

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout
    if (width > 0 && height > 0) {
      setDimensions({ width, height })
    }
  }, [])

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleLoadStart = useCallback(() => {
    setIsLoading(true)
  }, [])

  // 使用 useMemo 缓存 HTML 内容，只在 dimensions 或 script 变化时重新生成
  const htmlContent = useMemo(() => {
    if (!dimensions) return ''

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=${dimensions.width}, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script>${LIGHTWEIGHT_CHARTS_SCRIPT}</script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { width: ${dimensions.width}px; height: ${dimensions.height}px; background-color: transparent; overflow: hidden; }
          #container { width: ${dimensions.width}px; height: ${dimensions.height}px; }
          #tv-attr-logo { display: none !important; }
        </style>
      </head>
      <body>
        <div id="container"></div>
        <script type="text/javascript">
          ${script}
        </script>
      </body>
    </html>
  `
    return getPooledHTML(html)
  }, [dimensions, script, getPooledHTML])

  return (
    <View style={[styles.container]} className={cn('w-full h-full', className)} onLayout={handleLayout}>
      {/* WebView - 始终渲染 */}
      {dimensions && htmlContent && (
        <WebView
          ref={ref}
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={[
            styles.webview,
            { width: dimensions.width, height: dimensions.height },
            style,
          ]}
          scrollEnabled={false}
          bounces={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          cacheEnabled={true}
          cacheMode="LOAD_CACHE_ELSE_NETWORK"
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          // 禁用缩放，提升性能
          scalesPageToFit={false}
          // 减少内存占用
          allowsInlineMediaPlayback={false}
          mediaPlaybackRequiresUserAction={true}
          {...props}
        />
      )}

      {/* 骨架屏 - 直接显示/隐藏，无过渡动画 */}
      {(!dimensions || !htmlContent || isLoading) && (
        <View style={styles.skeleton} />
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    backgroundColor: 'transparent',
  },
  skeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 4,
  },
})
