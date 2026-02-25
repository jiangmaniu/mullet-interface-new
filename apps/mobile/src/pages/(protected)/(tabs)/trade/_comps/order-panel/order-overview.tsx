import { observer } from "mobx-react-lite"

import { View, Pressable } from 'react-native'
import { Text } from '@/components/ui/text'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Trans, useLingui } from '@lingui/react/macro'
import useMargin from "@/v1/hooks/trade/useMargin"
import { BNumber } from "@mullet/utils/number"
import { useStores } from "@/v1/provider/mobxProvider"
import { LOTS_UNIT_LABEL } from "@/options/trade/unit"
import { parseSymbolLotsVolScale } from "@/helpers/symbol"
import useOpenVolumn from "@/v1/hooks/trade/useOpenVolumn"

export const OrderOverview = observer(({ symbol }: { symbol: string }) => {
  // 接口计算预估保证金
  const expectedMargin = useMargin()
  const { trade } = useStores()
  const { currentAccountInfo } = trade
  const { i18n } = useLingui()
  const symbolInfo = trade.getActiveSymbolInfo(symbol)
  const lotVolScale = parseSymbolLotsVolScale(symbolInfo.symbolConf)
  const { maxOpenVolume } = useOpenVolumn() // 最大可开仓量
  return (
    <>
      <View className="flex-row justify-between">
        <Tooltip title={<Trans>预估保证金</Trans>}>
          <TooltipTrigger className="text-clickable-1"><Trans>预估保证金</Trans></TooltipTrigger>
          <TooltipContent><Trans>开仓所需的预估保证金金额</Trans></TooltipContent>
        </Tooltip>
        <Text className="text-paragraph-p3 text-content-1">{BNumber.toFormatNumber(expectedMargin, { unit: currentAccountInfo.currencyUnit, volScale: currentAccountInfo.currencyDecimal })}</Text>
      </View>
      <View className="flex-row justify-between">
        <Tooltip title={<Trans>可开</Trans>}>
          <TooltipTrigger className="text-clickable-1"><Trans>可开</Trans></TooltipTrigger>
          <TooltipContent><Trans>当前资金可开仓的最大手数</Trans></TooltipContent>
        </Tooltip>
        <Text className="text-paragraph-p3 text-content-1">
          {
            BNumber.toFormatNumber(maxOpenVolume, { volScale: lotVolScale, unit: i18n._(LOTS_UNIT_LABEL) })
          }
        </Text>
      </View>
    </>
  )
})
