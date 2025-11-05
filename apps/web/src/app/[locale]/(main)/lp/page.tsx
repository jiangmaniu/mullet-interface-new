// import { useEmotionCss } from '@ant-design/use-emotion-css'
import { GeneralTooltip } from '@/components/tooltip/general'
import { IconInfo } from '@mullet/ui/icons'

import VaultDetailActionPanel from './_comps/action-panel'
import VaultDetailCharts from './_comps/charts'
import VaultDetailInfo from './_comps/info'
import VaultDetailRecords from './_comps/records'

export default function LPVaultPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <VaultDetailTitle />

      <div className="flex flex-col gap-2.5">
        <VaultDetailOverview />
        <div className="flex gap-2.5">
          <div className="flex flex-1 flex-col items-stretch gap-2.5">
            <div>
              <VaultDetailInfo />
            </div>
            <div>
              <VaultDetailCharts />
            </div>
          </div>

          <div className="w-full max-w-[480px]">
            <VaultDetailActionPanel />
          </div>
        </div>

        <div>
          <VaultDetailRecords />
        </div>
      </div>
    </div>
  )
}

function VaultDetailTitle() {
  return (
    <div className="py-5">
      <div className={'text-[24px] text-white'}>MTLP</div>

      <div className="flex items-center gap-2.5">
        <div className={'text-[14px] text-[#9FA0B0]'}>
          目前个人存入额度为 0.00 USDC，超出的存入额度将不会有稳定币收益。
        </div>
      </div>
    </div>
  )
}

function VaultDetailOverview() {
  return (
    <div className={'flex rounded-[10px] bg-[#0A0C27] py-2.5'}>
      {[
        {
          label: '总锁仓量',
          content: '$18,229,265.84',
        },

        {
          label: '过去一个月表现',
          content: 'APR 15.78%',
        },
        {
          label: '你的余额',
          content: '--',
          tooltip: '回报率是根据不同周期的平均值计算的，并不代表真实的未来收益。 30 day 14.05%',
        },
        {
          label: '您总赚取金额',
          content: '--',
          tooltip: '回报率是根据不同周期的平均值计算的，并不代表真实的未来收益。 30 day 14.05%',
        },
      ].map((item, index) => (
        <div key={index} className="flex flex-1 flex-col gap-1.5 px-[30px] py-[25px]">
          <div className={'text-[24px] text-white'}>{item.content}</div>
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
