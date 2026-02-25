import { observer } from "mobx-react-lite"

import React from 'react'
import { View, Pressable } from 'react-native'
import { Text } from '@/components/ui/text'
import { Trans } from '@lingui/react/macro'
import { Input } from '@/components/ui/input'
import { t } from '@/locales/i18n'
import { useStores } from "@/v1/provider/mobxProvider"
import { useGetCurrentQuoteCallback } from "@/v1/utils/wsUtil"
import { BNumber } from "@mullet/utils/number"
import useDisabled from "@/v1/hooks/trade/useDisabled"
import useQuote from "@/v1/hooks/trade/useQoute"

export const OrderPrice = observer(({ symbol }: { symbol: string }) => {
  const { trade } = useStores()
  const orderType = trade.orderType

  const { setOrderPrice } = trade

  const isBuyOrder = trade.buySell === 'BUY'

  const getCurrentQuote = useGetCurrentQuoteCallback()
  const quoteInfo = getCurrentQuote(symbol)
  const symbolInfo = trade.getActiveSymbolInfo(symbol)
  const { disabledInput } = useDisabled()
  const { orderPrice: price } = useQuote()
  const handleSetLatestPrice = () => {
    if (isBuyOrder) {
      setOrderPrice(quoteInfo?.bid)
    } else {
      setOrderPrice(quoteInfo?.ask)
    }
  }

  return (
    <>
      {orderType === 'MARKET_ORDER' ? (
        <View className="border border-brand-default rounded-small py-large px-xl flex-row items-center justify-between">
          <Text className="text-paragraph-p2 text-content-5">
            <Trans>以当前最优价</Trans>
          </Text>

        </View>
      ) : (
        <Input
          labelText={t`价格`}
          placeholder={BNumber.toFormatNumber(0, { volScale: symbolInfo.symbolDecimal })}
          // decimalScale={symbolInfo.symbolDecimal}
          value={price}
          // disabled={disabledInput}
          // onValueChange={({ value }, { source }) => {
          //   if (isMarket) {
          //     return
          //   }

          //   if (source === NumberInputSourceType.EVENT) {
          //     setOrderPrice(value)
          //   }
          // }}

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
      )}
    </>
  )
})
