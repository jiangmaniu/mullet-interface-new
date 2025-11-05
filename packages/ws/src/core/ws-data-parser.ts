import { MarketData, SubscriptionType } from './types'

export const parseWSData = (type: SubscriptionType, data: string) => {
  switch (type) {
    case SubscriptionType.MARKET_DATA:
      return handleParseMarketData(data)
    // case SubscriptionType.MARKET_DEPTH:
    //   return JSON.parse(data) as T
    // case SubscriptionType.ANNOUNCEMENT:
    //   return JSON.parse(data) as T
    // case SubscriptionType.TRADE:
    //   return JSON.parse(data) as T
  }
}

const handleParseMarketData = (data: string) => {
  const [timestamp, buy, buySize, sell, sellSize, dataSource, symbol, accountGroupId] = data.split(',')

  return {
    key: symbol,
  }
}
