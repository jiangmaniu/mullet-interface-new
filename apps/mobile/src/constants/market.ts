// 热门交易品种列表
export const HOT_SYMBOL_LIST = ['SOL', 'XAUUSD', 'BTC', 'ETH', 'EURUSD', 'EURJPY', 'USDJPY'] as const

export type HotSymbol = (typeof HOT_SYMBOL_LIST)[number]

// Market Overview 展示的品种列表
export const MARKET_OVERVIEW_SYMBOL_LIST = ['EURUSD', 'XAUUSD', 'NAS100', 'HK50', 'BTC'] as const

export type MarketOverviewSymbol = (typeof MARKET_OVERVIEW_SYMBOL_LIST)[number]
