import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useRef } from 'react'
import { View } from 'react-native'

import { Button } from '@/components/ui/button'
import { DrawerRef } from '@/components/ui/drawer'
import { Text } from '@/components/ui/text'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { useTradeSettingsStore } from '@/stores/trade-settings'
import { useStores } from '@/v1/provider/mobxProvider'

import useSubmitOrder from '../../hooks/useSubmitOrder'
import { OrderConfirmDrawer } from '../open-order-confirm-drawer'

export const OrderSubmit = observer(() => {
  const orderConfirmDrawerRef = useRef<DrawerRef>(null)
  const { trade } = useStores()
  const { buySell } = trade
  const isBuy = buySell === TradePositionDirectionEnum.BUY

  const orderConfirmation = useTradeSettingsStore((state) => state.orderConfirmation)

  const { onSubmitOrder, onCheckSubmit, isSubmitLoading } = useSubmitOrder()

  const handleSubmitOrder = async () => {
    if (!onCheckSubmit()) {
      return
    }
    await onSubmitOrder()
  }

  const handleConfirm = () => {
    if (orderConfirmation) {
      orderConfirmDrawerRef.current?.open()
    } else {
      handleSubmitOrder()
    }
  }
  return (
    <View>
      {/* Submit Button */}
      <Button variant="solid" color="primary" size="lg" loading={isSubmitLoading} block onPress={handleConfirm}>
        <Text className="text-content-foreground text-button-2 font-medium">
          {isBuy ? <Trans>确定买入</Trans> : <Trans>确定卖出</Trans>}
        </Text>
      </Button>

      <OrderConfirmDrawer ref={orderConfirmDrawerRef} />
    </View>
  )
})
