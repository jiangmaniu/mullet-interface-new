import { LanguageCode } from '~/static/charting_library/charting_library'

export const COOKIE_LOCALE_KEY = 'NEXT_LOCALE'

export enum Locale {
  en = 'en',
  zh_CN = 'zh-CN',
  en_US = 'en-US',
  af_ZA = 'af-ZA',
  ar_SA = 'ar-SA',
  ca_ES = 'ca-ES',
  cs_CZ = 'cs-CZ',
  da_DK = 'da-DK',
  de_DE = 'de-DE',
  el_GR = 'el-GR',
  es_ES = 'es-ES',
  fi_FI = 'fi-FI',
  fr_FR = 'fr-FR',
  he_IL = 'he-IL',
  hu_HU = 'hu-HU',
  id_ID = 'id-ID',
  it_IT = 'it-IT',
  ja_JP = 'ja-JP',
  ko_KR = 'ko-KR',
  nl_NL = 'nl-NL',
  no_NO = 'no-NO',
  pl_PL = 'pl-PL',
  pt_BR = 'pt-BR',
  pt_PT = 'pt-PT',
  ro_RO = 'ro-RO',
  ru_RU = 'ru-RU',
  sr_SP = 'sr-SP',
  sv_SE = 'sv-SE',
  sw_TZ = 'sw-TZ',
  tr_TR = 'tr-TR',
  uk_UA = 'uk-UA',
  vi_VN = 'vi-VN',
  zh_TW = 'zh-TW',
}

export const LOCALE_MESSAGE_MODULE_NAMES = ['common']

export const DEFAULT_LOCALE = Locale.en

export type SupportedLocale = Locale | 'pseudo'

export const LOCALE_LABEL_MAP: Record<SupportedLocale, string> = {
  [Locale.en]: 'English',
  [Locale.zh_CN]: '简体中文',
  [Locale.en_US]: 'English',
  [Locale.af_ZA]: 'Afrikaans',
  [Locale.ar_SA]: 'العربية',
  [Locale.ca_ES]: 'Català',
  [Locale.cs_CZ]: 'čeština',
  [Locale.da_DK]: 'dansk',
  [Locale.de_DE]: 'Deutsch',
  [Locale.el_GR]: 'ελληνικά',
  [Locale.es_ES]: 'Español',
  [Locale.fi_FI]: 'suomi',
  [Locale.fr_FR]: 'français',
  [Locale.he_IL]: 'עִברִית',
  [Locale.hu_HU]: 'Magyar',
  [Locale.id_ID]: 'bahasa Indonesia',
  [Locale.it_IT]: 'Italiano',
  [Locale.ja_JP]: '日本語',
  [Locale.ko_KR]: '한국어',
  [Locale.nl_NL]: 'Nederlands',
  [Locale.no_NO]: 'norsk',
  [Locale.pl_PL]: 'Polskie',
  [Locale.pt_BR]: 'português',
  [Locale.pt_PT]: 'português',
  [Locale.ro_RO]: 'Română',
  [Locale.ru_RU]: 'русский',
  [Locale.sr_SP]: 'Српски',
  [Locale.sv_SE]: 'svenska',
  [Locale.sw_TZ]: 'Kiswahili',
  [Locale.tr_TR]: 'Türkçe',
  [Locale.uk_UA]: 'Український',
  [Locale.vi_VN]: 'Tiếng Việt',
  [Locale.zh_TW]: '繁体中文',
  pseudo: 'ƥƨèúδô',
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type LocaleKey = {
  tradingview: LanguageCode
}

export const LOCALE_KEY_MAP: Record<Locale, LocaleKey> = {
  [Locale.en]: {
    tradingview: 'en',
  },
  [Locale.zh_CN]: {
    tradingview: 'zh',
  },
  [Locale.en_US]: {
    tradingview: 'en',
  },
  [Locale.af_ZA]: {
    tradingview: 'en',
  },
  [Locale.ar_SA]: {
    tradingview: 'ar',
  },
  [Locale.ca_ES]: {
    tradingview: 'en',
  },
  [Locale.cs_CZ]: {
    tradingview: 'en',
  },
  [Locale.da_DK]: {
    tradingview: 'en',
  },
  [Locale.de_DE]: {
    tradingview: 'de',
  },
  [Locale.el_GR]: {
    tradingview: 'en',
  },
  [Locale.es_ES]: {
    tradingview: 'es',
  },
  [Locale.fi_FI]: {
    tradingview: 'en',
  },
  [Locale.fr_FR]: {
    tradingview: 'fr',
  },
  [Locale.he_IL]: {
    tradingview: 'en',
  },
  [Locale.hu_HU]: {
    tradingview: 'en',
  },
  [Locale.id_ID]: {
    tradingview: 'en',
  },
  [Locale.it_IT]: {
    tradingview: 'it',
  },
  [Locale.ja_JP]: {
    tradingview: 'ja',
  },
  [Locale.ko_KR]: {
    tradingview: 'ko',
  },
  [Locale.nl_NL]: {
    tradingview: 'en',
  },
  [Locale.no_NO]: {
    tradingview: 'en',
  },
  [Locale.pl_PL]: {
    tradingview: 'pl',
  },
  [Locale.pt_BR]: {
    tradingview: 'pt',
  },
  [Locale.pt_PT]: {
    tradingview: 'pt',
  },
  [Locale.ro_RO]: {
    tradingview: 'en',
  },
  [Locale.ru_RU]: {
    tradingview: 'ru',
  },
  [Locale.sr_SP]: {
    tradingview: 'en',
  },
  [Locale.sv_SE]: {
    tradingview: 'sv',
  },
  [Locale.sw_TZ]: {
    tradingview: 'en',
  },
  [Locale.tr_TR]: {
    tradingview: 'tr',
  },
  [Locale.uk_UA]: {
    tradingview: 'en',
  },
  [Locale.vi_VN]: {
    tradingview: 'vi',
  },
  [Locale.zh_TW]: {
    tradingview: 'zh',
  },
}

export const LOCALES = Object.keys(LOCALE_LABEL_MAP) as Locale[]

export const SUPPORTED_LOCALES = [Locale.en, Locale.zh_CN]
