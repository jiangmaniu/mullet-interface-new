import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { VaultPNLCharts } from './pnl'
import { VaultBalanceCharts } from './vault-balance'

export default function VaultDetailCharts() {
  enum TabEnum {
    PNL,
    VaultBalance
  }

  const [tab, setTab] = useState<TabEnum>(TabEnum.PNL)

  const options = [
    {
      label: 'PNL',
      value: TabEnum.PNL,
      content: <VaultPNLCharts />
    },

    {
      label: 'Vault Balance',
      value: TabEnum.VaultBalance,
      content: <VaultBalanceCharts />
    }
  ]

  return (
    <div className="bg-[#0A0C27] rounded-[10px]">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {options.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="p-[30px] min-h-[210px]">
          {options.map((item) => {
            return (
              <TabsContent asChild key={item.value} value={item.value}>
                {item.content}
              </TabsContent>
            )
          })}
        </div>
      </Tabs>
    </div>
  )
}
