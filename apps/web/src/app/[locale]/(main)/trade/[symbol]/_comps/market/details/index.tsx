import { Trans } from '@lingui/react/macro'
import { useTheme } from 'ahooks'

import { transferWeekDay } from '@/v1/constants/enum'
import { useCurrentQuote } from '@/v1/hooks/useCurrentQuote'
import { useStores } from '@/v1/provider/mobxProvider'
import { formatTimeStr } from '@/v1/utils/business'
import { cn } from '@mullet/ui/lib/utils'
import { renderFallback } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'

// import { useCurrentQuote } from '@/hooks/useCurrentQuote'
// import { useStores } from '@/context/mobxProvider'
// import { transferWeekDay } from '@/constants/enum'
// import { formatTimeStr } from '@/utils/business'
// import SymbolIcon from '@/components/Base/SymbolIcon'
// import { renderFallback } from '@/libs/utils/format/fallback'

export const MarketDetails = () => {
  const { trade, ws } = useStores()
  const symbol = trade.activeSymbolName
  const activeSymbolInfo = trade.activeSymbolInfo
  const quoteInfo = useCurrentQuote(symbol)
  const tradeTimeConf = quoteInfo?.tradeTimeConf as any[]
  const symbolConf = quoteInfo?.symbolConf
  const holdingCostConf = quoteInfo?.holdingCostConf
  const prepaymentConf = quoteInfo?.prepaymentConf
  const marginMode = prepaymentConf?.mode // 保证金模式
  const showPencent = holdingCostConf?.type !== 'pointMode' // 以百分比模式

  const contractRules: { label: React.ReactNode; value: React.ReactNode | string | number }[] = [
    {
      label: <Trans>合约单位</Trans>,
      value: symbolConf?.contractSize,
    },
    {
      label: <Trans>合约单笔最小</Trans>,
      value: BNumber.toFormatNumber(undefined, { volScale: 2, unit: 'USDC' }),
    },
    {
      label: <Trans>报价小数位</Trans>,
      value: quoteInfo?.digits,
    },
    {
      label: <Trans>开仓费率</Trans>,
      value: BNumber.toFormatPercent(undefined, { volScale: undefined }),
    },
    {
      label: <Trans>买入展期费率</Trans>,
      value: BNumber.toFormatPercent(undefined, { volScale: undefined }),
    },
    {
      label: <Trans>平仓费率</Trans>,
      value: BNumber.toFormatPercent(undefined, { volScale: undefined }),
    },
  ]

  let tradeTime = undefined
  if (!!tradeTimeConf?.length) {
    contractRules.push({
      label: <Trans>交易时间</Trans>,
      value: (
        <div className="text-right">
          {tradeTimeConf.map((item, index) => {
            return (
              <div key={index}>
                {transferWeekDay(item.weekDay)} {`${formatTimeStr(item.trade)}`}
              </div>
            )
          })}
        </div>
      ),
    })
  }

  const contractAttributes: { label: React.ReactNode; value: React.ReactNode | string | number }[] = [
    {
      label: <Trans>合约单位</Trans>,
      value: symbolConf?.contractSize,
    },
    {
      label: <Trans>货币单位</Trans>,
      value: symbolConf?.baseCurrency,
    },
    {
      label: <Trans>报价小数位</Trans>,
      value: quoteInfo?.digits,
    },
    {
      label: <Trans>单笔交易手数</Trans>,
      value: (
        <div>
          {BNumber.toFormatNumber(symbolConf?.minTrade, { volScale: 2 })}
          <Trans>手</Trans>-{BNumber.toFormatNumber(symbolConf?.maxTrade, { volScale: 2 })}
          <Trans>手</Trans>
        </div>
      ),
    },
    {
      label: <Trans>手数差值</Trans>,
      value: (
        <div>
          {BNumber.toFormatNumber(symbolConf?.tradeStep, { volScale: 2 })}
          <Trans>手</Trans>
        </div>
      ),
    },
    {
      label: <Trans>隔夜利息（多单）</Trans>,
      value: (
        <>
          {renderFallback(
            BNumber.toFormatPercent(holdingCostConf?.buyBag, {
              volScale: 2,
              isRaw: false,
              unit: showPencent ? '%' : undefined,
            }),
            {
              verify: holdingCostConf?.isEnable,
            },
          )}
        </>
      ),
    },
    {
      label: <Trans>隔夜利息（空单）</Trans>,
      value: (
        <>
          {renderFallback(
            BNumber.toFormatPercent(holdingCostConf?.sellBag, {
              volScale: 2,
              isRaw: false,
              unit: showPencent ? '%' : undefined,
            }),
            {
              verify: holdingCostConf?.isEnable,
            },
          )}
        </>
      ),
    },
    {
      label: <Trans>现价k和停损距离</Trans>,
      value: symbolConf?.limitStopLevel,
    },
    // 保证金-固定保证金模式
    ...(marginMode === 'fixed_margin'
      ? [
          {
            label: <Trans>初始保证金</Trans>,
            value: (
              <>
                {BNumber.toFormatNumber(prepaymentConf?.fixed_margin?.initial_margin, {
                  volScale: 2,
                  unit: symbolConf?.prepaymentCurrency,
                })}
                /<Trans>手</Trans>
              </>
            ),
          },
          {
            label: <Trans>开仓保证金</Trans>,
            value: (
              <>
                {!prepaymentConf?.fixed_margin?.locked_position_margin ? (
                  <Trans>收取单边最大</Trans>
                ) : (
                  <>
                    {(prepaymentConf?.fixed_margin?.locked_position_margin || 0).toFixed(2)}{' '}
                    {symbolConf?.prepaymentCurrency}/<Trans>手</Trans>
                  </>
                )}
              </>
            ),
          },
        ]
      : []),
  ]

  return (
    <div className="relative h-full">
      <div className="relative z-10">
        <div className={cn('p-xl gap-xl flex flex-col')}>
          <div className={cn('text-important-1 text-content-1')}>
            <Trans>合约属性</Trans>
          </div>
          <div className={cn('gap-y-xl grid grid-cols-4 grid-rows-[repeat(3,fit-content(100%))] gap-x-10')}>
            {contractAttributes.map((item, index) => {
              return (
                <div key={index} className="gap-small flex flex-col">
                  <div className={cn('text-content-1 text-paragraph-p1')}>{item.value}</div>
                  <div className={cn('text-content-4 text-paragraph-p3')}>{item.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {!!tradeTimeConf?.length && (
          <div className={cn('p-xl gap-xl flex flex-col')}>
            <div className={cn('text-important-1 text-content-1')}>
              <Trans>交易时间（GMT+8）</Trans>
            </div>
            <div className={cn('gap-y-xl grid grid-cols-3 grid-rows-[repeat(3,fit-content(100%))] gap-x-10')}>
              {tradeTimeConf.map((item, index) => {
                return (
                  <div key={index} className="gap-small flex justify-between">
                    <div className={cn('text-content-4 text-paragraph-p1')}>{transferWeekDay(item.weekDay)}</div>
                    <div className={cn('text-content-4 text-paragraph-p1')}>{formatTimeStr(item.trade)}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* <div className={cn('flex flex-col gap-2 p-3')}>
        <div className="text-important-1 flex items-center gap-2">
          <div className="size-6 rounded-full ">
            <SymbolIcon src={activeSymbolInfo?.imgUrl} width={24} height={24} className="size-6 rounded-full" />
          </div>
          <div>{symbol}</div>
        </div>

        <div className="text-paragraph-p3">
          <div> {activeSymbolInfo.remark}</div>

          <Trans>
            Solana
            是一种高性能的区块链平台，致力于为去中心化应用和加密货币提供快速、安全和可扩展的解决方案。该平台采用了创新的共识算法——Proof of
            History (PoH)，可以处理高达数万笔交易每秒 (TPS)，同时保持了去中心化和安全性。总的来说，Solana
            的目标是通过其独特的技术优势，实现区块链的大规模采用，服务于各种复杂的去中心化应用和全球金融系统。
          </Trans>
        </div>
      </div> */}

      {/* <div className="flex flex-col gap-2 p-3">
        <div className="text-important-1">市场详情</div>

        <div className="grid grid-cols-2 gap-x-16 gap-y-2">
          {marketDetails.map((rule, index) => {
            return (
              <div key={index} className="text-paragraph-p3 flex justify-between gap-2">
                <div className="text-content-4">{rule.label}</div>
                <div className="text-content-1">{rule.value}</div>
              </div>
            )
          })}
        </div>
      </div> */}

      {/* <div className="flex flex-col gap-2 p-3">
        <div className="text-important-1">合约规则</div>

        <div className="grid grid-cols-2 gap-x-16 gap-y-2">
          {contractRules.map((rule, i) => {
            return (
              <div key={i} className="text-paragraph-p3 flex justify-between gap-2">
                <div className="text-content-4">{rule.label}</div>
                <div className="text-content-1">{rule.value}</div>
              </div>
            )
          })}
        </div>
      </div> */}
    </div>
  )
}
