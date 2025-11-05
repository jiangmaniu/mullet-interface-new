import { request } from '@/utils/request'

// 出金入金方式列表
export async function getFundsMethodPageList(params?: Wallet.fundsMethodPageListParams) {
  return request<API.Response<API.PageResult<Wallet.fundsMethodPageListItem>>>(
    '/api/trade-payment/paymentClient/common/fundsMethodPageList',
    {
      method: 'GET',
      params,
      cryptoData: true
    }
  )
}

// /trade-payment/paymentClient/deposit/create
// 生成入金订单
export async function generateDepositOrder(body: Wallet.GenerateDepositOrderParams) {
  return request<API.Response<Wallet.GenerateDepositOrderResult>>('/api/trade-payment/paymentClient/deposit/create', {
    method: 'POST',
    data: body,
    replayProtection: true
  })
}

// /trade-payment/paymentClient/deposit/cancelDepositOrdder
// 取消入金订单
export async function cancelDepositOrder(body: { id: string }) {
  return request<API.Response<any>>('/api/trade-payment/paymentClient/deposit/cancelDepositOrdder', {
    method: 'POST',
    data: body
  })
}

// /trade-payment/paymentClient/deposit/submitCertificate
// 提交入金憑證
export async function submitDepositCertificate(body: { id: string; certificateUrl: string }) {
  return request<API.Response<any>>('/api/trade-payment/paymentClient/deposit/submitCertificate', {
    method: 'POST',
    data: body,
    replayProtection: true
  })
}

// /trade-payment/paymentClient/deposit/getOrderDetail
// 入金訂單詳情
export async function getDepositOrderDetail(params?: { id?: string; channelId?: string }) {
  return request<API.Response<Wallet.GenerateDepositOrderDetailResult>>('/api/trade-payment/paymentClient/deposit/getOrderDetail', {
    method: 'GET',
    params,
    cryptoData: true
  })
}

// /trade-payment/paymentClient/withdrawal/getOrderDetail
// /trade-payment/paymentClient/withdrawl/getOrderDetail
// 出金訂單詳情
export async function getWithdrawalOrderDetail(params?: { id?: string; channelId?: string }) {
  return request<API.Response<Wallet.GenerateWithdrawalOrderDetailResult>>('/api/trade-payment/paymentClient/withdrawl/getOrderDetail', {
    method: 'GET',
    params
  })
}
// /trade-payment/paymentClient/deposit/depositOrderList
// 客戶端入金記錄
export async function getDepositOrderList(
  params?: API.PageParam & {
    startTime?: string
    endTime?: string
    tradeAccountId: string
  }
) {
  return request<API.Response<API.PageResult<Wallet.depositOrderListItem>>>('/api/trade-payment/paymentClient/deposit/depositOrderList', {
    method: 'GET',
    params,
    cryptoData: true
  })
}

// /trade-payment/paymentClient/withdrawl/withdrawalOrderList
// 客戶端出金記錄
export async function getWithdrawalOrderList(
  params?: API.PageParam & {
    startTime?: string
    endTime?: string
    tradeAccountId: string
  }
) {
  return request<API.Response<API.PageResult<Wallet.withdrawalOrderListItem>>>(
    '/api/trade-payment/paymentClient/withdrawl/withdrawalOrderList',
    {
      method: 'GET',
      params,
      cryptoData: true
    }
  )
}

// /trade-payment/paymentClient/withdrawalBank/pageList
// 获取提现银行列表
export async function getWithdrawalBankList(params?: API.PageParam) {
  return request<API.Response<API.PageResult<Wallet.WithdrawalBank>>>('/api/trade-payment/paymentClient/withdrawalBank/pageList', {
    method: 'GET',
    params,
    cryptoData: true
  })
}

// /trade-payment/paymentClient/withdrawalBank/modify
// 修改提现银行
export async function modifyWithdrawalBank(body: { id: string; remark: string }) {
  return request<API.Response<any>>('/api/trade-payment/paymentClient/withdrawalBank/modify', {
    method: 'POST',
    data: body
  })
}

