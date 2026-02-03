import { cn } from '@/lib/utils'
import React, { useState, useMemo } from 'react'
import { LayoutChangeEvent, StyleSheet, View } from 'react-native'
import { WebView, WebViewProps } from 'react-native-webview'
import { LIGHTWEIGHT_CHARTS_SCRIPT } from './lib/lightweight-charts-inline'

export interface ChartBaseProps extends Omit<WebViewProps, 'source'> {
  script: string
  className?: string
}

export const ChartBase = React.forwardRef<WebView, ChartBaseProps>(({
  script,
  style,
  className,
  ...props
}, ref) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout
    if (width > 0 && height > 0) {
      setDimensions({ width, height })
    }
  }

  // 使用 useMemo 缓存 HTML 内容，只在 dimensions 或 script 变化时重新生成
  const htmlContent = useMemo(() => {
    if (!dimensions) return ''

    return `
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
  }, [dimensions, script])

  return (
    <View style={[styles.container]} className={cn('w-full h-full', className)} onLayout={handleLayout}>
      {dimensions && htmlContent && (
        <WebView
          ref={ref}
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={[styles.webview, { width: dimensions.width, height: dimensions.height }, style]}
          scrollEnabled={false}
          bounces={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          cacheEnabled={true}
          cacheMode="LOAD_CACHE_ELSE_NETWORK"
          {...props}
        />
      )}
    </View>
  )
})

ChartBase.displayName = 'ChartBase'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    backgroundColor: 'transparent',
  },
})
