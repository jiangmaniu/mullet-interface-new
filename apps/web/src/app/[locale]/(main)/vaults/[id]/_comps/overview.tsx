import { GeneralTooltip } from '@/components/tooltip/general'
import { IconInfo } from '@mullet/ui/icons'
import { BNumber } from '@mullet/utils/number'

import { useVaultOverviewData } from '../_hooks/use-vault-overview-datga'

export function VaultDetailOverview() {
  const { yourBalance, yourProfit, apr, totalPurchaseMoney } = useVaultOverviewData()

  return (
    <div className={'flex rounded-[10px] bg-[#0A0C27] py-2.5'}>
      {[
        {
          label: '总锁仓量',
          content: `${BNumber.toFormatNumber(totalPurchaseMoney, {
            unit: 'USDC',
            volScale: 2,
          })}`,
        },

        {
          label: '过去一个月表现',
          content: `APR ${BNumber.toFormatPercent(apr)}`,
        },
        {
          label: '你的余额',
          content: `${BNumber.toFormatNumber(yourBalance, {
            unit: 'USDC',
            volScale: 2,
          })}`,
          tooltip: '回报率是根据不同周期的平均值计算的，并不代表真实的未来收益。 30 day 14.05%',
        },
        {
          label: '您总赚取金额',
          content: `${BNumber.toFormatNumber(yourProfit, {
            unit: 'USDC',
            volScale: 2,
          })}`,
          tooltip: '回报率是根据不同周期的平均值计算的，并不代表真实的未来收益。 30 day 14.05%',
        },
      ].map((item, index) => (
        <div key={index} className="flex flex-1 flex-col gap-1.5 px-[30px] py-[25px]">
          <div className={'text-[24px] font-bold text-white'}>{item.content}</div>
          <div className="flex items-center gap-3">
            <div className={'text-[14px] text-[#9FA0B0]'}>{item.label}</div>
            {item.tooltip && (
              <GeneralTooltip content={item.tooltip}>
                <IconInfo className="h-4 w-4 text-[#9FA0B0]" />
              </GeneralTooltip>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