// /trade-payment/paymentClient/withdrawalBank/remove
// 删除提现银行
export async function removeWithdrawalBank(body: { id: any }) {
  return request<API.Response<any>>('/api/trade-payment/paymentClient/withdrawalBank/remove?id=' + body.id, {
    method: 'POST',
    data: body
  })
}
// /trade-payment/paymentClient/withdrawalAddress/pageList
// 获取提现地址列表
export async function getWithdrawalAddressList(params?: API.PageParam) {
  return request<API.Response<API.PageResult<Wallet.WithdrawalAddress>>>('/api/trade-payment/paymentClient/withdrawalAddress/pageList', {
    method: 'GET',
    params,
    cryptoData: true
  })
}

// /trade-payment/paymentClient/withdrawl/create
// 生成出金订单
export async function generateWithdrawOrder(body: Wallet.GenerateWithdrawOrderParams) {
  return request<API.Response<any>>('/api/trade-payment/paymentClient/withdrawl/create', {
    method: 'POST',
    data: body,
    replayProtection: true
  })
}

// /trade-payment/paymentClient/withdrawalAddress/modify
// 修改提现地址
export async function modifyWithdrawalAddress(body: { id: string; remark: string }) {
  return request<API.Response<any>>('/api/trade-payment/paymentClient/withdrawalAddress/modify', {
    method: 'POST',
    data: body,
    replayProtection: true
  })
}

// /trade-payment/paymentClient/withdrawalAddress/remove
// 删除提现地址
export async function removeWithdrawalAddress(body: { id: string }) {
  return request<API.Response<any>>('/api/trade-payment/paymentClient/withdrawalAddress/remove?id=' + body.id, {
    method: 'POST',
    data: body
  })
}

/**
 * 出入金方式列表(不分页)
 * @param params
 * @returns
 */
export async function getPaymentMethodList(params?: { fundsType: 1 | 2 }) {
  return request<API.Response<Wallet.fundsMethodPageListItem>>('/api/trade-payment/paymentClient/common/paymentMethodList', {
    method: 'GET',
    params
  })
}

// 获取提现方式列表
export async function getWithdrawMethodList(params?: API.PageParam & { clientId: any }) {
  return request<API.Response<API.PageResult<Wallet.WithdrawMethod>>>('/api/blade-wallet/wallet/withdraw/list', {
    method: 'GET',
    params
  })
}

// // 生成充值订单
// export async function generateDepositOrder(body: Wallet.GenerateDepositOrderParams) {
//   return request<API.Response<any>>('/api/blade-wallet/wallet/deposit/create', {
//     method: 'POST',
//     data: body
//   })
// }

// // 生成提现订单（预览）
// export async function generateWithdrawOrder(body: Wallet.GenerateWithdrawOrderParams) {
//   return request<API.Response<any>>('/api/blade-wallet/wallet/withdraw/create', {
//     method: 'POST',
//     data: body
//   })
// }

// 生成提交订单（确认）
export async function confirmWithdrawOrder(body: Wallet.ConfirmWithdrawOrderParams) {
  return request<API.Response<any>>('/api/blade-wallet/wallet/withdraw/confirm', {
    method: 'POST',
    data: body
  })
}

// 获取入金记录
export async function getDepositRecordList(params?: API.PageParam & { clientId: any }) {
  return request<API.Response<API.PageResult<Wallet.DepositRecord>>>('/api/blade-wallet/wallet/deposit/list', {
    method: 'GET',
    params
  })
}

// 获取提现记录
export async function getWithdrawRecordList(params?: API.PageParam & { clientId: any }) {
  return request<API.Response<API.PageResult<Wallet.WithdrawRecord>>>('/api/blade-wallet/wallet/withdraw/list', {
    method: 'GET',
    params
  })
}

// TODO: 获取订单确认验证码接口
// TODO: 读取（区块链）地址管理列表接口 (及增删改接口)
// TODO: 读取（银行）账户管理列表接口 (及增删改接口)
