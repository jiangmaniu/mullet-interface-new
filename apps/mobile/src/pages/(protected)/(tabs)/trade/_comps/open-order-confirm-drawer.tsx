import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useImperativeHandle, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'
import { useToggle } from 'ahooks'

import { AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerRef, DrawerTitle } from '@/components/ui/drawer'
import { Text } from '@/components/ui/text'
import { parseSymbolContractSize } from '@/helpers/parse/symbol'
import { parseTradeDirectionInfo } from '@/helpers/parse/trade'
import { parseSymbolLotsVolScale, renderFormatSymbolName } from '@/helpers/symbol'
import { useI18n } from '@/hooks/use-i18n'
import { LOTS_UNIT_LABEL } from '@/options/trade/unit'
import { useRootStore } from '@/stores'
import { useMarketSymbolInfo } from '@/stores/market-slice'
import { tradeFormDataSelector } from '@/stores/trade-slice/formDataSlice'
import { userInfoActiveTradeAccountCurrencyInfoSelector } from '@/stores/user-slice/infoSlice'
import { getImgSource } from '@/utils/img'
import { msg } from '@lingui/core/macro'
import { renderFallback } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'

import { useOrderMargin } from '../_apis/use-order-margin'
import { useCreateOrderPrice } from './order-panel/_hooks/use-order-price'

interface OrderConfirmDrawerProps {
  ref: React.RefObject<Nilable<DrawerRef>>
  onConfirm?: () => void
  symbol?: string
}

export function OrderConfirmDrawer({ ref, onConfirm, symbol }: OrderConfirmDrawerProps) {
  const [open, { toggle, setLeft: setFalse, setRight: setTrue, set: onSet }] = useToggle()
  useImperativeHandle(ref, () => ({
    open: () => setTrue(),
    close: () => setFalse(),
    toggle: () => toggle(),
  }))

  return (
    <Drawer open={open} onOpenChange={onSet}>
      <DrawerContent>
        <DrawerHeader className="pt-3xl px-5">
          <DrawerTitle>
            <Trans>订单确认</Trans>
          </DrawerTitle>
        </DrawerHeader>

        <OrderConfirmDrawerContent onConfirm={onConfirm} symbol={symbol} onClose={setFalse} />
      </DrawerContent>
    </Drawer>
  )
}

