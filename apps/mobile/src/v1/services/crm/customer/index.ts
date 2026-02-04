import qs from 'qs'

import { request } from '@/v1/utils/request'
import { getCurrentRouteName, onLogout } from '@/v1/utils/navigation'

// 客户用户-新增
export async function addClient(body: Customer.AddOrUpdateParams) {
  return request<API.Response>('/api/trade-crm/crmApi/client/submit', {
    method: 'POST',
    data: body
  })
}

// 客户用户-修改
export async function updateClient(body: Customer.AddOrUpdateParams) {
  return request<API.Response>('/api/trade-crm/crmApi/client/update', {
    method: 'POST',
    data: body
  })
}

// 客户用户-分页
export async function getClientList(params?: API.PageParam) {
  return request<API.Response<API.PageResult<Customer.ListItem>>>('/api/trade-crm/crmApi/client/list', {
    method: 'GET',
    params
  })
}

// 客户用户-详情
export async function getClientDetail(params: API.IdParam) {
  return request<API.Response<Customer.ListItem>>('/api/trade-crm/crmApi/client/detail', {
    method: 'GET',
    skipErrorHandler: true,
    params
  }).then((res) => {
    if (res?.code !== 200) {
      if (getCurrentRouteName() !== 'Welcome') {
        onLogout()
      }
      return {}
    }

    if (res.data?.accountList?.length) {
      res.data.accountList = res.data.accountList.map((item) => {
        if (item.synopsis) {
          item.synopsis = JSON.parse(item.synopsis as any)
          // 兼容旧数据
          if (!Array.isArray(item.synopsis)) {
            item.synopsis = []
          }
        }
        return item
      })
    }
    return res?.data || {}
  })
}

// 客户用户-删除
export async function removeClient(body: { ids?: string }) {
  return request<API.Response>(`/api/trade-crm/crmApi/client/remove?${qs.stringify(body)}`, {
    method: 'POST'
  })
}
