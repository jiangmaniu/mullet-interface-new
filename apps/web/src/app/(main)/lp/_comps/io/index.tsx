import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import VaultDetailDeposits from './deposits'
import VaultDetailWithdrawals from './withdrawals'

export default function VaultDetailIOPanel() {
  enum TabEnum {
    Deposit,
    Withdrawal
  }
  const [tab, setTab] = useState<TabEnum>(TabEnum.Deposit)

  const options = [
    {
      label: 'Deposit',
      value: TabEnum.Deposit,
      content: <VaultDetailDeposits />
    },
    {
      label: 'Withdrawal',
      value: TabEnum.Withdrawal,
      content: <VaultDetailWithdrawals />
    }
  ]

  return (
    <div className={'rounded-[10px] h-full bg-[#0A0C27]'}>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {options.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="p-[30px] ">
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
