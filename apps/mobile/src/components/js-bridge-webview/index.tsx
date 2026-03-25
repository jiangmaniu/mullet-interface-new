import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react'
import { View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import WebView from 'react-native-webview'
import type { AppEvent } from '@mullet/js-bridge/types'
import type { Ref } from 'react'
import type { WebViewNavigation } from 'react-native-webview'

import { ScreenHeader } from '@/components/ui/screen-header'

import { useJsBridge } from './use-js-bridge'

// ─── Ref 类型 ───────────────────────────────────────────────────

export interface BridgeWebViewRef {
  pushEvent: (event: AppEvent, payload: unknown) => void
  webview: WebView | null
}

// ─── Props ──────────────────────────────────────────────────────

interface BridgeWebViewProps {
  url: string
  title?: string
  showHeader?: boolean
  webViewProps?: Partial<React.ComponentProps<typeof WebView>>
}

// ─── 组件 ───────────────────────────────────────────────────────

export const BridgeWebView = forwardRef(function BridgeWebView(
  { url, title, showHeader = true, webViewProps }: BridgeWebViewProps,
  ref: Ref<BridgeWebViewRef>,
) {
  const webviewRef = useRef<WebView>(null)
  const [currentTitle, setCurrentTitle] = useState(title ?? '')
  const progress = useSharedValue(0)
  const opacity = useSharedValue(1)

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    opacity: opacity.value,
  }))

  // ── Bridge 通信 ──

  const { onMessage, pushEvent, injectedJS } = useJsBridge({
    webviewRef,
    uiCallbacks: {
      onSetTitle: setCurrentTitle,
    },
  })

  // ── 暴露 ref ──

  useImperativeHandle(ref, () => ({
    pushEvent,
    get webview() {
      return webviewRef.current
    },
  }))

  // ── 导航状态 ──

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      if (!title && navState.title) {
        setCurrentTitle(navState.title)
      }
    },
    [title],
  )

  return (
    <View className="bg-background-color-secondary flex-1">
      {showHeader && <ScreenHeader content={currentTitle} />}
      <View className="flex-1">
        <Animated.View
          className="bg-brand-primary absolute top-0 left-0 z-10 h-[2px] rounded-r-full"
          style={progressStyle}
        />
        {url && (
          <WebView
            ref={webviewRef}
            source={{ uri: url }}
            className="flex-1"
            onMessage={onMessage}
            injectedJavaScriptBeforeContentLoaded={injectedJS}
            onLoadProgress={({ nativeEvent }) => {
              progress.value = withTiming(nativeEvent.progress, {
                duration: 200,
              })
              opacity.value = 1
            }}
            onLoadEnd={() => {
              progress.value = withTiming(1, { duration: 200 })
              opacity.value = withTiming(0, { duration: 300 })
            }}
            onNavigationStateChange={handleNavigationStateChange}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            {...webViewProps}
          />
        )}
      </View>
    </View>
  )
})
