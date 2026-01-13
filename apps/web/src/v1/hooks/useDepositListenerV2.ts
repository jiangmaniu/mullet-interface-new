import { useState, useEffect, useCallback, useRef } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { API_BASE_URL } from '@/constants/api'

interface DepositDetection {
  amount: string
  token: string
  chain: string
  txHash?: string
  rawAmount?: string
  address?: string
  timestamp?: string
}

interface UseDepositListenerOptions {
  enabled?: boolean
  pollInterval?: number // 轮询间隔(ms)，默认 5 秒
  chain?: string // 监听的链
  address?: string // 钱包地址
}

/**
 * 监听用户钱包的充值 - 使用后端 API
 * 
 * 后端会监控链上交易，检测余额变化
 * 前端只需要轮询后端 API 获取充值状态
 *
 * @example
 * ```tsx
 * const { deposit, isListening } = useDepositListener({
 *   enabled: true,
 *   chain: 'tron',
 *   address: 'TXxx...'
 * })
 *
 * useEffect(() => {
 *   if (deposit) {
 *     console.log('Detected deposit:', deposit)
 *     // 触发桥接流程
 *   }
 * }, [deposit])
 * ```
 */
export function useDepositListener(options: UseDepositListenerOptions = {}) {
  const {
    enabled = false,
    pollInterval = 5000,
    chain,
    address
  } = options

  const { getAccessToken } = usePrivy()
  const [deposit, setDeposit] = useState<DepositDetection | null>(null)
  const [deposits, setDeposits] = useState<DepositDetection[]>([]) // 所有检测到的充值
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 调用后端 API 检查充值
  const checkDeposits = useCallback(async () => {
    if (!chain || !address) {
      return null
    }

    try {
      const accessToken = await getAccessToken()
      
      const response = await fetch(
        `${API_BASE_URL}/api/deposit-monitor/check/${chain.toLowerCase()}/${address}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
          },
          signal: abortControllerRef.current?.signal,
        }
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.deposits && data.deposits.length > 0) {
        // 返回最新的充值
        const latestDeposit = data.deposits[0]
        console.log('[DepositListener] ✅ Detected deposit via backend:', latestDeposit)
        return {
          amount: latestDeposit.amount,
          token: latestDeposit.token,
          chain: latestDeposit.chain,
          rawAmount: latestDeposit.rawAmount,
          address: latestDeposit.address,
          timestamp: latestDeposit.timestamp,
        }
      }

      return null
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return null
      }
      console.error('[DepositListener] API error:', err)
      setError(err.message)
      return null
    }
  }, [chain, address, getAccessToken])

  // 轮询检查
  useEffect(() => {
    if (!enabled || !chain || !address) {
      setIsListening(false)
      return
    }

    setIsListening(true)
    setError(null)
    abortControllerRef.current = new AbortController()

    const poll = async () => {
      const detectedDeposit = await checkDeposits()
      if (detectedDeposit) {
        setDeposit(detectedDeposit)
        // 添加到历史记录（避免重复）
        setDeposits(prev => {
          const exists = prev.some(d => d.timestamp === detectedDeposit.timestamp)
          if (!exists) {
            return [detectedDeposit, ...prev].slice(0, 10) // 最多保留10条
          }
          return prev
        })
      }
    }

    // 立即检查一次
    poll()

    // 定时轮询
    const interval = setInterval(poll, pollInterval)

    return () => {
      clearInterval(interval)
      abortControllerRef.current?.abort()
      setIsListening(false)
    }
  }, [enabled, chain, address, pollInterval, checkDeposits])

  // 清除检测到的充值
  const clearDeposit = useCallback(() => {
    setDeposit(null)
  }, [])

  // 重置所有检测状态
  const resetDetection = useCallback(() => {
    setDeposit(null)
    setDeposits([])
    setError(null)
    console.log('[DepositListener] 🔄 Detection state reset')
  }, [])

  return {
    deposit,
    deposits, // 充值历史
    isListening,
    error,
    clearDeposit,
    resetDetection,
  }
}

/**
 * 获取充值历史
 */
export async function getDepositHistory(address: string): Promise<DepositDetection[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/deposit-monitor/history/${address}`
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data.deposits || []
  } catch (err) {
    console.error('[DepositListener] Failed to get history:', err)
    return []
  }
}

/**
 * 手动触发充值检查
 */
export async function triggerDepositScan(): Promise<{ scanned: number; deposits: DepositDetection[] }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/deposit-monitor/scan`,
      { method: 'POST' }
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (err) {
    console.error('[DepositListener] Scan trigger failed:', err)
    return { scanned: 0, deposits: [] }
  }
}
