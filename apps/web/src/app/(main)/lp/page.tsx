// import { GeneralTooltip } from '@/components/tooltip'
// import { Icons } from '@/components/ui/icons'
// import { useEmotionCss } from '@ant-design/use-emotion-css'
import VaultDetailCharts from './_comps/charts'
import VaultDetailInfo from './_comps/info'
import VaultDetailIOPanel from './_comps/io'
import VaultDetailRecords from './_comps/records'

export default function LPVaultPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {/* <VaultDetailTitle /> */}

      <div className="flex flex-col gap-2.5">
        {/* <VaultDetailOverview /> */}
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
            <VaultDetailIOPanel />
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
  const titleClassName = useEmotionCss(() => ({
    fontFamily: 'HarmonyOS Sans SC',
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: 'normal',
    letterSpacing: '0em',
    fontVariationSettings: '"opsz" auto',
    fontFeatureSettings: '"kern" on',
    color: '#FFFFFF',
  }))
  const addressClassName = useEmotionCss(() => ({
    fontFamily: 'HarmonyOS Sans SC',
    fontSize: '14px',
    fontWeight: 'normal',
    lineHeight: 'normal',
    letterSpacing: '0em',
    fontVariationSettings: '"opsz" auto',
    fontFeatureSettings: '"kern" on',
    color: '#9FA0B0',
  }))
  return (
    <div className="py-5">
      <div className={titleClassName}>MTLP</div>

      <div className="flex items-center gap-2.5">
        <div className={addressClassName}>目前个人存入额度为 0.00 USDC，超出的存入额度将不会有稳定币收益。</div>
      </div>
    </div>
  )
}

function VaultDetailOverview() {
  const contentClassName = useEmotionCss(() => ({
    fontFamily: 'HarmonyOS Sans SC',
    fontSize: '24px',
    fontWeight: 'normal',
    lineHeight: 'normal',
    letterSpacing: '0em',
    fontVariationSettings: '"opsz" auto',
    fontFeatureSettings: '"kern" on',
    color: '#FFFFFF',
  }))

  const labelClassName = useEmotionCss(() => ({
    fontFamily: 'HarmonyOS Sans SC',
    fontSize: '14px',
    fontWeight: 'normal',
    lineHeight: 'normal',
    letterSpacing: '0em',
    fontVariationSettings: '"opsz" auto',
    fontFeatureSettings: '"kern" on',
    color: '#9FA0B0',
  }))

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
      ].map((item) => (
        <div className="flex flex-1 flex-col gap-1.5 px-[30px] py-[25px]">
          <div className={contentClassName}>{item.content}</div>
          <div className="flex items-center gap-3">
            <div className={labelClassName}>{item.label}</div>
            {item.tooltip && (
              <GeneralTooltip content={item.tooltip}>
                <Icons.lucide.Info className="h-4 w-4 text-[#9FA0B0]" />
              </GeneralTooltip>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
