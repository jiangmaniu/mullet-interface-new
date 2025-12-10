import { setI18n } from '@lingui/react/server'

import { Locale } from '@/constants/locale'

import { getI18nInstance } from './app-router-i18n'

export type LangPageParam = {
  params: Promise<{ locale: Locale }>
}

export function initLingui(locale: string) {
  const i18n = getI18nInstance(locale)
  setI18n(i18n)
  return i18n
}
