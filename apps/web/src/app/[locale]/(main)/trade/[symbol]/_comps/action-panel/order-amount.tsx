import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react'
import { useState } from 'react'

import useTrade from '@/v1/hooks/useTrade'
import { useStores } from '@/v1/provider/mobxProvider'
import { NumberInput, NumberInputSourceType } from '@mullet/ui/number-input'

export const TradeActionPanelOrderAmount = observer(() => {
  const { trade } = useStores()
  const { disabledTrade, isBuy, orderVolume, vmax, vmaxShow, vmin, countPrecision, setOrderVolume, onAdd, onMinus } =
    useTrade()

  return (
    <div>
      <div className="gap-medium flex flex-col">
        <div className="text-paragraph-p3 flex items-center justify-between">
          <div className="text-content-4">{isBuy ? <Trans>买入手数</Trans> : <Trans>卖出手数</Trans>}</div>
          <div className="flex gap-1">
            <div className="text-content-4">
              <Trans>范围</Trans>
            </div>
            <div>
              {vmin}-{vmaxShow}
            </div>
          </div>
        </div>

        <NumberInput
          hideLabel
          decimalScale={2}
          min={vmin}
          max={vmax}
          value={orderVolume}
          placeholder="0.00"
          RightContent={<Trans>手</Trans>}
          labelText={<Trans>数量</Trans>}
          onValueChange={({ value }, { source }) => {
            if (source === NumberInputSourceType.EVENT) {
              setOrderVolume(value)
            }
          }}
          size={'md'}
        />
      </div>
    </div>
  )
})
