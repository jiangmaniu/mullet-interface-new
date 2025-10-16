'use client'

import type { Messages } from '@lingui/core'
import { setupI18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { useState } from 'react'

import type { Locale } from '@/constants/locale'

export type LinguiClientProviderProps = {
  children: React.ReactNode
  initialLocale: Locale
  initialMessages: Messages
}

export function LinguiClientProvider({
  children,
  initialLocale,
  initialMessages,
}: LinguiClientProviderProps) {
  const [i18n] = useState(() => {
    return setupI18n({
      locale: initialLocale,
      messages: { [initialLocale]: initialMessages },
    })
  })
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}
