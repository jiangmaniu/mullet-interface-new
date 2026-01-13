import qs from 'qs'

import { formatSymbolConf } from '@/v1/utils/business'
import { request } from '@/v1/utils/request'

// 账号交易品种及配置-集合
export async function getTradeSymbolList(params: Account.TradeSymbolListParams) {
  return request<API.Response<Account.TradeSymbolListItem[]>>('/api/trade-core/coreApi/account/tradeSymbolList', {
    method: 'GET',
    params,
  }).then((res) => {
    const records = res.data || []
    if (records.length > 0 && res.data) {
      const list = records.map((item) => {
        const symbolConf = item.symbolConf
        item.symbolConf = formatSymbolConf(symbolConf)
        return item
      })
      res.data = list
    }
    return res
  })
}

// 交易账户-新增
export async function AddAccount(body: Account.SubmitAccount) {
  return request<API.Response>('/api/trade-core/coreApi/account/save', {
    method: 'POST',
    data: body,
  })
}

// 交易账户-修改
export async function UpdateAccount(body: Account.SubmitAccount) {
  return request<API.Response>('/api/trade-core/coreApi/account/update', {
    method: 'POST',
    data: body,
  })
}

// 交易账户-充值
export async function rechargeAccount(body: Account.RechargeParams) {
  return request<API.Response>('/api/trade-core/coreApi/account/recharge', {
    method: 'POST',
    data: body,
  })
}

// 交易账户-删除
export async function removeAccount(body: API.IdParam) {
  return request<API.Response>(`/api/trade-core/coreApi/account/remove?${qs.stringify(body)}`, {
    method: 'POST',
  })
}

// 资金变更记录-分页
export async function getMoneyRecordsPageList(params: Account.MoneyRecordsPageListParams) {
  return request<API.Response<API.PageResult<Account.MoneyRecordsPageListItem>>>(
    '/api/trade-core/coreApi/account/moneyRecords',
    {
      method: 'GET',
      params,
    },
  ).then((res) => {
    if (res.data?.records?.length) {
      res.data.records = res.data.records.map((item) => {
        if (item.remark && typeof item.remark === 'string') {
          try {
            item.remark = JSON.parse(item.remark)
          } catch (e) {}
        }
        return item
      })
    }
    return res
  })
}

// 交易账户-分页
export async function getAccountPageList(params: Account.AccountPageListParams) {
  return request<API.Response<API.PageResult<Account.AccountPageListItem>>>('/api/trade-core/coreApi/account/list', {
    method: 'GET',
    params,
  })
}

// 交易账户-详情
export async function getAccountDetail(params: API.IdParam) {
  return request<API.Response<Account.AccountPageListItem>>('/api/trade-core/coreApi/account/detail', {
    method: 'GET',
    params,
  }).then((res) => {
    if (res.success && res.data) {
      res.data.status = res.data.status === 'ENABLE'
    }
    return res
  })
}

// 资金划转
export async function transferAccount(body: Account.TransferAccountParams) {
  return request<API.Response>('/api/trade-core/coreApi/account/transfer', {
    method: 'POST',
    data: body,
  })
}

// 模拟入金
export async function rechargeSimulate(body: Account.RechargeSimulateParams) {
  return request<API.Response>('/api/trade-core/coreApi/account/rechargeSimulate', {
    method: 'POST',
    data: body,
  })
}

// 交易账户-出金
export async function withdrawByAddress(body: Account.WithdrawByAddressParams) {
  return request<API.Response>('/api/trade-core/coreApi/account/withdraw', {
    method: 'POST',
    data: body,
  })
}

// 获取浮动盈亏
export async function getAccountProfit(params: { accountId: string }) {
  return request<API.Response<any>>(`/api/trade-core/coreApi/account/count/accountProfit?${qs.stringify(params)}`, {
    method: 'GET',
  })
}
