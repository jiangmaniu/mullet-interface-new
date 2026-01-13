import { Trans } from '@lingui/react/macro'

export enum TradeMarginMode {
  CROSS_MARGIN = 'CROSS_MARGIN',
  ISOLATED_MARGIN = 'ISOLATED_MARGIN',
}

export type TradeMarginModeOption = {
  label: React.ReactNode
  description: React.ReactNode
  value: TradeMarginMode
}

export const TRADE_MARGIN_MODE_OPTIONS: TradeMarginModeOption[] = [
  {
    label: <Trans>全仓</Trans>,
    description: (
      <Trans>
        账户内全部可用资金都会作为保证金共同承担风险。当某个仓位出现亏损时，可调用账户内的剩余资金来支撑，降低被强平的可能，但同时也可能牵连其他仓位。
      </Trans>
    ),
    value: TradeMarginMode.CROSS_MARGIN,
  },
  {
    label: <Trans>逐仓</Trans>,
    description: (
      <Trans>
        每个仓位独立计算保证金和风险。若某个仓位亏损至保证金不足，将单独触发强平，不会影响账户内的其他仓位。
      </Trans>
    ),
    value: TradeMarginMode.ISOLATED_MARGIN,
  },
]

export const TRADE_MARGIN_MODE_MAP: Record<TradeMarginMode, TradeMarginModeOption> = TRADE_MARGIN_MODE_OPTIONS.reduce(
  (map, option) => {
    map[option.value] = option
    return map
  },
  {} as Record<TradeMarginMode, TradeMarginModeOption>,
)
