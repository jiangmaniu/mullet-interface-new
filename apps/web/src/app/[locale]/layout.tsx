import '@mullet/ui/styles.css'
import './globals.css'

import { Inter } from 'next/font/google'

import { allMessages, getI18nInstance } from '@/locales/app-router-i18n'
import { initLingui, PageLangParam } from '@/locales/init-lingui'
import { msg } from '@lingui/core/macro'
import { cn } from '@mullet/ui/lib/utils'

import { GlobalProviders } from '../../components/providers/global'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export async function generateMetadata({ params }: PageLangParam) {
  const { locale } = await params
  const i18n = getI18nInstance(locale)

  return {
    title: i18n._(msg`Mullet`),
    description: 'Mullet',
    icons: [
      {
        url: '/icons/logo/mullet-tag.svg',
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
      <body className={cn(inter.variable, 'font-sans')} suppressHydrationWarning>
        <GlobalProviders initialLocale={locale} initialMessages={allMessages[locale]!}>
          {children}
        </GlobalProviders>
      </body>
    </html>
  )
}
