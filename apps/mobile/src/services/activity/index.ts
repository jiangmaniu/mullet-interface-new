import { request } from '@/utils/request'

// 我的活动列表
export async function getMyActivityList(params: API.PageParam) {
  return request<API.Response<API.PageResult<Activity.ListItem>>>('/api/trade-activity/activityClient/order/getMyActivityList', {
    method: 'GET',
    params
  })
}
