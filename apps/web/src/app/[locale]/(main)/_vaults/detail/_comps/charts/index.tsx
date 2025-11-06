import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/utils/cn'
import { useState } from 'react'
import { VaultChartsTimeIntervalEnum } from '../../_hooks/use-vault-charts-data-list'
import { VaultPNLCharts } from './pnl'
import { VaultBalanceCharts } from './vault-balance'

export default function VaultDetailCharts() {
  enum TabEnum {
    PNL,
    VaultBalance
  }

  const [tab, setTab] = useState<TabEnum>(TabEnum.PNL)
  const [timeInterval, setTimeInterval] = useState<VaultChartsTimeIntervalEnum>(VaultChartsTimeIntervalEnum.HOUR24)

  const options = [
    {
      label: 'PNL',
      value: TabEnum.PNL,
      content: <VaultPNLCharts timeInterval={timeInterval} />
    },

    {
      label: 'Vault Balance',
      value: TabEnum.VaultBalance,
      content: <VaultBalanceCharts timeInterval={timeInterval} />
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

          <div className="flex gap-5 ml-auto">
            {[
              {
                label: '24H',
                value: VaultChartsTimeIntervalEnum.HOUR24
              },
              {
                label: '30D',
                value: VaultChartsTimeIntervalEnum.DAY30
              },
              {
                label: 'ALL',
                value: VaultChartsTimeIntervalEnum.ALL_TIME
              }
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
                        'text-[#9FA0B0] cursor-pointer hover:text-white': !isActive,
                        'text-white': isActive
                      }
                    ])}
                  >
                    {item.label}
                  </div>
                </div>
              )
            })}
          </div>
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
