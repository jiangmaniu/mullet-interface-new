import { observer } from 'mobx-react'

import { Trans } from '@/components/t'
import { GeneralTooltip } from '@/components/tooltip/general'
import SymbolIcon from '@/v1/components/Base/SymbolIcon'
import { useCurrentQuote } from '@/v1/hooks/useCurrentQuote'
import { useStores } from '@/v1/provider/mobxProvider'
import { IconButton } from '@mullet/ui/button'
import { Iconify } from '@mullet/ui/icons'
import { cn } from '@mullet/ui/utils'
import { BNumber } from '@mullet/utils/number'

export const symbolColumns: {
  key: string
  header: React.ReactNode
  cell: (symbolItem: Account.TradeSymbolListItem) => React.ReactNode
}[] = [
  {
    key: 'symbol',
    header: (
      <div className="w-[40%]">
        <Trans>交易对</Trans>
      </div>
    ),
    cell: (symbolItem) => {
      return (
        <div className="w-[40%]">
          <SymbolInfo symbolInfo={symbolItem} />
        </div>
      )
    },
  },

  {
    key: 'buyPrice',
    header: (
      <div className="w-[20%]">
        <Trans>买价</Trans>
      </div>
    ),
    cell: (symbolInfo) => {
      return (
        <div className="w-[20%]">
          <SymbolBidPrice symbolInfo={symbolInfo} />
        </div>
      )
    },
  },

  {
    key: 'sellPrice',
    header: (
      <div className="w-[20%]">
        <Trans>卖价</Trans>
      </div>
    ),
    cell: (symbolInfo) => {
      return (
        <div className="w-[20%]">
          <SymbolAskPrice symbolInfo={symbolInfo} />
        </div>
      )
    },
  },

  {
    key: 'h24Change',
    header: (
      <div className="w-[20%]">
        <Trans>涨跌幅</Trans>
      </div>
    ),
    cell: (symbolInfo) => {
      return (
        <div className="w-[20%]">
          <H24Change symbolInfo={symbolInfo} />
        </div>
      )
    },
  },
  // {
  //   key: 'h24Change',
  //   header: <Trans>24H 涨幅</Trans>,
  //   cell: (symbolInfo) => {
  //     return <H24Change symbolInfo={symbolInfo} />
  //   }
  // }
  // {
  //   key: 'volume',
  //   header: <Trans>交易量</Trans>,
  //   cell: () => {
  //     return <div>{BNumber.toFormatNumber(undefined, { volScale: 2, prefix: '$' })}</div>
  //   }
  // },
  // {
  //   key: 'openInterest',
  //   header: <Trans>未平仓合约</Trans>,
  //   cell: () => {
  //     return <div>{BNumber.toFormatNumber(undefined, { unit: 'SOL', volScale: 2 })}</div>
  //   }
  // },
  // {
  //   key: 'holdingCostRate',
  //   header: <Trans>展期费率</Trans>,
  //   cell: () => {
  //     return (
  //       <div>
  //         {BNumber.toFormatPercent(undefined, { forceSign: true, volScale: undefined, isRaw: false })} /{' '}
  //         {BNumber.toFormatPercent(undefined, { volScale: undefined, isRaw: false })}
  //       </div>
  //     )
  //   }
  // }
]

const SymbolAskPrice = observer(({ symbolInfo }: { symbolInfo: Account.TradeSymbolListItem }) => {
  const res = useCurrentQuote(symbolInfo.symbol)
  const askDiff = BNumber.from(res?.askDiff)
  return (
    <div className={cn(askDiff?.gt(0) ? 'text-market-rise' : askDiff?.lt(0) ? 'text-market-fall' : 'text-content-1')}>
      {BNumber.toFormatNumber(res?.ask, { volScale: undefined })}
    </div>
  )
})

const SymbolBidPrice = observer(({ symbolInfo }: { symbolInfo: Account.TradeSymbolListItem }) => {
  const res = useCurrentQuote(symbolInfo.symbol)
  const bidDiff = BNumber.from(res?.bidDiff)
  return (
    <div className={cn(bidDiff?.gt(0) ? 'text-market-rise' : bidDiff?.lt(0) ? 'text-market-fall' : 'text-content-1')}>
      {BNumber.toFormatNumber(res?.bid, { volScale: undefined })}
    </div>
  )
})

const H24Change = observer(({ symbolInfo }: { symbolInfo: Account.TradeSymbolListItem }) => {
  const res = useCurrentQuote(symbolInfo.symbol)
  const percent = BNumber.from(res?.percent)

  return (
    <div
      className={cn(
        'text-paragraph-p2 text-content-1',
        cn(percent?.gt(0) ? 'text-market-rise' : percent?.lt(0) ? 'text-market-fall' : 'text-content-1'),
      )}
    >
      {BNumber.toFormatPercent(percent, { forceSign: true, isRaw: false })}
    </div>
  )
})

const SymbolInfo = observer(({ symbolInfo }: { symbolInfo: Account.TradeSymbolListItem }) => {
  const { trade } = useStores()
  const isFavorite = trade.favoriteList.some((item) => item.symbol === symbolInfo.symbol)

  return (
    <div className="flex items-center gap-2">
      {/* <GeneralTooltip isDisabledCursorHelp align="center" content={isFavorite ? '移除自选' : '添加自选'}> */}
      <div>
        <Iconify
          onClick={(e) => {
            trade.toggleSymbolFavorite(symbolInfo.symbol)
            e.stopPropagation()
          }}
          icon="iconoir:star"
          className={cn(
            'block size-3.5 cursor-pointer select-none',
            isFavorite ? 'text-brand-primary' : 'text-brand-secondary-1',
            {},
          )}
        />
      </div>
      {/* </GeneralTooltip> */}

      <div className="size-3.5 rounded-full">
        <SymbolIcon src={symbolInfo?.imgUrl} width={14} height={14} className="size-3.5 rounded-full" />
      </div>

      <GeneralTooltip isDisabledCursorHelp align="center" content={symbolInfo.remark}>
        <div className="text-paragraph-p2 text-content-1">{symbolInfo.alias}</div>
      </GeneralTooltip>

      {/* {['fixed_margin', 'fixed_leverage', 'float_leverage'].includes(symbolInfo.symbolConf?.prepaymentConf?.mode || '') && (
        <div className="text-paragraph-p3 max-w-25 min-w-8 h-5 p-1 flex justify-center items-center rounded-xs bg-button text-content-1">
          <>
            {symbolInfo.symbolConf?.prepaymentConf?.mode === 'fixed_margin' ? (
              <Trans>固定预付款</Trans>
            ) : symbolInfo.symbolConf?.prepaymentConf?.mode === 'fixed_leverage' ? (
              <>{symbolInfo.symbolConf?.prepaymentConf?.fixed_leverage?.leverage_multiple}x</>
            ) : symbolInfo.symbolConf?.prepaymentConf?.mode === 'float_leverage' ? (
              <>{symbolInfo.symbolConf?.prepaymentConf.float_leverage?.max_lever}x</>
            ) : null}
          </>
        </div>
      )} */}
    </div>
  )
})
