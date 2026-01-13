'use client'

import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'

import { GeneralTooltip } from '@/components/tooltip/general'
import { useCurrentQuote } from '@/v1/hooks/useCurrentQuote'
import { useStores } from '@/v1/provider/mobxProvider'
import { cn } from '@mullet/ui/lib/utils'
import { TooltipTriggerDottedText } from '@mullet/ui/tooltip'
import { BNumber } from '@mullet/utils/number'

import { SymbolSelector } from './symbol-selector'

export function Overview() {
  return (
    <div className="bg-primary flex h-full items-center gap-6 rounded-lg px-3">
      <div className="flex items-center gap-5">
        <SymbolSelector />

        <CurrentPrice />
      </div>
      <div className="border-zinc-large h-4 border-r"></div>
      <DataOverview />
    </div>
  )
}

const CurrentPrice = observer(() => {
  const res = useCurrentQuote()
  const { ws, trade } = useStores()
  const symbol = trade.activeSymbolName

  const isPriceChangePositive = BNumber.from(res?.percent)?.gt(0)
  const isMarketOpen = trade.isMarketOpen(symbol)

  return (
    <div className="flex items-center">
      <div
        className={cn('text-[24px] font-bold', {
          'text-market-rise': isPriceChangePositive,
          'text-market-fall': !isPriceChangePositive,
        })}
      >
        {BNumber.toFormatNumber(res?.bid, { volScale: 2 })}
      </div>

      {!isMarketOpen && (
        <span className="dark:text-red-650 dark:bg-red-650/10 ml-2 rounded-[6px] bg-red-600/10 px-[6px] text-sm leading-6 text-red-600">
          <Trans>休市中</Trans>
        </span>
      )}
    </div>
  )
})

const DataOverview = observer(() => {
  const res = useCurrentQuote()

  const isPriceChangePositive = BNumber.from(res?.percent)?.gt(0)

  // const closePriceDiff = BNumber.from(res?.close).minus(res?.open)
  // const isClosePriceChangeState = closePriceDiff?.gt(0) ? 'up' : closePriceDiff?.lt(0) ? 'down' : 'same'

  const options = [
    {
      label: <Trans>涨跌幅</Trans>,
      value: (
        <div
          className={cn('', {
            'text-market-rise': isPriceChangePositive,
            'text-market-fall': !isPriceChangePositive,
          })}
        >
          {BNumber.toFormatPercent(res?.percent, { forceSign: true, isRaw: false })}
        </div>
      ),
    },
    {
      label: <Trans>开盘价</Trans>,
      value: BNumber.toFormatNumber(res?.open, { volScale: undefined }),
    },
    {
      label: <Trans>收盘价</Trans>,
      value: (
        <div
          className={
            cn()
            // isClosePriceChangeState === 'up'
            //   ? 'text-market-rise'
            //   : isClosePriceChangeState === 'down'
            //   ? 'text-market-fall'
            //   : 'text-content-1'
          }
        >
          {BNumber.toFormatNumber(res?.close, { volScale: undefined })}
        </div>
      ),
    },
    {
      label: <Trans>24小时最高价</Trans>,
      value: BNumber.toFormatNumber(res?.high, { volScale: undefined }),
    },
    {
      label: <Trans>24小时最低价</Trans>,
      value: BNumber.toFormatNumber(res?.low, { volScale: undefined }),
    },
    // {
    //   label: (
    //     <GeneralTooltip content={<Trans>需要提供提示文本</Trans>}>
    //       <TooltipTriggerDottedText>
    //         <Trans>24小时交易量</Trans>
    //       </TooltipTriggerDottedText>
    //     </GeneralTooltip>
    //   ),
    //   value: BNumber.toFormatNumber(undefined, { volScale: 2, prefix: '$' })
    // },
    // {
    //   label: (
    //     <GeneralTooltip
    //       content={
    //         <Trans>
    //           展期费是指您在每日结算时为继续持有未平仓合约而支付的费用，计算方式为“持仓名义价值 ×
    //           日费率”，平台将在每日自动扣除，请您注意账户余额充足以避免持仓受影响。
    //         </Trans>
    //       }
    //     >
    //       <TooltipTriggerDottedText>
    //         <Trans>展期费率</Trans>
    //       </TooltipTriggerDottedText>
    //     </GeneralTooltip>
    //   ),
    //   value: (
    //     <div>
    //       {BNumber.toFormatPercent(undefined, { forceSign: true, volScale: undefined, isRaw: false })} /{' '}
    //       {BNumber.toFormatPercent(undefined, { volScale: undefined, isRaw: false })}
    //     </div>
    //   )
    // },

    // {
    //   label: (
    //     <GeneralTooltip content={<Trans>需要提供提示文本</Trans>}>
    //       <TooltipTriggerDottedText>
    //         <Trans>持仓量</Trans>
    //       </TooltipTriggerDottedText>
    //     </GeneralTooltip>
    //   ),
    //   value: BNumber.toFormatNumber(undefined, { unit: 'SOL', volScale: 2 })
    // }
  ]
  return (
    <div className="flex gap-6">
      {options.map((item, index) => (
        <div key={index} className="text-paragraph-p3 flex flex-col gap-1">
          <div className="text-content-4">{item.label}</div>
          <div className="text-content-1">{item.value}</div>
        </div>
      ))}
    </div>
  )
})
