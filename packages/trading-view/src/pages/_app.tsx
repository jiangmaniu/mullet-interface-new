import '@/styles/globals.scss'

import type { AppProps } from 'next/app'
import { useEffect } from 'react'

import { Provider } from '@/context'
import stores from '@/stores'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    stores.ws.connect()
  }, [])

  return (
    <Provider>
      {/* @ts-ignore */}
      <Component {...pageProps} />
    </Provider>
  )
}
