import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { View } from 'react-native'

import { NumberInput, NumberInputSourceType } from '@/components/ui/number-input'
import { Text } from '@/components/ui/text'
import { parseSymbolLotsVolScale } from '@/helpers/symbol'
import { useI18n } from '@/hooks/use-i18n'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { LOTS_UNIT_LABEL } from '@/options/trade/unit'
import useDisabled from '@/v1/hooks/trade/useDisabled'
import useQuote from '@/v1/hooks/trade/useQoute'
import { useStores } from '@/v1/provider/mobxProvider'
import { renderFallbackPlaceholder } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'

import { useOrderPanelStore } from './store/order-panel-store'

export const OrderAmount = observer(({ symbol }: { symbol: string }) => {
  const { vmax, vmin } = useQuote()
  const { trade } = useStores()
  const { orderVolume, setOrderVolume } = trade
  const { setOrderVolume: setOrderVolumePanel } = useOrderPanelStore()
  const { disabledInput } = useDisabled()
  const disabled = disabledInput

  const symbolInfo = trade.getActiveSymbolInfo(symbol)
  const lotsVolScale = parseSymbolLotsVolScale(symbolInfo)
  const amount = BNumber.from(orderVolume).cutDecimalPlaces(lotsVolScale).toFixed()
  const { renderLinguiMsg } = useI18n()
  const isBuy = trade.buySell === TradePositionDirectionEnum.BUY

  return (
    <View className="gap-xl">
      <NumberInput
        labelText={isBuy ? <Trans>买入手数</Trans> : <Trans>卖出手数</Trans>}
        value={amount}
        onValueChange={({ value }, { source }) => {
          if (source === NumberInputSourceType.EVENT) {
            setOrderVolume(value)
            setOrderVolumePanel(value)
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
          {BNumber.toFormatNumber(vmin, { volScale: lotsVolScale })}-
          {BNumber.toFormatNumber(vmax, { volScale: lotsVolScale })} {renderLinguiMsg(LOTS_UNIT_LABEL)}
        </Text>
      </Text>
    </View>
  )
})
