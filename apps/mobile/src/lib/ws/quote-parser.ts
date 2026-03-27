import type { IQuoteItem, IDepth } from './types'

/**
 * 解析行情 body 数据
 * 格式：id,buy,buySize,sell,sellSize,dataSource,symbol,accountGroupId
 */
export const parseQuoteBodyData = (body: string): IQuoteItem => {
  const quoteItem = {} as IQuoteItem
  if (body && typeof body === 'string') {
    const [id, buy, buySize, sell, sellSize, dataSource, symbol, accountGroupId] = body.split(',')
    const [dataSourceCode, dataSourceSymbol] = String(dataSource || '')
      .split('-')
      .filter((v: any) => v)
    const sbl = symbol === '0' ? dataSourceSymbol : symbol
    const dataSourceKey = Number(accountGroupId) ? `${accountGroupId}/${sbl}` : `${dataSourceCode}/${sbl}`

    quoteItem.symbol = sbl
    quoteItem.dataSource = dataSource
    quoteItem.dataSourceKey = dataSourceKey
    quoteItem.accountGroupId = accountGroupId
    quoteItem.priceData = {
      sellSize: Number(sellSize || 0),
      buy: Number(buy || 0),
      sell: Number(sell || 0),
      id: Number(id || 0),
      buySize: Number(buySize || 0),
    }
  }
  return quoteItem
}

/**
 * 解析深度 body 数据
 * 格式：asks(price*amount;price*amount;...),bids(...),dataSource,symbol,accountGroupId,ts
 */
export const parseDepthBodyData = (body: string): IDepth => {
  const depthData = {} as IDepth
  if (body && typeof body === 'string') {
    const [asks, bids, dataSource, symbol, accountGroupId, ts] = body.split(',')
    const [dataSourceCode, dataSourceSymbol] = (dataSource || '').split('-').filter((v: any) => v)
    const sbl = symbol || dataSourceSymbol
    const dataSourceKey = Number(accountGroupId) ? `${accountGroupId}/${sbl}` : `${dataSourceCode}/${sbl}`
    depthData.symbol = sbl
    depthData.dataSource = dataSource
    depthData.dataSourceKey = dataSourceKey
    depthData.accountGroupId = accountGroupId
    depthData.ts = Number(ts || 0)

    const parseItems = (str: string) =>
      str
        ? str.split(';').map((item) => {
            const [price, amount] = (item || '').split('*')
            return { price: Number(price || 0), amount: Number(amount || 0) }
          })
        : []

    depthData.asks = parseItems(asks)
    depthData.bids = parseItems(bids)
  }
  return depthData
}
