import { Trans } from '@lingui/react/macro'

import { GeneralTooltip } from '@/components/tooltip/general'
import { Button } from '@mullet/ui/button'
import { TooltipTriggerDottedText } from '@mullet/ui/tooltip'
import { BNumber } from '@mullet/utils/number'

export const AccountDetails = () => {
  const options = [
    {
      label: <Trans>总资产</Trans>,
      value: BNumber.toFormatNumber(1000, {
        unit: 'USDC',
        volScale: 2,
      }),
    },
    {
      label: (
        <GeneralTooltip content={<Trans>占用保证金</Trans>}>
          <TooltipTriggerDottedText>
            <Trans>占用保证金</Trans>
          </TooltipTriggerDottedText>
        </GeneralTooltip>
      ),

      value: BNumber.toFormatNumber(1000, {
        unit: 'USDC',
        volScale: 2,
      }),
    },
    {
      label: (
        <GeneralTooltip content={<Trans>未结盈亏</Trans>}>
          <TooltipTriggerDottedText>
            <Trans>未结盈亏</Trans>
          </TooltipTriggerDottedText>
        </GeneralTooltip>
      ),
      value: BNumber.toFormatNumber(1000, {
        unit: 'USDC',
        volScale: 2,
      }),
    },
    {
      label: (
        <GeneralTooltip content={<Trans>保证金比例</Trans>}>
          <TooltipTriggerDottedText>
            <Trans>保证金比例</Trans>
          </TooltipTriggerDottedText>
        </GeneralTooltip>
      ),
      value: BNumber.toFormatPercent(10),
    },
  ]

  return (
    <div className="rounded-4 bg-primary flex h-full flex-col gap-3 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-important-1">
          <Trans>账户详情</Trans>
        </div>

        <div className="flex gap-3">
          <div>
            <Button variant="outline" size="sm" color="default">
              取现
            </Button>
          </div>
          <div>
            <Button variant="primary" size="sm" color="primary">
              存款
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {options.map((item, i) => (
          <div key={i} className="text-paragraph-p3 flex items-center justify-between gap-2">
            <div className="text-content-4">{item.label}</div>
            <div className="text-content-1">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
