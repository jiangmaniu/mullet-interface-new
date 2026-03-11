import '@/styles/globals.scss'

import type { AppProps } from 'next/app'

import { Provider } from '@/context'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      {/* @ts-ignore */}
      <Component {...pageProps} />
    </Provider>
  )
}
