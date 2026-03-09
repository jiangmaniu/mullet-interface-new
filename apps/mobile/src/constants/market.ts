// 热门交易品种列表
export const HOT_SYMBOL_LIST = ['SOL', 'XAUUSD', 'BTC', 'ETH', 'EURUSD', 'EURJPY', 'USDJPY'] as const

export type HotSymbol = (typeof HOT_SYMBOL_LIST)[number]
