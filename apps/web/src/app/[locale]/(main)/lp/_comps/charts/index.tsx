'use client'

import { useEffect, useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@mullet/ui/tabs'
import { basicExample } from '@mullet/ws/examples'

import { VaultPNLCharts } from './pnl'
import { VaultBalanceCharts } from './vault-balance'

export default function VaultDetailCharts() {
  useEffect(() => {
    basicExample()
  }, [])

  enum TabEnum {
    PNL,
    VaultBalance,
  }

  const [tab, setTab] = useState<TabEnum>(TabEnum.PNL)

  const options = [
    {
      label: 'PNL',
      value: TabEnum.PNL,
      content: <VaultPNLCharts />,
    },

    {
      label: 'Vault Balance',
      value: TabEnum.VaultBalance,
      content: <VaultBalanceCharts />,
    },
  ]

  return (
    <div className="rounded-[10px] bg-[#0A0C27]">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {options.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="min-h-[210px] p-[30px]">
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
