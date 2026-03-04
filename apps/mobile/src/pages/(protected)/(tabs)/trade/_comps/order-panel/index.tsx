import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { View } from 'react-native'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { t } from '@/locales/i18n'
import { useStores } from '@/v1/provider/mobxProvider'
import { ITradeTabsOrderType } from '@/v1/stores/trade'

import { OrderDirection } from './order-direction'
import { OrderOverview } from './order-overview'
import { OrderPrice } from './order-price'
import { OrderSubmit } from './order-submit'

// ============ OrderPanel ============
interface OrderPanelProps {
  buyPrice: string
  sellPrice: string
  spread: number
  onBuy: () => void
  onSell: () => void
  estimatedMargin: string
  maxLots: string
  defaultSide?: 'buy' | 'sell'
}

export const OrderPanel = observer(
  ({ buyPrice, sellPrice, spread, onBuy, onSell, estimatedMargin, maxLots, defaultSide = 'buy' }: OrderPanelProps) => {
    const [orderType, setOrderType] = useState<ITradeTabsOrderType>('MARKET_ORDER')
    const [selectedSide, setSelectedSide] = useState<'buy' | 'sell'>(defaultSide)
    const [quantity, setQuantity] = useState('0.01')
    const [limitPrice, setLimitPrice] = useState('180.66')
    const [stopLossEnabled, setStopLossEnabled] = useState(false)
    const [takeProfitPrice, setTakeProfitPrice] = useState('')
    const [takeProfitPercent, setTakeProfitPercent] = useState('')
    const [stopLossPrice, setStopLossPrice] = useState('')
    const [stopLossPercent, setStopLossPercent] = useState('')

    // Update selectedSide when defaultSide changes (from URL params)
    useEffect(() => {
      setSelectedSide(defaultSide)
    }, [defaultSide])

    const { trade } = useStores()
    const activeSymbolName = trade.activeSymbolName
    const handleTabValueChange = (key: ITradeTabsOrderType) => {
      trade.setOrderType(key)
      trade.setOrderSpslChecked(false)
      setOrderType(key)
    }

    return (
      <View className="px-xl gap-xl">
        {/* Order Type Tabs */}
        <Tabs value={orderType} onValueChange={handleTabValueChange}>
          <TabsList variant="underline" size="md" className="border-brand-default w-full border-b-1">
            <TabsTrigger value="MARKET_ORDER" className="flex-1">
              <Text>
                <Trans>市价</Trans>
              </Text>
            </TabsTrigger>
            <TabsTrigger value="LIMIT_ORDER" className="flex-1">
              <Text>
                <Trans>限价</Trans>
              </Text>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Buy/Sell Buttons */}
        <OrderDirection symbol={activeSymbolName} />

        {/* Price Input - Different UI for Market vs Limit */}
        <OrderPrice symbol={activeSymbolName} />

        {/* Quantity Input */}
        <Input
          labelText={t`买入数量`}
          value={quantity}
          onValueChange={setQuantity}
          keyboardType="decimal-pad"
          RightContent={
            <Text className="text-paragraph-p2 text-content-1">
              <Trans>手</Trans>
            </Text>
          }
          variant="outlined"
          size="md"
        />

        {/* Quantity Range Hint */}
        <Text className="text-paragraph-p3 text-content-4">
          <Trans>买入范围</Trans> ≥{' '}
          <Text className="text-content-1 text-paragraph-p3">
            0.01-20.00<Trans>手</Trans>
          </Text>
        </Text>

        {/* Stop Loss Toggle */}
        <View className="gap-medium flex-row items-center">
          <Switch checked={stopLossEnabled} onCheckedChange={setStopLossEnabled} />
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>止盈/止损</Trans>
          </Text>
        </View>

        {/* Stop Loss/Take Profit Inputs - Only show when enabled */}
        {stopLossEnabled && (
          <>
            {/* Take Profit Section */}
            <View className="gap-xs">
              <View className="gap-xl flex-row">
                <Input
                  labelText={t`止盈触发价`}
                  value={takeProfitPrice}
                  onValueChange={setTakeProfitPrice}
                  keyboardType="decimal-pad"
                  placeholder={t`输入价格`}
                  variant="outlined"
                  size="md"
                  className="flex-1"
                />
                <Input
                  labelText={t`百分比`}
                  value={takeProfitPercent}
                  onValueChange={setTakeProfitPercent}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  clean={false}
                  RightContent={<Text className="text-paragraph-p2 text-content-1">%</Text>}
                  variant="outlined"
                  size="md"
                  className="w-[90px]"
                />
              </View>
              <View className="flex-row justify-between">
                <Text className="text-paragraph-p3 text-content-4">
                  <Trans>范围</Trans> ≥ <Text className="text-market-fall text-paragraph-p3">1.17 USDC</Text>
                </Text>
                <Text className="text-paragraph-p3 text-content-4">
                  <Trans>预计盈亏</Trans> ≥ <Text className="text-content-1 text-paragraph-p3">0.00 USDC</Text>
                </Text>
              </View>
            </View>

            {/* Stop Loss Section */}
            <View className="gap-xs">
              <View className="gap-xl flex-row">
                <Input
                  labelText={t`止损触发价`}
                  value={stopLossPrice}
                  onValueChange={setStopLossPrice}
                  keyboardType="decimal-pad"
                  placeholder={t`输入价格`}
                  variant="outlined"
                  size="md"
                  className="flex-1"
                />
                <Input
                  labelText={t`百分比`}
                  value={stopLossPercent}
                  onValueChange={setStopLossPercent}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  clean={false}
                  RightContent={<Text className="text-paragraph-p2 text-content-1">%</Text>}
                  variant="outlined"
                  size="md"
                  className="w-[90px]"
                />
              </View>
              <View className="flex-row justify-between">
                <Text className="text-paragraph-p3 text-content-4">
                  <Trans>范围</Trans> ≥ <Text className="text-content-1 text-paragraph-p3">1.17 USDC</Text>
                </Text>
                <Text className="text-paragraph-p3 text-content-4">
                  <Trans>预计盈亏</Trans> ≥ <Text className="text-content-1 text-paragraph-p3">0.00 USDC</Text>
                </Text>
              </View>
            </View>
          </>
        )}

        <OrderSubmit />

        <OrderOverview symbol={activeSymbolName} />
      </View>
    )
  },
)
