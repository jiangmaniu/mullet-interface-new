import { Trans } from '@lingui/react/macro'

export enum TradeOrderTypeEnum {
  MARKET = 'MARKET_ORDER',
  LIMIT = 'LIMIT_ORDER',
  STOP_LOSS = 'STOP_LIMIT_ORDER',
}

export type TradeOrderTypeOption = {
  label: React.ReactNode
  value: TradeOrderTypeEnum
}

export const TRADE_ORDER_TYPE_OPTIONS: TradeOrderTypeOption[] = [
  {
    label: <Trans>市价</Trans>,
    value: TradeOrderTypeEnum.MARKET,
  },
  {
    label: <Trans>限价</Trans>,
    value: TradeOrderTypeEnum.LIMIT,
  },
  {
    label: <Trans>停损</Trans>,
    value: TradeOrderTypeEnum.STOP_LOSS,
  },
]

export const TRADE_ORDER_TYPE_MAP: Record<TradeOrderTypeEnum, TradeOrderTypeOption> = TRADE_ORDER_TYPE_OPTIONS.reduce(
  (map, option) => {
    map[option.value] = option
    return map
  },
  {} as Record<TradeOrderTypeEnum, TradeOrderTypeOption>,
)

export enum TradeOrderDirectionEnum {
  BUY = 'BUY',
  SELL = 'SELL',
}

export type TradeOrderDirectionOption = {
  label: React.ReactNode
  value: TradeOrderDirectionEnum
}

export const TRADE_ORDER_DIRECTION_OPTIONS: TradeOrderDirectionOption[] = [
  {
    label: <Trans>买入/做多</Trans>,
    value: TradeOrderDirectionEnum.BUY,
  },
  {
    label: <Trans>卖出/做空</Trans>,
    value: TradeOrderDirectionEnum.SELL,
  },
]

export const TRADE_ORDER_DIRECTION_MAP: Record<TradeOrderDirectionEnum, TradeOrderDirectionOption> =
  TRADE_ORDER_DIRECTION_OPTIONS.reduce(
    (map, option) => {
      map[option.value] = option
      return map
    },
    {} as Record<TradeOrderDirectionEnum, TradeOrderDirectionOption>,
  )
