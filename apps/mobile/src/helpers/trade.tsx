import { Trans } from '@lingui/react/macro'

import { DEFAULT_LEVERAGE_UNIT } from '@/constants/config/trade'
import { Symbol } from '@/v1/services/tradeCore/symbol/typings'
import { BNumber, BNumberValue } from '@mullet/utils/number'

type RenderFormatLeverageParams = {
  leverage?: BNumberValue
  symbolInfo?: Symbol.SymbolConf
}

export const renderFormatLeverage = (params: RenderFormatLeverageParams = {}) => {
  const { leverage, symbolInfo } = params ?? {}

  if (symbolInfo?.prepaymentConf?.mode === 'fixed_margin') {
    return <Trans>固定</Trans>
  } else if (symbolInfo?.prepaymentConf?.mode === 'fixed_leverage') {
    const fixedLeverage = symbolInfo?.prepaymentConf.fixed_leverage?.leverage_multiple
    return `${BNumber.from(fixedLeverage)?.toString()}${DEFAULT_LEVERAGE_UNIT}`
  } else if (symbolInfo?.prepaymentConf?.mode === 'float_leverage' && leverage) {
    return `${BNumber.from(leverage)?.toString()}${DEFAULT_LEVERAGE_UNIT}`
  }
}
