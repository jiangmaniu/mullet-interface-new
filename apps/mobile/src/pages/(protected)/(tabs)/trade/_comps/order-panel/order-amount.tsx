import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import { NumberInput, NumberInputSourceType } from '@/components/ui/number-input'
import { Text } from '@/components/ui/text'
import { parseTradeDirectionInfo } from '@/helpers/parse/trade'
import { parseSymbolLotsVolScale } from '@/helpers/symbol'
import { useI18n } from '@/hooks/use-i18n'
import { LOTS_UNIT_LABEL } from '@/options/trade/unit'
import { useRootStore } from '@/stores'
import { useMarketSymbolInfo } from '@/stores/market-slice'
import { tradeFormDataSelector } from '@/stores/trade-slice/formDataSlice'
import useDisabled from '@/v1/hooks/trade/useDisabled'
import { renderFallbackPlaceholder } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'

export const OrderAmount = observer(({ symbol }: { symbol?: string }) => {
  const setFormData = useRootStore.getState().trade.formData.setFormData
  const { disabledInput } = useDisabled()
  const disabled = disabledInput

  const { amount, direction } = useRootStore(
    useShallow((s) => {
      const formData = tradeFormDataSelector(s)

      return {
        amount: formData.amount,
        direction: formData.direction,
      }
    }),
  )

  const { isBuy } = parseTradeDirectionInfo(direction)
  const symbolInfo = useMarketSymbolInfo(symbol)
  const lotsVolScale = parseSymbolLotsVolScale(symbolInfo?.symbolConf)
  const { renderLinguiMsg } = useI18n()

  return (
    <View className="gap-xl">
      <NumberInput
        labelText={isBuy ? <Trans>买入手数</Trans> : <Trans>卖出手数</Trans>}
        value={amount}
        onValueChange={({ value }, { source }) => {
          if (source === NumberInputSourceType.EVENT) {
            setFormData({ amount: value })
          }
        }}
        placeholder={renderFallbackPlaceholder({
          volScale: lotsVolScale,
        })}
        decimalScale={lotsVolScale}
        keyboardType="decimal-pad"
        RightContent={<Text className="text-paragraph-p2 text-content-1">{renderLinguiMsg(LOTS_UNIT_LABEL)}</Text>}
        variant="outlined"
        size="md"
        disabled={disabled}
      />

      {/* Quantity Range Hint */}
      <Text className="text-paragraph-p3 text-content-4">
        <Trans>范围</Trans>{' '}
        <Text className="text-content-1 text-paragraph-p3">
          {BNumber.toFormatNumber(symbolInfo?.symbolConf?.minTrade, { volScale: lotsVolScale })}
          {' - '}
          {BNumber.toFormatNumber(symbolInfo?.symbolConf?.maxTrade, { volScale: lotsVolScale })}{' '}
          {renderLinguiMsg(LOTS_UNIT_LABEL)}
        </Text>
      </Text>
    </View>
  )
})
