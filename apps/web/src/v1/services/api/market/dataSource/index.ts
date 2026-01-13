import qs from 'qs'

import { request } from '@/utils/request'

// 行情数据源-全部
export async function getDataSourceAll() {
  return request<API.Response<DataSource.QuoteDataSourceItem>>('/api/trade-market/marketApi/dataSource/list', {
    method: 'GET'
  })
}

// 数据源产品-分页
export async function getDataSourceList(params?: API.PageParam & { dataSourceCode?: string; symbol?: string }) {
  return request<API.Response<API.PageResult<DataSource.SymbolListItem>>>('/api/trade-market/marketApi/symbol/symbolList', {
    method: 'GET',
    params
  })
}

// 行情数据源-启用/禁用
export async function switchDataSourceStatus(body: DataSource.SwitchDataSourceStatusParams) {
  return request<API.Response>(`/api/trade-market/marketApi/dataSource/status?${qs.stringify(body)}`, {
    method: 'POST'
  })
}
