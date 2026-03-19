import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Pressable, View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import { NumberInput, NumberInputSourceType } from '@/components/ui/number-input'
import { Text } from '@/components/ui/text'
import { parseTradeDirectionInfo, parseTradeOrderCreateTypeInfo } from '@/helpers/parse/trade'
import { useMarketQuoteInfo } from '@/hooks/market/use-market-quote'
import { useDisabledTrade } from '@/pages/(protected)/(trade)/_hooks/use-disabled-trade'
import { useRootStore } from '@/stores'
import { useMarketSymbolInfo } from '@/stores/market-slice'
import { tradeFormDataSelector } from '@/stores/trade-slice/formDataSlice'
import { userInfoActiveTradeAccountIdSelector } from '@/stores/user-slice/infoSlice'
import { BNumber } from '@mullet/utils/number'

export const OrderPrice = observer(({ symbol }: { symbol?: string }) => {
  const { limitPrice, type, direction } = useRootStore(
    useShallow((s) => {
      const formatData = tradeFormDataSelector(s)
      return {
        limitPrice: formatData.limitPrice,
        type: formatData.orderType,
        direction: formatData.direction,
      }
    }),
  )
  const setFormData = useRootStore.getState().trade.formData.setFormData
  const { isBuy: isBuyOrder } = parseTradeDirectionInfo(direction)
  const { isMarket } = parseTradeOrderCreateTypeInfo(type)

  const quoteInfo = useMarketQuoteInfo(symbol)
  const symbolInfo = useMarketSymbolInfo(symbol)
  const activeTradeAccountId = useRootStore(userInfoActiveTradeAccountIdSelector)
  const { disabledInput } = useDisabledTrade({
    accountId: activeTradeAccountId,
    symbol,
  })
  const handleSetLatestPrice = () => {
    const price = isBuyOrder ? quoteInfo?.bid : quoteInfo?.ask
    setFormData({ limitPrice: price })
  }

  return (
    <>
      {isMarket ? (
        <View className="border-brand-default rounded-small py-large px-xl flex-row items-center justify-between border">
          <Text className="text-paragraph-p2 text-content-5">
            <Trans>以当前最优价</Trans>
          </Text>
        </View>
      ) : (
        <>
          <NumberInput
            labelText={<Trans>价格</Trans>}
            placeholder={BNumber.toFormatNumber(0, { volScale: symbolInfo?.symbolDecimal })}
            decimalScale={symbolInfo?.symbolDecimal}
            value={limitPrice}
            disabled={disabledInput}
            onValueChange={({ value }, { source }) => {
              if (isMarket) {
                return
              }

              if (source === NumberInputSourceType.EVENT) {
                setFormData({ limitPrice: value })
              }
            }}
            keyboardType="decimal-pad"
            RightContent={
              <Pressable onPress={handleSetLatestPrice}>
                <Text className="text-paragraph-p2 text-brand-primary">
                  <Trans>最新</Trans>
                </Text>
              </Pressable>
            }
            variant="outlined"
            size="md"
          />
        </>
      )}
    </>
  )
})
