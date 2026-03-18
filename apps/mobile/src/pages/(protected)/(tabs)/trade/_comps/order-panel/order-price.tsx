import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Pressable, View } from 'react-native'

import { NumberInput, NumberInputSourceType } from '@/components/ui/number-input'
import { Text } from '@/components/ui/text'
import { t } from '@/locales/i18n'
import { useRootStore } from '@/stores'
import { tradeFormDataLimitPriceSelector } from '@/stores/trade-slice'
import useDisabled from '@/v1/hooks/trade/useDisabled'
import { useStores } from '@/v1/provider/mobxProvider'
import { useGetCurrentQuoteCallback } from '@/v1/utils/wsUtil'
import { BNumber } from '@mullet/utils/number'

export const OrderPrice = observer(({ symbol }: { symbol: string }) => {
  const { trade } = useStores()
  const orderType = trade.orderType

  const { setOrderPrice, orderPrice } = trade
  const limitPrice = useRootStore(tradeFormDataLimitPriceSelector)
  const setFormData = useRootStore.getState().trade.formData.setFormData

  const isBuyOrder = trade.buySell === 'BUY'
  const isMarket = orderType === 'MARKET_ORDER'

  const getCurrentQuote = useGetCurrentQuoteCallback()
  const quoteInfo = getCurrentQuote(symbol)
  const symbolInfo = trade.getActiveSymbolInfo(symbol)
  const { disabledInput } = useDisabled()
  const handleSetLatestPrice = () => {
    const price = isBuyOrder ? quoteInfo?.bid : quoteInfo?.ask
    setOrderPrice(price)
    setFormData({ limitPrice: price })
  }

  return (
    <>
      {orderType === 'MARKET_ORDER' ? (
        <View className="border-brand-default rounded-small py-large px-xl flex-row items-center justify-between border">
          <Text className="text-paragraph-p2 text-content-5">
            <Trans>以当前最优价</Trans>
          </Text>
        </View>
      ) : (
        <>
          <NumberInput
            labelText={t`价格`}
            placeholder={BNumber.toFormatNumber(0, { volScale: symbolInfo?.symbolDecimal })}
            decimalScale={symbolInfo?.symbolDecimal}
            value={orderPrice}
            disabled={disabledInput}
            onValueChange={({ value }, { source }) => {
              if (isMarket) {
                return
              }

              if (source === NumberInputSourceType.EVENT) {
                console.log('price event', value)
                setOrderPrice(value)
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
