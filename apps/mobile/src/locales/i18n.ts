import { getLocales } from 'expo-localization'
import { i18n, MessageDescriptor } from '@lingui/core'

export const LOCALE_ZH_CN = 'zh-cn'
export const LOCALE_ZH_TW = 'zh-tw'
export const LOCALE_ZH_HK = 'zh-hk'
export const LOCALE_EN = 'en'

export const locales = {
  [LOCALE_ZH_CN]: '简体中文',
  [LOCALE_ZH_TW]: '繁體中文',
  [LOCALE_ZH_HK]: '繁體中文（香港）',
  [LOCALE_EN]: 'English',
}

export const availableLocales = Object.keys(locales)

export type Locale = keyof typeof locales

export const defaultLocale: Locale = LOCALE_ZH_CN

function getLanguage(): Locale {
  const deviceLocales = getLocales()
  const languageCode = deviceLocales[0]?.languageCode
  const regionCode = deviceLocales[0]?.regionCode
  const languageTag = deviceLocales[0]?.languageTag

  console.log('Detected locale:', { languageCode, regionCode, languageTag })

  // 优先匹配完整的 languageTag
  if (languageTag) {
    const lowerTag = languageTag.toLowerCase()
    if (Object.keys(locales).includes(lowerTag)) {
      return lowerTag as Locale
    }
  }

  // 基于 languageCode 和 regionCode 的回退策略
  if (languageCode === 'zh') {
    if (regionCode === 'HK' || regionCode === 'MO') {
      return LOCALE_ZH_HK
    }
    if (regionCode === 'TW') {
      return LOCALE_ZH_TW
    }
    return LOCALE_ZH_CN
  }

  // 匹配基础语言代码
  if (languageCode && (languageCode in locales)) {
    // @ts-ignore
    return languageCode as Locale
  }

  // 默认返回简体中文
  return defaultLocale
}

export async function dynamicActivate(locale: Locale) {
  try {
    console.log(`[i18n] Attempting to switch to locale: ${locale}`)
    let messages
    switch (locale) {
      case LOCALE_ZH_TW:
        messages = (await import(`./zh-tw/messages.po`)).messages
        break
      case LOCALE_ZH_HK:
        messages = (await import(`./zh-hk/messages.po`)).messages
        break
      case LOCALE_EN:
        messages = (await import(`./en/messages.po`)).messages
        break
      case LOCALE_ZH_CN:
      default:
        messages = (await import(`./zh-cn/messages.po`)).messages
        break
    }
    
    console.log(`[i18n] Loaded messages for ${locale}:`, messages ? Object.keys(messages).length : 'undefined')
    
    i18n.load(locale, messages)
    i18n.activate(locale)
    console.log(`[i18n] Activated locale: ${locale}`)
  } catch (e) {
    console.error(`Failed to load locale ${locale}`, e)
  }
}

export const t = (descriptor: MessageDescriptor | string | TemplateStringsArray, ...args: any[]) => {
  if (Array.isArray(descriptor) && 'raw' in descriptor) {
    return i18n._(String.raw(descriptor as TemplateStringsArray, ...args))
  }
  if (typeof descriptor === 'string') {
    return i18n._(descriptor, args[0])
  }
  return i18n._(descriptor as MessageDescriptor)
}

export const initialLocale = getLanguage()

export { i18n }
