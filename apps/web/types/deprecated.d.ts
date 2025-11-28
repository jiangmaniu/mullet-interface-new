import { useCurrentLocale as useCurrentLocaleOrigin } from 'next-i18n-router/client'

declare module 'next-i18n-router/client' {
  /** @deprecated 不要使用这个函数，请使用 @/hooks/common/use-current-locale */
  const useCurrentLocale: typeof useCurrentLocaleOrigin
}
