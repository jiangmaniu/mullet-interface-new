import { API_BASE_URL } from '@/constants/api'

const COBO_API_BASE = `${API_BASE_URL}/api/v1`

/**
 * Cobo 钱包相关 API
 * 使用原生 fetch 避免自动添加 Blade-Auth header（CORS 问题）
 */

// 获取用户余额
export async function getCoboBalance(params: { userId: string; tokenId: string }) {
  const url = `${COBO_API_BASE}/balance?userId=${params.userId}&tokenId=${params.tokenId}`
  const response = await fetch(url)
  return response.json() as Promise<API.Response<{
    userId: string
    tokenId: string
    balance: string
    frozenBalance: string
    available: string
  }>>
}

// 发起提现
export async function coboWithdraw(body: {
  userId: string
  chainId: string
  tokenId: string
  amount: string
  toAddress: string
  walletId: string
}) {
  const response = await fetch(`${COBO_API_BASE}/withdraw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  return response.json() as Promise<API.Response<{
    requestId: string
    message: string
  }>>
}

// 获取充值历史
export async function getDepositHistory(params: {
  userId: string
  limit?: number
  offset?: number
}) {
  const searchParams = new URLSearchParams({
    userId: params.userId,
    ...(params.limit && { limit: params.limit.toString() }),
    ...(params.offset && { offset: params.offset.toString() })
  })
  const url = `${COBO_API_BASE}/deposit/history?${searchParams.toString()}`
  const response = await fetch(url)
  return response.json() as Promise<API.Response<{
    deposits: Array<{
      transaction_id: string
      wallet_id: string
      token_id: string
      amount: string
      status: string
      created_timestamp: number
    }>
    limit: number
    offset: number
  }>>
}

// 获取提现历史
export async function getWithdrawHistory(params: {
  userId: string
  limit?: number
  offset?: number
}) {
  const searchParams = new URLSearchParams({
    userId: params.userId,
    ...(params.limit && { limit: params.limit.toString() }),
    ...(params.offset && { offset: params.offset.toString() })
  })
  const url = `${COBO_API_BASE}/withdraw/history?${searchParams.toString()}`
  const response = await fetch(url)
  return response.json() as Promise<API.Response<{
    withdrawals: Array<{
      request_id: string
      transaction_id?: string
      wallet_id: string
      token_id: string
      amount: string
      to_address: string
      status: string
      created_timestamp: number
    }>
    limit: number
    offset: number
  }>>
}

