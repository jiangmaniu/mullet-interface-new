import qs from 'qs'

import { request } from '@/v1/utils/request'

// 假期日历-新增或修改
export async function submitHoliday(body: Holiday.SubmitHolidayParams) {
  return request<API.Response>(`/api/trade-core/coreApi/holiday/submit`, {
    method: 'POST',
    data: body,
  })
}

// 交易品种组-删除
export async function removeHoliday(body: { ids: string }) {
  return request<API.Response>(`/api/trade-core/coreApi/holiday/remove?${qs.stringify(body)}`, {
    method: 'POST',
  })
}

// 假期日历-分页
export async function getHolidayPageList(params?: API.PageParam) {
  return request<API.Response<API.PageResult<Holiday.HolidayPageListItem>>>('/api/trade-core/coreApi/holiday/list', {
    method: 'GET',
    params,
  })
}

// 假期日历-详情
export async function getHolidayDetail(params: API.IdParam) {
  return request<API.Response<Holiday.HolidayPageListItem>>('/api/trade-core/coreApi/holiday/detail', {
    method: 'GET',
    params,
  })
}

// 假期日历-判断品种当前是否在假期
export async function getSymbolIsHoliday(params: { symbols: string }) {
  return request<API.Response<any>>(`/api/trade-core/coreApi/holiday/symbolIsHoliday`, {
    method: 'GET',
    skipErrorHandler: true,
    params,
  })
}
