import { cn } from '@/lib/utils'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { WebView, WebViewProps } from 'react-native-webview'

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
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script src="https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js"></script>
        <style>
          body { margin: 0; padding: 0; background-color: transparent; overflow: hidden; }
          #container { width: 100vw; height: 100vh; }
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

  return (
    <View style={[styles.container]} className={cn('w-full h-full', className)}>
      <WebView
        ref={ref}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={[styles.webview, style]}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        {...props}
      />
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
    flex: 1,
    backgroundColor: 'transparent',
  },
})
