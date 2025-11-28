import { useCurrentLocale as useCurrentLocaleOrigin } from 'next-i18n-router/client'

import { DEFAULT_LOCALE, Locale } from '@/constants/locale'
import { i18nRouterConfig } from '@/locales/i18n-router-config'

export const useCurrentLocale = () => {
  const pathCurrentLocale = useCurrentLocaleOrigin(i18nRouterConfig)
  return (pathCurrentLocale as Locale) ?? DEFAULT_LOCALE
}
