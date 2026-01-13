/**
 * Cobo 充值地址预加载服务
 * 在用户登录后自动预加载所有链的充值地址
 */

import { API_BASE_URL } from '@/constants/api'
import { SUPPORTED_BRIDGE_CHAINS } from '@/config/lifiConfig'
import { getCoboBalance } from '@/services/api/cobo'

interface PreloadResult {
  chainId: string
  address: string | null
  error: string | null
  isNew: boolean
}

// 🔥 缓存充值地址数据
const cachedAddresses: Map<string, { address: string; isNew: boolean; timestamp: number }> = new Map()
const ADDRESS_CACHE_TTL = 5 * 60 * 1000 // 5分钟缓存

// 缓存余额数据
let cachedBalances: any[] | null = null
let balancesCacheTime: number = 0
const BALANCE_CACHE_TTL = 60 * 1000 // 1分钟缓存

// 默认查询的代币列表
const DEFAULT_TOKEN_IDS = [
  'SOL_USDC', 'SOL_USDT', 'ETH_USDC', 'ETH_USDT',
  'ARBITRUM_USDCOIN', 'ARBITRUM_TETHER', 'BASE_USDCOIN', 'BASE_TETHER',
  'MATIC_USDC', 'MATIC_USDT', 'BSC_USDC', 'BSC_USDT', 'TRON_USDT',
  'SOL_SOL', 'ETH_ETH', 'ARBITRUM_ETH', 'BASE_ETH', 'MATIC_MATIC', 'BSC_BNB', 'TRON_TRX',
]

/**
 * 获取缓存的充值地址
 */
export const getCachedDepositAddress = (chainId: string): { address: string; isNew: boolean } | null => {
  const cached = cachedAddresses.get(chainId)
  if (cached && Date.now() - cached.timestamp < ADDRESS_CACHE_TTL) {
    console.log(`[Cobo Preload] ✅ 使用缓存的 ${chainId} 充值地址`)
    return { address: cached.address, isNew: cached.isNew }
  }
  return null
}

/**
 * 设置充值地址缓存
 */
export const setCachedDepositAddress = (chainId: string, address: string, isNew: boolean) => {
  cachedAddresses.set(chainId, { address, isNew, timestamp: Date.now() })
}

/**
 * 清除充值地址缓存
 */
export const clearDepositAddressCache = () => {
  cachedAddresses.clear()
}

/**
 * 预加载所有 Cobo 链的充值地址
 * @param userId 用户 ID
 * @param walletId Cobo 钱包 ID
 * @returns Promise<PreloadResult[]>
 */
export const preloadCoboDepositAddresses = async (
  userId: string,
  walletId: string
): Promise<PreloadResult[]> => {
  if (!userId || !walletId) {
    console.warn('[Cobo Preload] Missing userId or walletId')
    return []
  }

  console.log('[Cobo Preload] 开始预加载所有充值地址...', { userId, walletId })

  // 获取所有 Cobo 链
  const coboChains = SUPPORTED_BRIDGE_CHAINS.filter(chain => chain.type === 'cobo')
  
  console.log('[Cobo Preload] 找到', coboChains.length, '条链需要预加载')

  // 并发请求所有链的充值地址
  const results = await Promise.allSettled(
    coboChains.map(async (chain) => {
      try {
        const url = `${API_BASE_URL}/api/v1/deposit/address?userId=${userId}&chainId=${chain.id}&walletId=${walletId}`
        
        console.log(`[Cobo Preload] 获取 ${chain.displayName} 充值地址...`)
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to get deposit address')
        }

        console.log(`[Cobo Preload] ✅ ${chain.displayName} 地址已获取:`, data.data.address.slice(0, 8) + '...')

        // 🔥 存入缓存
        setCachedDepositAddress(chain.id, data.data.address, data.data.isNew)

        return {
          chainId: chain.id,
          address: data.data.address,
          error: null,
          isNew: data.data.isNew
        }
      } catch (error: any) {
        console.error(`[Cobo Preload] ❌ ${chain.displayName} 获取失败:`, error.message)
        return {
          chainId: chain.id,
          address: null,
          error: error.message,
          isNew: false
        }
      }
    })
  )

  // 统计结果
  const preloadResults: PreloadResult[] = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        chainId: coboChains[index].id,
        address: null,
        error: result.reason?.message || 'Unknown error',
        isNew: false
      }
    }
  })

  const successCount = preloadResults.filter(r => r.address !== null).length
  const failCount = preloadResults.filter(r => r.address === null).length
  const newAddressCount = preloadResults.filter(r => r.isNew).length

  console.log(`[Cobo Preload] 预加载完成: ${successCount} 成功, ${failCount} 失败, ${newAddressCount} 新创建`)

  return preloadResults
}

/**
 * 单独预加载某条链的充值地址
 * @param userId 用户 ID
 * @param walletId Cobo 钱包 ID
 * @param chainId 链 ID
 */
export const preloadSingleChainAddress = async (
  userId: string,
  walletId: string,
  chainId: string
): Promise<PreloadResult> => {
  try {
    const url = `${API_BASE_URL}/api/v1/deposit/address?userId=${userId}&chainId=${chainId}&walletId=${walletId}`
    
    console.log(`[Cobo Preload] 预加载单个链 ${chainId}...`)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get deposit address')
    }

    console.log(`[Cobo Preload] ✅ ${chainId} 地址已获取`)

    return {
      chainId,
      address: data.data.address,
      error: null,
      isNew: data.data.isNew
    }
  } catch (error: any) {
    console.error(`[Cobo Preload] ❌ ${chainId} 获取失败:`, error.message)
    return {
      chainId,
      address: null,
      error: error.message,
      isNew: false
    }
  }
}

/**
 * 预加载 Cobo 钱包余额
 * @param userId 用户 ID
 * @returns Promise<void>
 */
export const preloadCoboBalances = async (userId: string): Promise<any[]> => {
  if (!userId) {
    console.warn('[Cobo Preload] Missing userId for balance preload')
    return []
  }

  // 检查缓存是否有效
  if (cachedBalances && Date.now() - balancesCacheTime < BALANCE_CACHE_TTL) {
    console.log('[Cobo Preload] 使用缓存的余额数据')
    return cachedBalances
  }

  console.log('[Cobo Preload] 开始预加载余额...', { userId })

  const results: any[] = []

  // 并发查询所有代币余额
  const promises = DEFAULT_TOKEN_IDS.map(async (tokenId) => {
    try {
      const response = await getCoboBalance({ userId, tokenId })
      if (response.success && response.data) {
        return {
          tokenId,
          balance: response.data.balance || '0',
          available: response.data.available || '0'
        }
      }
    } catch (err) {
      // 忽略单个代币查询失败
    }
    return null
  })

  const responses = await Promise.all(promises)
  responses.forEach((res) => {
    if (res) {
      results.push(res)
    }
  })

  // 更新缓存
  cachedBalances = results
  balancesCacheTime = Date.now()

  console.log(`[Cobo Preload] ✅ 余额预加载完成: ${results.length} 条记录`)

  return results
}

/**
 * 获取缓存的余额数据
 */
export const getCachedBalances = () => {
  if (cachedBalances && Date.now() - balancesCacheTime < BALANCE_CACHE_TTL) {
    return cachedBalances
  }
  return null
}

/**
 * 清除余额缓存
 */
export const clearBalancesCache = () => {
  cachedBalances = null
  balancesCacheTime = 0
}
