'use client'

import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@mullet/ui/tabs'

import { VaultDepositRecords } from './deposit-records'
import { VaultWithdrawalRecords } from './withdrawal-records'

export default function VaultDetailRecords() {
  enum TabEnum {
    DepositRecords,
    WithdrawalRecords,
  }
  const [tab, setTab] = useState<TabEnum>(TabEnum.DepositRecords)

  const options = [
    {
      label: '存款记录',
      value: TabEnum.DepositRecords,
      content: <VaultDepositRecords />,
    },
    {
      label: '取现记录',
      value: TabEnum.WithdrawalRecords,
      content: <VaultWithdrawalRecords />,
    },
  ]

  return (
    <div className={'h-full rounded-[10px] bg-[#0A0C27]'}>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {options.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-2.5 min-h-[250px]">
          {options.map((item) => (
            <TabsContent key={item.value} value={item.value}>
              {item.content}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
}
