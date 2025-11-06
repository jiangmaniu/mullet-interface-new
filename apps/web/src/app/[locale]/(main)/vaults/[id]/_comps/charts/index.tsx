import { useState } from 'react'

import { cn } from '@mullet/ui/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@mullet/ui/tabs'

import { VaultChartsTimeIntervalEnum } from '../../_hooks/use-vault-charts-data-list'
import { VaultPNLCharts } from './pnl'
import { VaultBalanceCharts } from './vault-balance'

export default function VaultDetailCharts() {
  enum TabEnum {
    PNL,
    VaultBalance,
  }

  const [tab, setTab] = useState<TabEnum>(TabEnum.PNL)
  const [timeInterval, setTimeInterval] = useState<VaultChartsTimeIntervalEnum>(VaultChartsTimeIntervalEnum.HOUR24)

  const options = [
    {
      // label: 'PNL',
      label: '盈亏',
      value: TabEnum.PNL,
      content: <VaultPNLCharts timeInterval={timeInterval} />,
    },

    {
      // label: 'Vault Balance',
      label: '金库余额',
      value: TabEnum.VaultBalance,
      content: <VaultBalanceCharts timeInterval={timeInterval} />,
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

          <div className="ml-auto flex gap-5">
            {[
              {
                label: '24小时',
                value: VaultChartsTimeIntervalEnum.HOUR24,
              },
              {
                label: '30天',
                value: VaultChartsTimeIntervalEnum.DAY30,
              },
              {
                label: '全部',
                value: VaultChartsTimeIntervalEnum.ALL_TIME,
              },
            ].map((item) => {
              const isActive = item.value === timeInterval
              return (
                <div
                  key={item.value}
                  className="flex items-center gap-2"
                  onClick={() => {
                    setTimeInterval(item.value)
                  }}
                >
                  <div
                    className={cn([
                      'text-[14px]',
                      {
                        'cursor-pointer text-[#9FA0B0] hover:text-white': !isActive,
                        'text-white': isActive,
                      },
                    ])}
                  >
                    {item.label}
                  </div>
                </div>
              )
            })}
          </div>
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
