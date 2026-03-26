import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { I18nProvider } from '@lingui/react'
import { i18n } from '@lingui/core'
import { isInAppSync, getContextSync } from '@mullet/js-bridge/h5'
import { routeTree } from './route-tree.gen'
import { initTheme } from '@/lib/theme'
import { messages as zhMessages } from '@/locales/zh-cn/messages.po'
import { messages as enMessages } from '@/locales/en/messages.po'

i18n.load({ 'zh-cn': zhMessages, en: enMessages })

function resolveLocale(): string {
  if (isInAppSync()) {
    const locale = getContextSync()?.locale
    if (locale?.startsWith('en')) return 'en'
  }
  return 'zh-cn'
}

i18n.activate(resolveLocale())

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
})

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function App() {
  useEffect(() => initTheme(), [])

  return (
    <I18nProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </I18nProvider>
  )
}
