export enum TradeLayoutKey {
  Tabs = 'tabs',
  Overview = 'overview',
  Tradingview = 'tradingview',
  Position = 'position',
  Orderbooks = 'orderbooks',
  Action = 'action',
  Account = 'account',
}

export interface TradeLayoutSlots {
  [TradeLayoutKey.Tabs]?: React.ReactNode
  [TradeLayoutKey.Overview]?: React.ReactNode
  [TradeLayoutKey.Tradingview]?: React.ReactNode
  [TradeLayoutKey.Position]?: React.ReactNode
  [TradeLayoutKey.Orderbooks]?: React.ReactNode
  [TradeLayoutKey.Action]?: React.ReactNode
  [TradeLayoutKey.Account]?: React.ReactNode
}
