import qs from 'qs'

import { request } from '@/utils/request'

// 银行卡-分页
export async function getBankCardList(params?: API.PageParam & { clientId: any }) {
  return request<API.Response<API.PageResult<BankCard.ListItem>>>('/api/trade-crm/crmApi/bankCard/list', {
    method: 'GET',
    params
  })
}

// 银行卡-详情
export async function getBankCardDetail(params: API.IdParam) {
  return request<API.Response<BankCard.ListItem>>('/api/trade-crm/crmApi/bankCard/detail', {
    method: 'GET',
    params
  })
}

// 银行卡-审核
export async function updateBankCard(body: BankCard.UpdateParams) {
  return request<API.Response>('/api/trade-crm/crmApi/bankCard/update', {
    method: 'POST',
    data: body
  })
}

// 银行卡-删除
export async function removeBankCard(body: API.IdParam) {
  return request<API.Response>(`/api/trade-crm/crmApi/bankCard/remove?${qs.stringify(body)}`, {
    method: 'POST'
  })
}
