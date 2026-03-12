import { Locale } from '@/locales/i18n'
import { AccountGroup } from '@/v1/services/tradeCore/accountGroup/typings'

/**
 * 根据当前语言返回当前账户简介信息
 * @param synopsis
 * @returns
 */
export const getAccountSynopsisByLng = (synopsis?: AccountGroup.SynopsisConf[], locale?: Locale) => {
  // 没有找到设置的语言，则取第一项
  const synopsisItem =
    synopsis?.find((item: AccountGroup.SynopsisConf) => item.language === locale) || synopsis?.[0] || {}

  return synopsisItem
}
