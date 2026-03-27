import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import { Text } from '@/components/ui/text'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { parseSymbolLotsVolScale } from '@/helpers/symbol'
import { useI18n } from '@/hooks/use-i18n'
import { LOTS_UNIT_LABEL } from '@/options/trade/unit'
import { useRootStore } from '@/stores'
import { useMarketSymbolInfo } from '@/stores/market-slice'
import { tradeFormDataAmountSelector } from '@/stores/trade-slice/formDataSlice'
import { userInfoActiveTradeAccountCurrencyInfoSelector } from '@/stores/user-slice/infoSlice'
import { BNumber } from '@mullet/utils/number'

import { useOrderMargin } from '../../_apis/use-order-margin'
import { useOpenMaxAmount } from '../../_hooks/use-max-amount'

export const OrderOverview = observer(({ symbol }: { symbol?: string }) => {
  const currentAccountCurrencyInfo = useRootStore(useShallow(userInfoActiveTradeAccountCurrencyInfoSelector))
  const symbolInfo = useMarketSymbolInfo(symbol)
  const lotVolScale = parseSymbolLotsVolScale(symbolInfo?.symbolConf)
  const { renderLinguiMsg } = useI18n()

  const amount = useRootStore(tradeFormDataAmountSelector)
  const { data: expectedMargin } = useOrderMargin({ symbol, amount })

  const openMaxAmount = useOpenMaxAmount({ symbol })

  return (
    <>
      <View className="flex-row justify-between">
        <Tooltip title={<Trans>预估保证金</Trans>}>
          <TooltipTrigger className="text-clickable-1">
            <Trans>预估保证金</Trans>
          </TooltipTrigger>
          <TooltipContent>
            <Trans>开仓所需的预估保证金金额</Trans>
          </TooltipContent>
        </Tooltip>
        <Text className="text-paragraph-p3 text-content-1">
          {BNumber.toFormatNumber(expectedMargin, {
            positive: false,
            unit: currentAccountCurrencyInfo?.currencyUnit,
            volScale: currentAccountCurrencyInfo?.currencyDecimal,
          })}
        </Text>
      </View>
      <View className="flex-row justify-between">
        <Tooltip title={<Trans>可开</Trans>}>
          <TooltipTrigger className="text-clickable-1">
            <Trans>可开</Trans>
          </TooltipTrigger>
          <TooltipContent>
            <Trans>当前资金可开仓的最大手数</Trans>
          </TooltipContent>
        </Tooltip>
        <Text className="text-paragraph-p3 text-content-1">
          {BNumber.toFormatNumber(openMaxAmount, { volScale: lotVolScale, unit: renderLinguiMsg(LOTS_UNIT_LABEL) })}
        </Text>
      </View>
    </>
  )
})
