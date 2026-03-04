import { observer } from 'mobx-react-lite'
import { useRef } from 'react'
import { View } from 'react-native'

import { Button } from '@/components/ui/button'
import { DrawerRef } from '@/components/ui/drawer'

import { OrderConfirmDrawer } from '../open-order-confirm-drawer'

export const OrderSubmit = observer(() => {
  const orderConfirmDrawerRef = useRef<DrawerRef>(null)
  return (
    <View>
      {/* Submit Button */}
      <Button
        variant="solid"
        color="primary"
        size="lg"
        block
        // onPress={selectedSide === 'buy' ? onBuy : onSell}
        onPress={() => orderConfirmDrawerRef.current?.open()}
      >
        {/* <Text className="text-content-foreground text-button-2 font-medium">
          {selectedSide === 'buy' ? <Trans>确定买入</Trans> : <Trans>确定卖出</Trans>}
        </Text> */}
      </Button>
      <OrderConfirmDrawer ref={orderConfirmDrawerRef} />
    </View>
  )
})
