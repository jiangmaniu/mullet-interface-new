import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useRef } from 'react'
import { View } from 'react-native'

import { Button } from '@/components/ui/button'
import { DrawerRef } from '@/components/ui/drawer'
import { Text } from '@/components/ui/text'
import { parseTradeDirectionInfo } from '@/helpers/parse/trade'
import { useRootStore } from '@/stores'
import { tradeFormDataDirectionSelector } from '@/stores/trade-slice/formDataSlice'
import { tradeSettingOrderConfirmationSelector } from '@/stores/trade-slice/settingSlice'

import useSubmitOrder from '../../_hooks/use-submit-order'
import { useVerifyCreateOrderData } from '../../_hooks/use-verify-order'
import { OrderConfirmDrawer } from '../open-order-confirm-drawer'

export const OrderSubmit = observer(({ symbol }: { symbol?: string }) => {
  const orderConfirmDrawerRef = useRef<DrawerRef>(null)
  const direction = useRootStore(tradeFormDataDirectionSelector)
  const { isBuy } = parseTradeDirectionInfo(direction)

  const orderConfirmation = useRootStore(tradeSettingOrderConfirmationSelector)
  const { verifyCreateOrderData } = useVerifyCreateOrderData({ symbol })

  const { onSubmitOrder, isSubmitLoading } = useSubmitOrder({ symbol })

  const handleSubmitOrder = async () => {
    await onSubmitOrder()
  }

  const handleConfirm = () => {
    if (!verifyCreateOrderData()) {
      return
    }

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

      <OrderConfirmDrawer ref={orderConfirmDrawerRef} symbol={symbol} onConfirm={handleSubmitOrder} />
    </View>
  )
})
