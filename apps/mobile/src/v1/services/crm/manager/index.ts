import qs from 'qs'

import { request } from '@/utils/request'

// 经理用户-新增
export async function addManager(body: Manager.AddOrEditParams) {
  return request<API.Response>('/api/trade-crm/crmApi/manager/submit', {
    method: 'POST',
    data: body
  })
}

// 经理用户-更新
export async function updateManager(body: Manager.AddOrEditParams) {
  return request<API.Response>('/api/trade-crm/crmApi/manager/update', {
    method: 'POST',
    data: body
  })
}

// 经理用户-分页
export async function getManagerList(params?: API.PageParam) {
  return request<API.Response<API.PageResult<Manager.ListItem>>>('/api/trade-crm/crmApi/manager/list', {
    method: 'GET',
    params
  })
}

// 经理用户-详情
export async function getManagerDetail(params: API.IdParam) {
  return request<API.Response<Manager.ListItem>>('/api/trade-crm/crmApi/manager/detail', {
    method: 'GET',
    params
  })
}

// 经理用户-删除
export async function removeManager(body: { ids: string }) {
  return request<API.Response>(`/api/trade-crm/crmApi/manager/remove?${qs.stringify(body)}`, {
    method: 'POST'
  })
}
