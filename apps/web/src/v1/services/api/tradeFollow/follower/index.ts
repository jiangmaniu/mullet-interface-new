import { request } from '@/utils/request'

// 跟单管理 - 进行中
export async function getTradeFollowFolloerManagementInProgress(params?: TradeFollowFollower.ManagementParams & API.PageParam) {
  return request<API.Response<API.PageResult<TradeFollowFollower.ManagementInProgressItem>>>(
    '/api/trade-follow/followApi/follower/management/in_progress',
    {
      method: 'GET',
      params
    }
  )
}

// /trade-follow/followApi/follower/management/end
// 跟单管理 - 已结束
export async function getTradeFollowFolloerManagementEnd(params?: TradeFollowFollower.ManagementParams & API.PageParam) {
  return request<API.Response<API.PageResult<TradeFollowFollower.ManagementEndItem>>>(
    '/api/trade-follow/followApi/follower/management/end',
    {
      method: 'GET',
      params
    }
  )
}

// /trade-follow/followApi/follower/management/history
// 跟单管理 - 历史仓位
export async function getTradeFollowFolloerManagementHistory(params?: { followerId?: string | number } & API.PageParam) {
  return request<API.Response<API.PageResult<TradeFollowFollower.ManagementHistoryItem>>>(
    '/api/trade-follow/followApi/follower/management/history',
    {
      method: 'GET',
      params
    }
  )
}

// /trade-follow/followApi/follower/save
// 跟单人 - 申请跟单 （设置）
export async function postTradeFollowFolloerSave(data: TradeFollowFollower.SaveParams) {
  return request<API.Response>('/api/trade-follow/followApi/follower/save', {
    method: 'POST',
    data
  })
}

// /trade-follow/followApi/follower/history_follower_order
// 跟单人 - 历史跟单
export async function getTradeFollowFolloerHistoryFollowerOrder(
  params?: { followerId?: string | number; leadId?: string | number } & API.PageParam
) {
  return request<API.Response<API.PageResult<TradeFollowFollower.HistoryFollowerOrderItem>>>(
    '/api/trade-follow/followApi/follower/history_follower_order',
    {
      method: 'GET',
      params
    }
  )
}

// /trade-follow/followApi/follower/current_follower_order
// 跟单人 - 当前跟单
export async function getTradeFollowFolloerCurrentFollowerOrder(
  params?: { followerId?: string | number; leadId?: string | number } & API.PageParam
) {
  return request<API.Response<API.PageResult<TradeFollowFollower.CurrentFollowerOrderItem>>>(
    '/api/trade-follow/followApi/follower/current_follower_order',
    {
      method: 'GET',
      params
    }
  )
}

// /trade-follow/followApi/follower/close
// 跟单人 - 结束跟单
export async function postTradeFollowFolloerClose(data: { followerId: string }) {
  return request<API.Response>('/api/trade-follow/followApi/follower/close?followerId=' + data.followerId, {
    method: 'GET'
  })
}

// /trade-follow/followApi/follower/detail
// 带单人 - 详情
export async function getTradeFollowFollowerDetail(params: { followerId: string | number }) {
  return request<API.Response<TradeFollowFollower.FollowDetailItem>>('/api/trade-follow/followApi/follower/detail', {
    method: 'GET',
    params
  })
}
