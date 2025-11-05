import type { Config } from 'next-i18n-router/dist/types'

import { COOKIE_LOCALE_KEY, DEFAULT_LOCALE, LOCALES } from '@/constants/locale'

export const i18nRouterConfig: Config = {
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  prefixDefault: true,
  localeCookie: COOKIE_LOCALE_KEY,
}
