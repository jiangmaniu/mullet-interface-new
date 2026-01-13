/**
 * API 常量配置
 * 集中管理所有 API 端点的 base URL
 */

/**
 * 后端 API Base URL
 * 用于 TRON 钱包创建、交易签名等服务端操作
 */
export const API_BASE_URL = 'https://api.mulletfinance.xyz'

/**
 * deBridge API Base URL
 * 用于跨链桥接服务
 */
export const DEBRIDGE_API_BASE_URL = 'https://dln.debridge.finance/v1.0'

/**
 * TRON 相关 API 端点
 */
export const TRON_API_ENDPOINTS = {
  // 创建 TRON 钱包（Privy Tier 2）
  CREATE_WALLET: `${API_BASE_URL}/api/tron-wallet/create`,

  // 检查 TRON 钱包是否存在
  CHECK_WALLET: `${API_BASE_URL}/api/tron-wallet`,

  // TRON 交易标准签名
  SIGN_TRANSACTION: `${API_BASE_URL}/api/tron-transaction/sign`,

  // TRON 交易 Gas 赞助签名
  SPONSOR_AND_SIGN: `${API_BASE_URL}/api/tron-transaction/sponsor-and-sign`
} as const

/**
 * TRON RPC 端点
 * Ankr Premium RPC for TRON
 */
export const TRON_RPC_URL = 'https://rpc.ankr.com/premium-http/tron'
