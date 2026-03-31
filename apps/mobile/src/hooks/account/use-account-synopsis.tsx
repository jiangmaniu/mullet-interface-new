import { getAccountSynopsisByLng } from '@/helpers/account'
import { AccountGroup } from '@/services/tradeCore/accountGroup/typings'

import { useI18n } from '../use-i18n'

export const useAccountSynopsis = (synopsis?: AccountGroup.SynopsisConf[]) => {
  const { locale } = useI18n()
  return getAccountSynopsisByLng(synopsis, locale) as AccountGroup.SynopsisConf
}
