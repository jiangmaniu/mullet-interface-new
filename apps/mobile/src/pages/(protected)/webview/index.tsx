import { useRef } from 'react'
import { useLocalSearchParams } from 'expo-router'
import type { BridgeWebViewRef } from '@/components/js-bridge-webview'

import { BridgeWebView } from '@/components/js-bridge-webview'

export default function WebViewScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title?: string }>()
  const bridgeRef = useRef<BridgeWebViewRef>(null)

  if (!url) return null

  return <BridgeWebView ref={bridgeRef} url={url} title={title} />
}
