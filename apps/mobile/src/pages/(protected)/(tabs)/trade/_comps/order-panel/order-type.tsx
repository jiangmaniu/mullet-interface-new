import { observer } from 'mobx-react-lite'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { useI18n } from '@/hooks/use-i18n'
import { ORDER_CREATE_TYPE_ENUM_OPTIONS, OrderCreateTypeEnum } from '@/options/trade/order'
import { useRootStore } from '@/stores'
import { tradeFormDataSelector } from '@/stores/trade-slice/formDataSlice'

export const OrderType = observer(() => {
  const { renderLinguiMsg } = useI18n()
  const orderType = useRootStore((s) => tradeFormDataSelector(s).orderType)

  const handleTabValueChange = (key: OrderCreateTypeEnum) => {
    tradeFormDataSelector(useRootStore.getState()).setType(key as OrderCreateTypeEnum)
  }

  return (
    <Tabs value={orderType} onValueChange={handleTabValueChange}>
      <TabsList variant="underline" size="md" className="border-brand-default w-full border-b-1">
        {ORDER_CREATE_TYPE_ENUM_OPTIONS.map((option) => (
          <TabsTrigger key={option.value} value={option.value} className="flex-1">
            <Text>{renderLinguiMsg(option.label)}</Text>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
})