const OrderConfirmDrawerContent = observer(
  ({ onConfirm, onClose, symbol }: { symbol?: string; onConfirm?: () => void; onClose: () => void }) => {
    const [isConfirmLoading, { setLeft: setFalse, setRight: setTrue }] = useToggle(false)
    const currentAccountCurrencyInfo = useRootStore(useShallow(userInfoActiveTradeAccountCurrencyInfoSelector))

    const { direction, amount, tpPrice, slPrice } = useRootStore(
      useShallow((s) => {
        const { direction, amount, tpPrice, slPrice } = tradeFormDataSelector(s)
        return { direction, amount, tpPrice, slPrice }
      }),
    )

    const directionInfo = parseTradeDirectionInfo(direction)

    const symbolInfo = useMarketSymbolInfo(symbol)

    const orderConfirmation = useRootStore((s) => s.trade.setting.orderConfirmation)
    const [dontAskAgain, setDontAskAgain] = useState(!orderConfirmation)
    const setOrderConfirmation = useRootStore((s) => s.trade.setting.setOrderConfirmation)
    const { renderLinguiMsg } = useI18n()

    const lotsVolScale = parseSymbolLotsVolScale(symbolInfo)

    const openOrderPrice = useCreateOrderPrice({
      symbol,
    })
    const contractSize = parseSymbolContractSize(symbolInfo?.symbolConf)
    const orderAmountValue = BNumber.from(amount).multipliedBy(openOrderPrice)?.multipliedBy(contractSize)

    // 接口计算预估保证金
    const { data: expectedMargin } = useOrderMargin({ symbol, amount })

    const handleConfirm = async () => {
      try {
        setTrue()
        await Promise.resolve(onConfirm?.())
        if (dontAskAgain) {
          setOrderConfirmation(false)
        }
        onClose?.()
      } catch {
      } finally {
        setFalse()
      }
    }

    return (
      <>
        <View className="gap-3xl px-5">
          <View className="gap-xl">
            {/* Symbol and Direction */}
            <View className="gap-medium flex-row items-center">
              <AvatarImage source={getImgSource(symbolInfo?.imgUrl)} className="size-6 rounded-full" />

              <Text className="text-important-1 text-content-1">{renderFormatSymbolName(symbolInfo)}</Text>
              <Badge color={directionInfo.isBuy ? 'rise' : 'fall'}>
                <Text>{directionInfo.isBuy ? <Trans>做多</Trans> : <Trans>做空</Trans>}</Text>
              </Badge>
            </View>

            {/* Order Details */}
            <View className="gap-medium">
              {/* Price */}
              <View className="flex-row items-center justify-between">
                <Text className="text-paragraph-p2 text-content-4">
                  <Trans>价格</Trans>
                </Text>
                <Text className="text-paragraph-p2 text-market-rise">
                  {BNumber.toFormatNumber(openOrderPrice, {
                    volScale: symbolInfo?.symbolDecimal,
                  })}
                </Text>
              </View>

              {/* Margin */}
              <View className="flex-row items-center justify-between">
                <Text className="text-paragraph-p2 text-content-4">
                  <Trans>保证金</Trans>
                </Text>
                <Text className="text-paragraph-p2 text-content-1">
                  {BNumber.toFormatNumber(expectedMargin, {
                    unit: currentAccountCurrencyInfo?.currencyUnit,
                    volScale: currentAccountCurrencyInfo?.currencyDecimal,
                  })}
                </Text>
              </View>

              {/* Contract Value */}
              <View className="flex-row items-center justify-between">
                <Text className="text-paragraph-p2 text-content-4">
                  <Trans>数量</Trans>
                </Text>
                <Text className="text-paragraph-p2 text-content-1">
                  {BNumber.toFormatNumber(amount, {
                    unit: renderLinguiMsg(LOTS_UNIT_LABEL),
                    volScale: lotsVolScale,
                  })}
                </Text>
              </View>

              {/* Contract Value */}
              <View className="flex-row items-center justify-between">
                <Text className="text-paragraph-p2 text-content-4">
                  <Trans>价值</Trans>
                </Text>
                <Text className="text-paragraph-p2 text-content-1">
                  {BNumber.toFormatNumber(orderAmountValue, {
                    unit: currentAccountCurrencyInfo?.currencyUnit,
                    volScale: currentAccountCurrencyInfo?.currencyDecimal,
                  })}
                </Text>
              </View>

              {/* Take Profit */}
              <View className="flex-row items-center justify-between">
                <Text className="text-paragraph-p2 text-content-4">
                  <Trans>止盈</Trans>
                </Text>
                <Text className="text-paragraph-p2 text-content-4">
                  {renderFallback(
                    BNumber.toFormatNumber(tpPrice, {
                      volScale: symbolInfo?.symbolDecimal,
                      defaultLabel: renderLinguiMsg(msg`未设置`),
                    }),
                    { verify: !!tpPrice },
                  )}
                </Text>
              </View>

              {/* Stop Loss */}
              <View className="flex-row items-center justify-between">
                <Text className="text-paragraph-p2 text-content-4">
                  <Trans>止损</Trans>
                </Text>
                <Text className="text-paragraph-p2 text-content-4">
                  {renderFallback(
                    BNumber.toFormatNumber(slPrice, {
                      volScale: symbolInfo?.symbolDecimal,
                      defaultLabel: renderLinguiMsg(msg`未设置`),
                    }),
                    { verify: !!slPrice },
                  )}
                </Text>
              </View>
            </View>
          </View>

          {/* Don't ask again checkbox */}
          <View className="flex-row items-center justify-center">
            <Pressable onPress={() => setDontAskAgain(!dontAskAgain)} className="gap-medium flex-row items-center">
              <Checkbox checked={dontAskAgain} onCheckedChange={setDontAskAgain} />
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>不再询问，您可以在设置-&gt;交易设置中重新设置</Trans>
              </Text>
            </Pressable>
          </View>
        </View>

        <DrawerFooter className="pb-3xl px-5">
          <Button color="primary" size="lg" block loading={isConfirmLoading} onPress={handleConfirm}>
            <Text>
              <Trans>确定</Trans>
            </Text>
          </Button>
        </DrawerFooter>
      </>
    )
  },
)
