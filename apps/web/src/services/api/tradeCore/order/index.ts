import qs from 'qs'

import { parseJsonFields } from '@/utils'
import { formatSymbolConf } from '@/utils/business'
import { request } from '@/utils/request'

export const formaOrderList = (list = []) => {
  if (!list?.length) return []
  return list.map((item: any) => {
    if (item.conf) {
      parseJsonFields(item, ['conf'])
      item.conf = formatSymbolConf(item.conf)
    }
    return item
  })
}

const formatOrderResult = (res: any) => {
  const records = res.data?.records || []
  if (records.length > 0 && res.data) {
    res.data.records = formaOrderList(records)
  }
  return res
}

// 下单
export async function createOrder(body: Order.CreateOrder) {
  return request<API.Response<Order.CreateOrderResponse>>(`/api/trade-core/coreApi/orders/createOrder`, {
    method: 'POST',
    data: body,
    replayProtection: true
  })
}

// 计算新订单保证金
export async function getOrderMargin(body: Order.CreateOrder) {
  if (body.type === 'MARKET_ORDER') {
    delete body.limitPrice
  }
  return request<API.Response>('/api/trade-core/coreApi/orders/newOrderMargin', {
    method: 'POST',
    data: body,
    skipErrorHandler: true
  })
}

// 修改委托单（修改挂单）
export async function modifyPendingOrder(body: Order.UpdatePendingOrderParams) {
  return request<API.Response>('/api/trade-core/coreApi/orders/orderEdit', {
    method: 'POST',
    data: body,
    replayProtection: true
  })
}

// 取消委托单-挂单
export async function cancelOrder(body: API.IdParam) {
  return request<API.Response>(`/api/trade-core/coreApi/orders/orderCancel?${qs.stringify(body)}`, {
    method: 'POST',
    data: body,
    replayProtection: true
  })
}

// 修改止盈止损
export async function modifyStopProfitLoss(body: Order.ModifyStopProfitLossParams) {
  return request<API.Response>(`/api/trade-core/coreApi/orders/stopProfitLoss`, {
    method: 'POST',
    data: body,
    replayProtection: true
  })
}

// 订单修改
export async function updateOrder(body: Order.UpdateOrder) {
  return request<API.Response>('/api/trade-core/coreApi/orders/updateOrder', {
    method: 'POST',
    data: body
  })
}

// 订单-分页
export async function getOrderPage(params?: Order.OrderPageListParams) {
  return request<API.Response<API.PageResult<Order.OrderPageListItem>>>('/api/trade-core/coreApi/orders/orderPage', {
    method: 'GET',
    skipErrorHandler: true,
    params
  }).then((res) => formatOrderResult(res))
}

// 订单-详情
export async function getOrderDetail(params?: API.IdParam /**订单id */) {
  return request<API.Response<Order.OrderDetailListItem>>('/api/trade-core/coreApi/orders/orderDetail', {
    method: 'GET',
    params
  })
}

// 全部订单订单-详情(持仓单、成交记录)
export async function getOrderAllDetail(params?: API.IdParam /**持仓单id */) {
  return request<API.Response<Order.OrderDetailListItem>>('/api/trade-core/coreApi/orders/allDetail', {
    method: 'GET',
    params
  })
}

// 持仓订单-分页
export async function getBgaOrderPage(params: Order.BgaOrderPageListParams) {
  return request<API.Response<API.PageResult<Order.BgaOrderPageListItem>>>('/api/trade-core/coreApi/orders/bgaOrderPage', {
    method: 'GET',
    skipErrorHandler: true,
    params
  }).then((res) => formatOrderResult(res))
}

// 成交记录-分页
export async function getTradeRecordsPage(params?: Order.TradeRecordsPageListParams) {
  return request<API.Response<API.PageResult<Order.TradeRecordsPageListItem>>>('/api/trade-core/coreApi/orders/tradeRecordsPage', {
    method: 'GET',
    skipErrorHandler: true,
    params
  }).then((res) => formatOrderResult(res))
}

// 追加保证金
export async function addMargin(body: Order.AddMarginParams) {
  return request<API.Response>('/api/trade-core/coreApi/orders/addMargin', {
    method: 'POST',
    data: body,
    replayProtection: true
  })
}

// 提取逐仓保证金
export async function extractMargin(body: Order.ExtractMarginParams) {
  return request<API.Response>('/api/trade-core/coreApi/orders/extractMargin', {
    method: 'POST',
    data: body,
    replayProtection: true
  })
}
