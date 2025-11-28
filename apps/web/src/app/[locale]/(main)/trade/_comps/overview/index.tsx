'use client'

import { Trans } from '@lingui/react/macro'

import { GeneralTooltip } from '@/components/tooltip/general'
import { cn } from '@mullet/ui/lib/utils'
import { BNumber } from '@mullet/utils/number'

import { SymbolSelector } from './symbol-selector'

export function Overview() {
  return (
    <div className="bg-primary flex h-full items-center gap-6 rounded-lg px-3">
      <div className="flex items-center gap-5">
        <SymbolSelector />

        <CurrentPrice />
      </div>
      <div className="border-large h-4 border-r"></div>
      <DataOverview />
    </div>
  )
}

const CurrentPrice = () => {
  const oldPrice = 183.52
  const price = 184.52
  const isPriceChangePositive = price > oldPrice
  return (
    <div
      className={cn('text-[24px] font-bold', {
        'text-market-rise': isPriceChangePositive,
        'text-market-fall': !isPriceChangePositive,
      })}
    >
      {BNumber.toFormatNumber(price, { volScale: 2 })}
    </div>
  )
}

const DataOverview = () => {
  const mockData = {
    oraclePrice: 183.52,
    priceChange: -6.34,
    priceChangePercentage: -0.108,
    lowestPrice: 183.52,
    highestPrice: 183.52,
  }
  const isPriceChangePositive = mockData.priceChange > 0
  const options = [
    {
      label: <Trans>预言机价格</Trans>,
      value: BNumber.toFormatNumber(183.52),
    },
    {
      label: <Trans>24 小时变化</Trans>,
      value: (
        <div
          className={cn('', {
            'text-market-rise': isPriceChangePositive,
            'text-market-fall': !isPriceChangePositive,
          })}
        >
          {BNumber.toFormatNumber(mockData.priceChange, { forceSign: true, positive: false })} /{' '}
          {BNumber.toFormatPercent(mockData.priceChangePercentage, { forceSign: true })}
        </div>
      ),
    },
    {
      label: <Trans>24小时最高价</Trans>,
      value: BNumber.toFormatNumber(187, { volScale: 2 }),
    },
    {
      label: <Trans>24小时最低价</Trans>,
      value: BNumber.toFormatNumber(201, { volScale: 2 }),
    },
    {
      label: (
        <GeneralTooltip side="top" content="24小时交易量">
          <span>
            <Trans>24小时交易量</Trans>
          </span>
        </GeneralTooltip>
      ),
      value: BNumber.toFormatNumber(613428511.36, { volScale: 2, prefix: '$' }),
    },
    {
      label: (
        <GeneralTooltip
          side="top"
          content={
            <Trans>
              展期费是指您在每日结算时为继续持有未平仓合约而支付的费用，计算方式为“持仓名义价值 ×
              日费率”，平台将在每日自动扣除，请您注意账户余额充足以避免持仓受影响。
            </Trans>
          }
        >
          <span>
            <Trans>展期费率</Trans>
          </span>
        </GeneralTooltip>
      ),
      value: (
        <div>
          {BNumber.toFormatPercent(0.000001, { forceSign: true, volScale: undefined })} /{' '}
          {BNumber.toFormatPercent(0.000002, { volScale: undefined })}
        </div>
      ),
    },

    {
      label: (
        <GeneralTooltip side="top" content="24小时交易量">
          <span>
            <Trans>持仓量</Trans>
          </span>
        </GeneralTooltip>
      ),
      value: BNumber.toFormatNumber(154, { unit: 'SOL', volScale: 2 }),
    },
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
}
