import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react'
import { useState } from 'react'

import { GeneralTooltip } from '@/components/tooltip/general'
import { NumberInput, NumberInputSourceType } from '@/libs/ui/components/number-input'
import { SliderTooltip } from '@/libs/ui/components/slider-tooltip'
import { TooltipTriggerDottedText } from '@/libs/ui/components/tooltip'
import { BNumber } from '@/libs/utils/number'

export const TradeActionPanelOrderCollateral = observer(() => {
  const [accountPercent, setAccountPercent] = useState('')

  return (
    <>
      {/* 保证金 */}
      <div className={'gap-medium flex flex-col'}>
        <NumberInput placeholder="0.00" />

        <div className={'flex items-center justify-between gap-2'}>
          <div>
            <GeneralTooltip content={<Trans>可用保证金</Trans>}>
              <TooltipTriggerDottedText>
                <Trans>可用保证金</Trans>
              </TooltipTriggerDottedText>
            </GeneralTooltip>
          </div>
          <div className={'text-content-1 text-paragraph-p3'}>
            {BNumber.toFormatNumber(1000, { unit: 'USDC', volScale: 2 })}
          </div>
        </div>
      </div>

      <div className={'gap-xl flex items-center'}>
        <SliderTooltip
          className="flex-1"
          min={0}
          step={1}
          max={100}
          tooltipFormat={([value]) => {
            return <div className="text-white">{value}%</div>
          }}
          // isShowMarkLabels
          isShowMarks
          interval={100 / 4}
          value={[BNumber.from(accountPercent).toNumber()]}
          onValueChange={(val) => {
            setAccountPercent(val[0]!.toString())
          }}
        />

        <NumberInput
          className={'w-[80px]'}
          value={accountPercent}
          onValueChange={({ value }, { source }) => {
            if (source === NumberInputSourceType.EVENT) {
              setAccountPercent(value)
            }
          }}
          size={'sm'}
          placeholder={({ isFocused }) => {
            return <>{isFocused || accountPercent ? '数量' : '0 '}</>
          }}
          RightContent={'%'}
        />
      </div>
    </>
  )
})
