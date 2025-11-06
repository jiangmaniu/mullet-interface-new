import '@mullet/ui/styles.css'
import './globals.css'

import { url } from 'inspector'
import { Geist } from 'next/font/google'

import { allMessages, getI18nInstance } from '@/locales/app-router-i18n'
import { initLingui, PageLangParam } from '@/locales/init-lingui'
import { msg } from '@lingui/core/macro'

import { GlobalProviders } from '../../components/providers/global'

const geist = Geist({ subsets: ['latin'] })

export async function generateMetadata({ params }: PageLangParam) {
  const { locale } = await params
  const i18n = getI18nInstance(locale)

  return {
    title: i18n._(msg`Mullet`),
    description: 'Mullet',
    icons: [
      {
        url: '/icons/logo/mullet-short.svg',
        type: 'image/svg+xml',
        rel: 'icon',
      },
      // {
      //   url: '/favicon.png',
      //   type: 'image/png',
      // },
    ],
  }
}

export default async function RootLayout({ children, params }: { children: React.ReactNode } & PageLangParam) {
  const { locale } = await params
  initLingui(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={geist.className} suppressHydrationWarning>
        <GlobalProviders initialLocale={locale} initialMessages={allMessages[locale]!}>
          {children}
        </GlobalProviders>
      </body>
    </html>
  )
}
