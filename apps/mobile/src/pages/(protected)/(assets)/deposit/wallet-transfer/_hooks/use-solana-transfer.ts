import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit-react-native'
import { useCallback, useMemo } from 'react'

import { EXPO_ENV_CONFIG } from '@/constants/expo'
import { solanaAdapter, useAccount, useProvider } from '@/lib/appkit'
import { BNumber } from '@mullet/utils/number'
import { Connection } from '@solana/web3.js'

// 预定义不同 Solana 网络的配置（用于 fallback 防止报错，但推荐从环境变量配置 RPC，目前默认处理 USDC）
const SolanaNetworkConfig: Record<string, { rpcUrl: string; mintAddress: string }> = {
  devnet: {
    rpcUrl: 'https://api.devnet.solana.com',
    mintAddress: '4zMMC9srt5Ri5X14xA2tx3GfE61B2E3Gg7fKxQcWvC5f', // Devnet USDC (SPL Token Faucet)
  },
  testnet: {
    rpcUrl: 'https://api.testnet.solana.com',
    mintAddress: 'CpMah17kQRXHWHo8bgcp5m1Dq2a2gVnU7J9Z2Qk2fN2Z', // Testnet USDC (Example)
  },
  'mainnet-beta': {
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // Mainnet USDC
  },
}

/**
 * 自定义 Hook：处理 Solana 钱包的代币转账逻辑
 * 封装了获取钱包连接、构建交易、签名并发送的完整流程
 */
export function useSolanaTransfer() {
  // 从 AppKit 获取钱包实例（wallet provider）
  const { provider } = useProvider()
  // 获取当前连接钱包的地址
  const { address } = useAccount()

  const solanaNetworkConfig = SolanaNetworkConfig[EXPO_ENV_CONFIG.SOLANA_CLUSTER]

  // 使用环境变量中配置的 Solana RPC URL
  const connection = useMemo(() => {
    return new Connection(solanaNetworkConfig.rpcUrl, 'confirmed')
  }, [solanaNetworkConfig])

  /**
   * 执行 SPL 代币代币转账
   */
  const transferToken = useCallback(
    async ({
      fromAddress,
      toAddress,
      mintAddress,
      amount,
    }: {
      /** 发送方钱包地址（如果未传入，则使用当前连接的钱包地址） */
      fromAddress?: string
      /** 接收方钱包地址 */
      toAddress: string
      /** 代币的 Mint 合约地址（默认退回 USDC 铸币地址） */
      mintAddress?: string | null
      /** 需转账的数量（不带精度的常规数值，如 '1.5'） */
      amount: string | number
    }) => {
      if (!provider || !connection || !address) {
        throw new Error('Provider or connection is missing')
      }

      const activeFromAddress = fromAddress || (address as string)
      if (!activeFromAddress || !toAddress) {
        throw new Error('No from address or to address')
      }

      // 提取目标代币的 mintAddress（未传入时根据当前环境网络匹配合理的默认 USDC Mint 地址）
      const defaultUsdcMint = solanaNetworkConfig?.mintAddress
      const finalMintAddress = mintAddress || defaultUsdcMint

      console.log('====== SOLANA 钱包转账调试 ======')
      console.log('[发起地址]:', activeFromAddress)
      console.log('[收款地址]:', toAddress)
      console.log('[转账原始数量]:', amount)
      console.log('[Token Mint]:', finalMintAddress)
      console.log('-> 正在唤起 AppKit 原生 solanaAdapter 进行组装和签名...')

      try {
        const activeNetwork = (() => {
          if (EXPO_ENV_CONFIG.SOLANA_CLUSTER === 'devnet') return solanaDevnet
          if (EXPO_ENV_CONFIG.SOLANA_CLUSTER === 'testnet') return solanaTestnet
          return solana
        })()

        const txSignature = await solanaAdapter.sendTransaction({
          fromAddress: activeFromAddress,
          toAddress: toAddress,
          amount: BNumber.from(amount).toNumber(),
          network: activeNetwork,
          rpcUrl: solanaNetworkConfig.rpcUrl,
          tokenMint: finalMintAddress,
        })

        console.log('🎉 交易上链广播成功！签名 TxID:', txSignature)

        return txSignature
      } catch (err: any) {
        console.error('❌ SolanaAdapter 发送异常:', err)
        throw err
      }
    },
    [provider, connection, address, solanaNetworkConfig],
  )

  return { transferToken, connection, provider }
}
