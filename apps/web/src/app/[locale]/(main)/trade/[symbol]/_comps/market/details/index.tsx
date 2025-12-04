import { Trans } from '@lingui/react/macro'

import { cn } from '@mullet/ui/lib/utils'
import { BNumber } from '@mullet/utils/number'

export const MarketDetails = () => {
  const marketDetails = [
    {
      label: <Trans>多头未平仓合约</Trans>,
      value: BNumber.toFormatNumber(452, { volScale: 2, unit: 'SOL' }),
    },
    {
      label: <Trans>累计交易量</Trans>,
      value: BNumber.toFormatNumber(452, { volScale: 2, unit: 'SOL' }),
    },
    {
      label: <Trans>空头未平仓合约</Trans>,
      value: BNumber.toFormatNumber(452, { volScale: 2, unit: 'SOL' }),
    },
  ]

  const contractRules = [
    {
      label: <Trans>合约单位</Trans>,
      value: '200',
    },
    {
      label: <Trans>合约单笔最小</Trans>,
      value: BNumber.toFormatNumber(200, { volScale: 2, unit: 'USDC' }),
    },
    {
      label: <Trans>报价小数位</Trans>,
      value: 5,
    },
    {
      label: <Trans>开仓费率</Trans>,
      value: BNumber.toFormatPercent(0.0005, { volScale: undefined }),
    },
    {
      label: <Trans>买入展期费率</Trans>,
      value: BNumber.toFormatPercent(0.000052, { volScale: undefined }),
    },
    {
      label: <Trans>平仓费率</Trans>,
      value: BNumber.toFormatPercent(0.0005, { volScale: undefined }),
    },
    {
      label: <Trans>交易时间</Trans>,
      value: (
        <div className="text-right">
          週一 06:00-24:00
          <br />
          週二 00:00-04:55,06:00-24:00
          <br />
          週三 00:00-04:55,06:00-24:00
          <br />
          週四 00:00-04:55,06:00-24:00
          <br />
          週五 00:00-04:55,06:00-24:00
          <br />
          週六 00:00-04:55
          <br />
          週日 00:00-00:00
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className={cn('flex flex-col gap-2 p-3')}>
        <div className="text-important-1 flex items-center gap-2">
          <div className="size-6 rounded-full bg-white"></div>
          <div>SOL-USD</div>
        </div>

        <div className="text-paragraph-p3">
          <Trans>
            Solana
            是一种高性能的区块链平台，致力于为去中心化应用和加密货币提供快速、安全和可扩展的解决方案。该平台采用了创新的共识算法——Proof
            of History (PoH)，可以处理高达数万笔交易每秒 (TPS)，同时保持了去中心化和安全性。总的来说，Solana
            的目标是通过其独特的技术优势，实现区块链的大规模采用，服务于各种复杂的去中心化应用和全球金融系统。
          </Trans>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3">
        <div className="text-important-1">市场详情</div>

        <div className="grid grid-cols-2 gap-x-16 gap-y-2">
          {marketDetails.map((rule) => {
            return (
              <div className="text-paragraph-p3 flex justify-between gap-2">
                <div className="text-content-4">{rule.label}</div>
                <div className="text-content-1">{rule.value}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3">
        <div className="text-important-1">合约规则</div>

        <div className="grid grid-cols-2 gap-x-16 gap-y-2">
          {contractRules.map((rule) => {
            return (
              <div className="text-paragraph-p3 flex justify-between gap-2">
                <div className="text-content-4">{rule.label}</div>
                <div className="text-content-1">{rule.value}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
