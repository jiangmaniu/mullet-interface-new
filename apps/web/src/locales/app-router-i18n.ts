import 'server-only'

import type { I18n, Messages } from '@lingui/core'
import { setupI18n } from '@lingui/core'

import { Locale, LOCALE_MESSAGE_MODULE_NAMES } from '@/constants/locale'

import linguiConfig from '../../lingui.config'

const { locales } = linguiConfig
// optionally use a stricter union type
type SupportedLocales = string

async function loadCatalog(
  locale: SupportedLocales,
): Promise<Record<string, Messages>> {
  const messagesModules: Record<string, any>[] = await Promise.all(
    [LOCALE_MESSAGE_MODULE_NAMES].map(async (name) => {
      const { messages } = await import(`./messages/${locale}/${name}.po`)
      return messages
    }),
  )

  const messages = messagesModules.reduce(
    (acc, messages) => {
      return { ...acc, ...messages }
    },
    {} as Record<string, any>,
  )

  return {
    [locale]: messages,
  }
}

const catalogs = await Promise.all(locales.map(loadCatalog))

// transform array of catalogs into a single object
export const allMessages = catalogs.reduce((acc, oneCatalog) => {
  return { ...acc, ...oneCatalog }
}, {})

type AllI18nInstances = Record<SupportedLocales, I18n>

export const allI18nInstances: AllI18nInstances = locales.reduce(
  (acc, locale) => {
    const messages = allMessages[locale] ?? {}
    const i18n = setupI18n({
      locale,
      messages: { [locale]: messages },
    })
    return { ...acc, [locale]: i18n }
  },
  {},
)

export const getI18nInstance = (locale: SupportedLocales): I18n => {
  if (!allI18nInstances[locale]) {
    console.warn(`No i18n instance found for locale "${locale}"`)
  }
  return allI18nInstances[locale]! || allI18nInstances[Locale.en]!
}
