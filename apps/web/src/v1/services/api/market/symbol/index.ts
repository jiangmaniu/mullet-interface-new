import { request } from '@/v1/utils/request'

// 产品K线数据-分页
export async function getSymbolKlineList(params?: API.PageParam) {
  return request<API.Response<API.PageResult<MarketSymbol.SymbolKlineListItem>>>(
    '/api/trade-market/marketApi/symbol/klineList',
    {
      method: 'GET',
      params,
    },
  )
}

// 产品K线数据-分页-new
export async function getSymbolKlineOptimizeList(params?: API.PageParam) {
  return request<API.Response<API.PageResult<MarketSymbol.SymbolKlineOptimizeListItem>>>(
    '/api/trade-market/marketApi/public/symbol/optimizeKlineList',
    {
      method: 'GET',
      params,
    },
  )
}

// 产品实时报价-分页 成交报价
export async function getSymbolPriceList(params?: API.PageParam & { priceValueId: any }) {
  return request<API.Response<API.PageResult<MarketSymbol.SymbolPriceListItem>>>(
    '/api/trade-market/marketApi/symbol/priceList',
    {
      method: 'GET',
      params,
    },
  )
}

// 单个接口获取品种高开低收信息
export async function getSymbolPriceInfo(params: { dataSourceCode: any; dataSourceSymbol: any }) {
  return request<API.Response<Account.SymbolNewTicker>>(
    `/api/trade-market/marketApi/public/symbol/newTicker/${params.dataSourceCode}/${params.dataSourceSymbol}`,
    {
      method: 'GET',
      params,
    },
  )
}

// 点击品种获取产品最新Ticker 高开低收信息
export async function getSymbolTicker(params: { symbol: any }) {
  return request<API.Response<MarketSymbol.SymbolNewTicker>>(
    `/api/trade-market/marketApi/kline/symbol/newTicker/${params.symbol}`,
    {
      method: 'GET',
      params,
    },
  )
}
