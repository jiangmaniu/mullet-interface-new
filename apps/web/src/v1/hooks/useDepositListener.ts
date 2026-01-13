import { useState, useEffect, useCallback, useRef } from 'react'
import { useWallets } from '@privy-io/react-auth'
import { Connection, PublicKey } from '@solana/web3.js'
import { SUPPORTED_TOKENS } from '@/config/lifiConfig'
import { findWalletByChain } from '@/utils/privyWalletHelpers'

interface DepositDetection {
  amount: string
  token: string
  chain: string
  txHash?: string
  rawBalance?: string
}

interface UseDepositListenerOptions {
  enabled?: boolean
  pollInterval?: number // 轮询间隔(ms)
  chains?: ('Tron' | 'Ethereum' | 'Solana')[] // 监听的链
  tronAddress?: string // 手动指定 TRON 地址（因为 Tier 2 钱包不在 wallets 中）
  ethereumAddress?: string // 手动指定 Ethereum 地址
  solanaAddress?: string // 手动指定 Solana 地址
}

/**
 * 监听用户钱包的充值
 * 支持 TRON / Ethereum / Solana 三条链
 *
 * @example
 * ```tsx
 * const { deposit, isListening } = useDepositListener({
 *   enabled: true,
 *   chains: ['TRON', 'Ethereum']
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
    chains = ['Tron', 'Ethereum', 'Solana'],
    tronAddress,
    ethereumAddress,
    solanaAddress
  } = options

  const { wallets } = useWallets()
  const [deposit, setDeposit] = useState<DepositDetection | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [previousBalances, setPreviousBalances] = useState<Record<string, string>>({})
  const lastDetectionTime = useRef<number>(0) // 上次检测到余额的时间戳
  const cooldownPeriod = 60000 // 60 秒冷却时间

  // 检查 Solana 余额
  const checkSolanaBalance = useCallback(
    async (address: string) => {
      try {
        const connection = new Connection('https://rpc.ankr.com/solana/0935b8711b527426dac2e2431d0b1ed85200be5d7034988fda8c718e3caa4374')

        // 检查 USDT
        const usdtTokenInfo = SUPPORTED_TOKENS.solana.find((t) => t.symbol === 'USDT')
        if (!usdtTokenInfo) {
          console.warn('[Deposit] USDT token not found in config')
          return null
        }

        const usdtMint = new PublicKey(usdtTokenInfo.address)
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(new PublicKey(address), {
          mint: usdtMint
        })

        if (tokenAccounts.value.length > 0) {
          const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.amount
          const key = `solana-usdt-${address}`

          if (previousBalances[key] && BigInt(balance) > BigInt(previousBalances[key])) {
            const diff = (BigInt(balance) - BigInt(previousBalances[key])).toString()
            console.log('[Deposit] Detected Solana USDT deposit:', diff)
            return {
              amount: diff,
              token: 'USDT',
              chain: 'Solana',
              rawBalance: balance
            }
          }

          setPreviousBalances((prev) => ({ ...prev, [key]: balance }))
        }
      } catch (error) {
        console.error('[Deposit] Failed to check Solana balance:', error)
      }

      return null
    },
    [previousBalances]
  )

  // 检查 TRON 余额 (直接查询智能合约余额)
  const checkTronBalance = useCallback(
    async (address: string) => {
      try {
        // 动态导入 TronWeb
        const { TronWeb } = await import('tronweb')

        // 使用 Ankr Premium RPC (已付费)
        const tronWeb = new TronWeb({
          fullHost: 'https://rpc.ankr.com/premium-http/tron/0935b8711b527426dac2e2431d0b1ed85200be5d7034988fda8c718e3caa4374'
        })

        // 检查 USDT TRC20 余额
        const usdtTokenInfo = SUPPORTED_TOKENS.tron.find((t) => t.symbol === 'USDT')
        if (!usdtTokenInfo) {
          console.warn('[Deposit] TRON USDT token not found in config')
          return null
        }

        tronWeb.setAddress(address)
        const contract = await tronWeb.contract().at(usdtTokenInfo.address)
        const balance = await contract.balanceOf(address).call()
        const tokenBalance = Number(balance.toString()) / Math.pow(10, 6) // USDT 有 6 位小数

        const key = `tron-usdt-${address}`
        const previousBalance = previousBalances[key] ? parseFloat(previousBalances[key]) : 0

        // 如果余额增加，触发充值检测
        if (tokenBalance > previousBalance && tokenBalance > 0.000001) {
          const depositAmount = (tokenBalance - previousBalance).toFixed(6)
          console.log('[Deposit] Detected TRON USDT deposit:', depositAmount, 'USDT')

          setPreviousBalances((prev) => ({ ...prev, [key]: tokenBalance.toString() }))

          return {
            amount: depositAmount,
            token: 'USDT',
            chain: 'Tron',
            rawBalance: balance.toString()
          }
        }

        // 更新余额记录
        if (previousBalance === 0 && tokenBalance > 0) {
          // 首次检测到余额，记录但不触发
          setPreviousBalances((prev) => ({ ...prev, [key]: tokenBalance.toString() }))
        }
      } catch (error) {
        console.error('[Deposit] Failed to check TRON balance:', error)
      }

      return null
    },
    [previousBalances]
  )

  // 检查 Ethereum 余额 (检查 USDT/USDC ERC20 代币)
  const checkEthereumBalance = useCallback(
    async (address: string) => {
      try {
        // 检查所有支持的 ERC20 代币 (USDT 和 USDC)
        const supportedTokens = [
          { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
          { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 }
        ]

        for (const token of supportedTokens) {
          // 使用 Ankr Premium RPC 调用 ERC20 balanceOf
          const balanceOfData = `0x70a08231000000000000000000000000${address.slice(2).toLowerCase()}`

          const response = await fetch('https://rpc.ankr.com/eth/0935b8711b527426dac2e2431d0b1ed85200be5d7034988fda8c718e3caa4374', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [
                {
                  to: token.address,
                  data: balanceOfData
                },
                'latest'
              ],
              id: 1
            })
          })

          if (!response.ok) {
            console.error(`[Deposit] Ethereum RPC error: ${response.status} ${response.statusText}`)
            continue
          }

          const data = await response.json()

          if (data.error) {
            console.error(`[Deposit] Ethereum RPC error:`, data.error)
            continue
          }

          const balance = data.result

          if (balance && balance !== '0x0') {
            const balanceNum = BigInt(balance)
            const key = `ethereum-${token.symbol.toLowerCase()}-${address}`
            const previousBalance = previousBalances[key] ? BigInt(previousBalances[key]) : BigInt(0)
            const balanceFormatted = (Number(balanceNum) / Math.pow(10, token.decimals)).toFixed(token.decimals)

            // 方案1: 余额增加了（有新充值）
            const hasIncrease = balanceNum > previousBalance && balanceNum > BigInt(0)

            // 方案2: 首次检测到余额（从 0 到有余额）且过了冷却期
            const now = Date.now()
            const timeSinceLastDetection = now - lastDetectionTime.current
            const isFirstDetection = previousBalance === BigInt(0) && balanceNum > BigInt(0) && timeSinceLastDetection >= cooldownPeriod

            if (hasIncrease || isFirstDetection) {
              console.log(`[Deposit] ✅ Detected Ethereum ${token.symbol} balance:`, balanceFormatted, token.symbol)
              console.log(`[Deposit] Trigger reason:`, hasIncrease ? 'Balance increased' : 'First detection')

              lastDetectionTime.current = now // 更新检测时间
              setPreviousBalances((prev) => ({ ...prev, [key]: balance })) // 更新余额记录

              return {
                amount: balanceFormatted,
                token: token.symbol,
                chain: 'Ethereum',
                rawBalance: balance
              }
            }

            // 更新余额记录（即使不触发也要记录）
            if (previousBalance === BigInt(0) && balanceNum > BigInt(0)) {
              setPreviousBalances((prev) => ({ ...prev, [key]: balance }))
            }
          }
        }
      } catch (error) {
        console.error('[Deposit] Failed to check Ethereum balance:', error)
      }

      return null
    },
    [previousBalances]
  )

  // 轮询检查余额
  useEffect(() => {
    if (!enabled) {
      setIsListening(false)
      return
    }

    setIsListening(true)

    const checkAllBalances = async () => {
      // Use manual addresses if provided, otherwise fall back to wallet discovery
      const tronWallet = findWalletByChain(wallets, 'tron')
      const ethWallet = findWalletByChain(wallets, 'ethereum')
      const solWallet = findWalletByChain(wallets, 'solana')

      // Use manual addresses with priority
      const tronAddr = tronAddress || tronWallet?.address
      const ethAddr = ethereumAddress || ethWallet?.address
      const solAddr = solanaAddress || solWallet?.address

      console.log('[DepositListener] Checking balances with addresses:', {
        tron: tronAddr ? `${tronAddr.slice(0, 6)}...${tronAddr.slice(-4)}` : 'none',
        eth: ethAddr ? `${ethAddr.slice(0, 6)}...${ethAddr.slice(-4)}` : 'none',
        sol: solAddr ? `${solAddr.slice(0, 6)}...${solAddr.slice(-4)}` : 'none'
      })

      let detectedDeposit: DepositDetection | null = null

      if (chains.includes('Tron') && tronAddr) {
        const tronDeposit = await checkTronBalance(tronAddr)
        if (tronDeposit) detectedDeposit = tronDeposit
      }

      if (chains.includes('Ethereum') && ethAddr) {
        const ethDeposit = await checkEthereumBalance(ethAddr)
        if (ethDeposit) detectedDeposit = ethDeposit
      }

      if (chains.includes('Solana') && solAddr) {
        const solDeposit = await checkSolanaBalance(solAddr)
        if (solDeposit) detectedDeposit = solDeposit
      }

      if (detectedDeposit) {
        setDeposit(detectedDeposit)
      }
    }

    // 立即检查一次
    checkAllBalances()

    // 定时轮询
    const interval = setInterval(checkAllBalances, pollInterval)

    return () => {
      clearInterval(interval)
      setIsListening(false)
    }
  }, [
    enabled,
    pollInterval,
    chains,
    wallets,
    checkTronBalance,
    checkEthereumBalance,
    checkSolanaBalance,
    tronAddress,
    ethereumAddress,
    solanaAddress
  ])

  // 清除检测到的充值
  const clearDeposit = useCallback(() => {
    setDeposit(null)
  }, [])

  // 重置所有检测状态（关闭对话框时调用）
  const resetDetection = useCallback(() => {
    setDeposit(null)
    setPreviousBalances({})
    lastDetectionTime.current = 0
    console.log('[Deposit] 🔄 Detection state reset (cooldown cleared)')
  }, [])

  return {
    deposit,
    isListening,
    clearDeposit,
    resetDetection
  }
}
