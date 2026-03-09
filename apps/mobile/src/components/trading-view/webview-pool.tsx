import React, { createContext, useContext, useRef, useCallback } from 'react'

interface WebViewPoolContextType {
  getPooledHTML: (html: string) => string
  clearCache: () => void
}

const WebViewPoolContext = createContext<WebViewPoolContextType | null>(null)

// HTML 内容缓存，避免重复生成
const htmlCache = new Map<string, string>()

export function WebViewPoolProvider({ children }: { children: React.ReactNode }) {
  const cacheRef = useRef(htmlCache)

  const getPooledHTML = useCallback((html: string): string => {
    const cache = cacheRef.current
    if (cache.has(html)) {
      return cache.get(html)!
    }
    cache.set(html, html)
    return html
  }, [])

  const clearCache = useCallback(() => {
    cacheRef.current.clear()
  }, [])

  return (
    <WebViewPoolContext.Provider value={{ getPooledHTML, clearCache }}>
      {children}
    </WebViewPoolContext.Provider>
  )
}

export function useWebViewPool() {
  const context = useContext(WebViewPoolContext)
  if (!context) {
    // 如果没有 Provider，返回默认实现
    return {
      getPooledHTML: (html: string) => html,
      clearCache: () => {},
    }
  }
  return context
}
