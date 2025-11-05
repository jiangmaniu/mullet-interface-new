import { request } from '@/utils/request'

// 带单人-跟单广场
export async function getTradeFollowLeadPlaza(params?: TradeFollowLead.LeadPlazaParams & API.PageParam) {
  return request<API.Response<API.PageResult<TradeFollowLead.LeadPlazaItem>>>('/api/trade-follow/followApi/lead/lead_plaza', {
    method: 'GET',
    params
  })
}

// 带单人-新增
export async function addTraadeFollowLead(body: TradeFollowLead.LeadSaveParams) {
  return request<API.Response>('/api/trade-follow/followApi/lead/save', {
    method: 'POST',
    data: body
  })
}

// /trade-follow/followApi/lead/lead_managements
// 带单人-带单管理
export async function getTradeFollowLeadManagements(params: { clientId: string | number } & API.PageParam) {
  return request<API.Response<API.PageResult<TradeFollowLead.LeadManagementsItem>>>('/api/trade-follow/followApi/lead/lead_managements', {
    method: 'GET',
    params
  })
}

// /trade-follow/followApi/lead/settings
// 带单人 - 设置
export async function setTradeFollowLeadSettings(body: TradeFollowLead.LeadSettingsParams) {
  return request<API.Response>('/api/trade-follow/followApi/lead/settings', {
    method: 'POST',
    data: body
  })
}

// /trade-follow/followApi/lead/detail
// 带单人 - 详情
export async function getTradeFollowLeadDetail(params: { leadId: string | number }) {
  return request<API.Response<TradeFollowLead.LeadDetailItem>>('/api/trade-follow/followApi/lead/detail', {
    method: 'GET',
    params
  })
}

// /trade-follow/followApi/lead/statistics
// 带单人 - 带单表现
export async function tradeFollowStatistics(params: { leadId: string; startDatetime: string; endDatetime: string }) {
  return request<API.Response<TradeFollowLead.TradeFollowLeadStatisticsItem>>('/api/trade-follow/followApi/lead/statistics', {
    method: 'GET',
    params
  })
}

// /trade-follow/followApi/lead/profit_statistics
// 带单人 - 累计盈亏
export async function tradeFollowProfitStatistics(params: { leadId: string; startDatetime: string; endDatetime: string }) {
  return request<API.Response<TradeFollowLead.TradeFollowLeadProfitStatisticsItem>>('/api/trade-follow/followApi/lead/profit_statistics', {
    method: 'GET',
    params
  })
}

// /trade-follow/followApi/lead/symbol_statistics
// 带单人 - 交易偏好
export async function tradeFollowSymbolStatistics(params: { id: string; startDatetime: string; endDatetime: string }) {
  return request<API.Response<TradeFollowLead.TradeFollowLeadSymbolStatisticsItem[]>>(
    '/api/trade-follow/followApi/lead/symbol_statistics',
    {
      method: 'GET',
      params
    }
  )
}

// /trade-follow/followApi/lead/list_leads
// 带单人 - 其他账户
export async function tradeFollowListLeads(params: { leadId: string }) {
  return request<API.Response<TradeFollowLead.TradeFollowLeadListItem>>('/api/trade-follow/followApi/lead/list_leads', {
    method: 'GET',
    params
  })
}

// /trade-follow/followApi/lead/lead_profit_sharing
// 带单人 - 分润
export async function tradeFollowLeadProfitSharing(params: { leadId: string; startDatetime: string; endDatetime: string } & API.PageParam) {
  return request<API.Response<API.PageResult<TradeFollowLead.TradeFollowLeadProfitSharingItem>>>(
    '/api/trade-follow/followApi/lead/lead_profit_sharing',
    {
      method: 'GET',
      params
    }
  )
}

// /trade-follow/followApi/lead/lead_profit_sharing_detail
// 带单人 - 分润详情
export async function tradeFollowLeadProfitSharingDetail(params: { leadId?: string; date?: string } & API.PageParam) {
  return request<API.Response<API.PageResult<TradeFollowLead.TradeFollowLeadProfitSharingDetailItem>>>(
    '/api/trade-follow/followApi/lead/lead_profit_sharing_detail',
    {
      method: 'GET',
      params
    }
  )
}

// /trade-follow/followApi/lead/close
// 带单人 - 结束带单
export async function tradeFollowLeadClose(params: { leadId: string }) {
  return request<API.Response>('/api/trade-follow/followApi/lead/close?leadId=' + params.leadId, {
    method: 'POST'
  })
}

// /trade-follow/followApi/lead/current_lead_order
// 带单人 - 当前带单
export async function tradeFollowCurrentLeadOrder(params: TradeFollowLead.TradeFollowLeadOrderParams) {
  return request<API.Response<TradeFollowLead.TradeFollowCurrentLeadOrderItem>>('/api/trade-follow/followApi/lead/current_lead_order', {
    method: 'GET',
    params
  })
}

// /trade-follow/followApi/lead/history_lead_order
// 带单人 - 历史带单
export async function tradeFollowHistoryLeadOrder(params: TradeFollowLead.TradeFollowLeadOrderParams) {
  return request<API.Response<TradeFollowLead.TradeFollowHistoryLeadOrderItem>>('/api/trade-follow/followApi/lead/history_lead_order', {
    method: 'GET',
    params
  })
}

// /trade-follow/followApi/lead/follow_user
// 带单人 - 跟单用户
export async function tradeFollowFollowUser(params: TradeFollowLead.TradeFollowLeadOrderParams) {
  return request<API.Response<TradeFollowLead.TradeFollowLeadFollowUserItem>>('/api/trade-follow/followApi/lead/follow_user', {
    method: 'GET',
    params
  })
}

// /trade-follow/followApi/lead/in_progress_bag
// 带单人 - 查询是否有持仓订单
export async function tradeFollowInProgressBag(params: { leadId: string }) {
  return request<API.Response<boolean>>('/api/trade-follow/followApi/lead/in_progress_bag', {
    method: 'GET',
    params
  })
}

// /trade-follow/followApi/lead/account_follow_status
// 带单人 - 查询是否已跟单
export async function tradeFollowAccountFollowStatus(params: { tradeAccountId: string }) {
  return request<API.Response<boolean>>('/api/trade-follow/followApi/lead/account_follow_status', {
    method: 'GET',
    params
  })
}
