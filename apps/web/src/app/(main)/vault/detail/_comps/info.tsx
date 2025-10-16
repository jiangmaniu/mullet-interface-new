import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BNumber } from '@/utils/b-number'
import { useState } from 'react'
import { useVaultDetail } from '../_hooks/use-vault-detail'

export default function VaultDetailInfo() {
  enum TabEnum {
    About,
    VaultPerformance,
    YourPerformance
  }

  const [tab, setTab] = useState<TabEnum>(TabEnum.About)

  const options = [
    {
      label: 'About',
      value: TabEnum.About,
      content: (
        <div>
          <div className="text-[24px] font-bold text-white">MTLP</div>
          <div className="mt-1 text-[#9FA0B0] text-[14px]">
            MTLP 是一个通过多种做市策略为 edgeX 提供流动性的金库，收益来自做市、清算费和部分手续费。
          </div>
        </div>
      )
    },

    {
      label: 'Vault Performance',
      value: TabEnum.VaultPerformance,
      content: <VaultPerformance />
    },

    {
      label: 'Your Performance',
      value: TabEnum.YourPerformance,
      content: <YourPerformance />
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
              <TabsContent key={item.value} value={item.value}>
                {item.content}
              </TabsContent>
            )
          })}
        </div>
      </Tabs>
    </div>
  )
}

function VaultPerformance() {
  const { vaultDetail } = useVaultDetail()
  const options = [
    {
      label: '总盈亏金额',
      content: (
        <div className="text-[#2EBC84]">
          {BNumber.toFormatNumber(vaultDetail?.totalProfit, {
            unit: 'USDC',
            volScale: 2
          })}
        </div>
      )
    },
    {
      label: '最大回撤',
      content: <div className="">{BNumber.toFormatPercent(vaultDetail?.maxDrawdown)}</div>
    },
    {
      label: '成交量',
      content: (
        <div className="">
          {BNumber.toFormatNumber(vaultDetail?.totalAmount, {
            unit: 'USDC',
            volScale: 2
          })}
        </div>
      )
    },
    {
      label: '利润分享',
      content: <div className="">{BNumber.toFormatPercent(vaultDetail?.authorityProfitSharing)}</div>
    }
  ]
  return (
    <div className="flex gap-[60px]">
      <div className="flex flex-col gap-[14px]">
        {options.map((item, index) => {
          return (
            <div key={index} className="text-[#9FA0B0] text-[14px] ">
              {item.label}
            </div>
          )
        })}
      </div>
      <div className="flex flex-col gap-[14px]">
        {options.map((item, index) => {
          return <div className="text-white">{item.content}</div>
        })}
      </div>
    </div>
  )
}

function YourPerformance() {
  const { vaultDetail } = useVaultDetail()
  const options = [
    {
      label: '总盈亏金额',
      content: (
        <div className="text-[#2EBC84]">
          {BNumber.toFormatNumber(vaultDetail?.accountFollowShares?.followProfit, {
            unit: 'USDC',
            volScale: 2
          })}
        </div>
      )
    },
    {
      label: '累计回报',
      content: (
        <div className="">
          {BNumber.toFormatNumber(undefined, {
            unit: 'USDC',
            volScale: 2
          })}
        </div>
      )
    },
    {
      label: '份额',
      content: (
        <div className="">
          {BNumber.toFormatNumber(vaultDetail?.accountFollowShares?.followShares, {
            volScale: 2
          })}
        </div>
      )
    }
  ]
  return (
    <div className="flex gap-[60px]">
      <div className="flex flex-col gap-[14px]">
        {options.map((item, index) => {
          return (
            <div key={index} className="text-[#9FA0B0] text-[14px] ">
              {item.label}
            </div>
          )
        })}
      </div>
      <div className="flex flex-col gap-[14px]">
        {options.map((item, index) => {
          return (
            <div key={index} className="text-white">
              {item.content}
            </div>
          )
        })}
      </div>
    </div>
  )
}
