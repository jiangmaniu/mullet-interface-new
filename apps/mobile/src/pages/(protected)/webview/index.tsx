import { useCallback, useRef, useState } from 'react'
import { View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { WebView } from 'react-native-webview'
import { useLocalSearchParams } from 'expo-router'
import type { WebViewNavigation } from 'react-native-webview'

import { ScreenHeader } from '@/components/ui/screen-header'

export default function WebViewScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title?: string }>()
  const webviewRef = useRef<WebView>(null)
  const [currentTitle, setCurrentTitle] = useState(title ?? '')
  const progress = useSharedValue(0)
  const opacity = useSharedValue(1)

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    opacity: opacity.value,
  }))

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      if (!title && navState.title) {
        setCurrentTitle(navState.title)
      }
    },
    [title],
  )

  return (
    <View className="bg-secondary flex-1">
      <ScreenHeader content={currentTitle} />

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
            onLoadProgress={({ nativeEvent }) => {
              progress.value = withTiming(nativeEvent.progress, { duration: 200 })
              opacity.value = 1
            }}
            onLoadEnd={() => {
              progress.value = withTiming(1, { duration: 200 })
              opacity.value = withTiming(0, { duration: 300 })
            }}
            onNavigationStateChange={handleNavigationStateChange}
          />
        )}
      </View>
    </View>
  )
}
