import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { useStores } from '@/v1/provider/mobxProvider'
import { ITradeTabsOrderType } from '@/v1/stores/trade'

export const OrderType = observer(() => {
  const { trade } = useStores()
  const { orderType, resetTradeAction, setOrderSpslChecked, setOrderType } = trade

  const handleTabValueChange = (key: ITradeTabsOrderType) => {
    setOrderType(key)
    setOrderSpslChecked(false)
    resetTradeAction()
  }

  return (
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
  )
})
