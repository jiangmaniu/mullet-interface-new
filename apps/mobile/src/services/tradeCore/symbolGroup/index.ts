import qs from 'qs'

import { request } from '@/utils/request'

// 交易品种组-新增或修改
export async function submitSymbol(body: SymbolGroup.SubmitSymbolGroupParams) {
  return request<API.Response>('/api/trade-core/coreApi/symbolGroup/submit', {
    method: 'POST',
    data: body
  })
}

// 交易品种组-删除
export async function removeSymbolGroup(body: API.IdParam) {
  return request<API.Response>(`/api/trade-core/coreApi/symbolGroup/remove?${qs.stringify(body)}`, {
    method: 'POST'
  })
}

// 交易品种组-树形结构
export async function getSymbolGroupTree(params?: any) {
  return request<API.Response<SymbolGroup.SymbolGroupTreeItem[]>>('/api/trade-core/coreApi/symbolGroup/tree', {
    method: 'GET',
    params
  })
}
