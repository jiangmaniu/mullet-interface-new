/**
 * deBridge API 集成服务
 * 支持 EVM 链 ↔ Solana 跨链桥接
 *
 * 功能特性：
 * 1. 统一使用 deBridge 桥接协议
 * 2. 支持所有 EVM 兼容链（ETH、BSC、Arbitrum、Polygon、Base、Optimism、HyperEVM）
 * 3. 费用低廉（固定费用 ~$2-3，通常 < 5%）
 * 4. 速度快，确认时间短
 * 5. 完整的流程控制（手动 approve、签名验证、交易广播）
 * 6. USDT 特殊处理（自动重置 allowance）
 * 7. Privy Gas 赞助支持
 *
 * API 文档：https://docs.debridge.finance/
 */

import { request } from '@/utils/request'
import { API_BASE_URL, DEBRIDGE_API_BASE_URL, TRON_API_ENDPOINTS } from '@/constants/api'

// 支持的链 ID（deBridge 格式）
export const DEBRIDGE_CHAIN_IDS = {
  TRON: 100000026, // TRON Mainnet
  ETHEREUM: 1, // Ethereum Mainnet
  SOLANA: 7565164, // Solana Mainnet
  BSC: 56, // BNB Smart Chain
  POLYGON: 137, // Polygon
  ARBITRUM: 42161, // Arbitrum One
  OPTIMISM: 10, // Optimism
  BASE: 8453, // Base
  AVALANCHE: 43114, // Avalanche C-Chain
  HYPEREVM: 999, // HyperEVM (需确认实际 chain ID)
} as const

// EVM 链配置（RPC URLs）
export const EVM_CHAIN_CONFIG: Record<string, {
  chainId: number
  name: string
  rpcUrl: string
  nativeCurrency: string
}> = {
  Ethereum: {
    chainId: 1,
    name: 'Ethereum',
    rpcUrl: 'https://rpc.ankr.com/eth/0935b8711b527426dac2e2431d0b1ed85200be5d7034988fda8c718e3caa4374',
    nativeCurrency: 'ETH'
  },
  BSC: {
    chainId: 56,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://rpc.ankr.com/bsc/0935b8711b527426dac2e2431d0b1ed85200be5d7034988fda8c718e3caa4374',
    nativeCurrency: 'BNB'
  },
  Polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://rpc.ankr.com/polygon/0935b8711b527426dac2e2431d0b1ed85200be5d7034988fda8c718e3caa4374',
    nativeCurrency: 'MATIC'
  },
  Arbitrum: {
    chainId: 42161,
    name: 'Arbitrum One',
    rpcUrl: 'https://rpc.ankr.com/arbitrum/0935b8711b527426dac2e2431d0b1ed85200be5d7034988fda8c718e3caa4374',
    nativeCurrency: 'ETH'
  },
  Optimism: {
    chainId: 10,
    name: 'Optimism',
    rpcUrl: 'https://rpc.ankr.com/optimism/0935b8711b527426dac2e2431d0b1ed85200be5d7034988fda8c718e3caa4374',
    nativeCurrency: 'ETH'
  },
  Base: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://rpc.ankr.com/base/0935b8711b527426dac2e2431d0b1ed85200be5d7034988fda8c718e3caa4374',
    nativeCurrency: 'ETH'
  },
  Avalanche: {
    chainId: 43114,
    name: 'Avalanche C-Chain',
    rpcUrl: 'https://rpc.ankr.com/avalanche/0935b8711b527426dac2e2431d0b1ed85200be5d7034988fda8c718e3caa4374',
    nativeCurrency: 'AVAX'
  },
  HyperEVM: {
    chainId: 999, // 需确认实际 chain ID
    name: 'HyperEVM',
    rpcUrl: 'https://rpc.hyperliquid.xyz/evm',
    nativeCurrency: 'HYPE'
  }
}

// Token 地址映射（各链上的稳定币地址）
export const DEBRIDGE_TOKENS: Record<string, { USDT?: string; USDC?: string }> = {
  TRON: {
    USDT: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    USDC: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8'
  },
  Ethereum: {
    USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
  },
  BSC: {
    USDT: '0x55d398326f99059ff775485246999027b3197955', // BSC USDT
    USDC: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'  // BSC USDC
  },
  Polygon: {
    USDT: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // Polygon USDT
    USDC: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359'  // Polygon USDC (native)
  },
  Arbitrum: {
    USDT: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', // Arbitrum USDT
    USDC: '0xaf88d065e77c8cc2239327c5edb3a432268e5831'  // Arbitrum USDC (native)
  },
  Optimism: {
    USDT: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', // Optimism USDT
    USDC: '0x0b2c639c533813f4aa9d7837caf62653d097ff85'  // Optimism USDC (native)
  },
  Base: {
    USDC: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'  // Base USDC (native)
    // Base 没有官方 USDT
  },
  Avalanche: {
    USDT: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7', // Avalanche USDT
    USDC: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e'  // Avalanche USDC (native)
  },
  Solana: {
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT SPL
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC SPL
  }
}

/**
 * 桥接参数
 */
export interface DeBridgeParams {
  srcChainId: number
  dstChainId: number
  srcChainTokenIn: string
  srcChainTokenInAmount: string // 最小单位格式（如 USDT 6 decimals: "26000000"）
  dstChainTokenOut: string
  dstChainTokenOutRecipient: string
  srcChainOrderAuthorityAddress?: string
  dstChainOrderAuthorityAddress?: string
  affiliateFeePercent?: number // 0-5, 默认 0
  affiliateFeeRecipient?: string
  senderAddress?: string
  prependOperatingExpenses?: boolean
}

/**
 * 桥接报价结果
 */
export interface DeBridgeQuote {
  estimation: {
    srcChainTokenIn: {
      address: string
      symbol: string
      decimals: number
      amount: string
      approximateOperatingExpense: string
    }
    srcChainTokenOut: {
      address: string
      symbol: string
      decimals: number
      amount: string
      maxRefundAmount: string
    }
    dstChainTokenOut: {
      address: string
      symbol: string
      decimals: number
      amount: string
      recommendedAmount: string
      maxTheoreticalAmount: string
    }
  }
  tx: {
    to?: string
    data: string
    value: string
    allowanceTarget: string
    allowanceValue: string
  }
  order: {
    approximateFulfillmentDelay: number // 秒
  }
  fixFee: string
  orderId?: string
}

/**
 * 订单状态
 */
export interface DeBridgeOrderStatus {
  orderId: string
  status: 'Created' | 'Fulfilled' | 'SentUnlock' | 'OrderCancelled' | 'ClaimedUnlock'
  give: {
    chainId: number
    tokenAddress: string
    amount: string
  }
  take: {
    chainId: number
    tokenAddress: string
    amount: string
  }
  createdAt: string
  fulfilledAt?: string
}

/**
 * 获取跨链桥接报价
 */
export async function getDeBridgeQuote(params: DeBridgeParams): Promise<DeBridgeQuote> {
  const {
    srcChainId,
    dstChainId,
    srcChainTokenIn,
    srcChainTokenInAmount,
    dstChainTokenOut,
    dstChainTokenOutRecipient,
    srcChainOrderAuthorityAddress,
    dstChainOrderAuthorityAddress,
    affiliateFeePercent = 0,
    affiliateFeeRecipient
  } = params

  try {
    // Check minimum amount (deBridge has high fixed fees for small amounts)
    const MIN_AMOUNT_6_DECIMALS = 10_000_000 // 10 USD
    const amountNum = parseInt(srcChainTokenInAmount)

    if (amountNum < MIN_AMOUNT_6_DECIMALS) {
      const amountUSD = amountNum / 1_000_000
      throw new Error(
        `Amount too small for cross-chain bridge. Minimum: $10 USD, Your amount: $${amountUSD.toFixed(2)} USD. ` +
          `deBridge has fixed fees of ~$2-3, making small amounts uneconomical (fees can be 50%+).`
      )
    }

    console.log('[deBridge] Getting bridge quote:', {
      srcChainId,
      dstChainId,
      srcChainTokenIn,
      srcChainTokenInAmount,
      dstChainTokenOut
    })

    const url = new URL(`${DEBRIDGE_API_BASE_URL}/dln/order/quote`)
    url.searchParams.append('srcChainId', srcChainId.toString())
    url.searchParams.append('srcChainTokenIn', srcChainTokenIn)
    url.searchParams.append('srcChainTokenInAmount', srcChainTokenInAmount)
    url.searchParams.append('dstChainId', dstChainId.toString())
    url.searchParams.append('dstChainTokenOut', dstChainTokenOut)
    url.searchParams.append('dstChainTokenOutRecipient', dstChainTokenOutRecipient)

    if (srcChainOrderAuthorityAddress) {
      url.searchParams.append('srcChainOrderAuthorityAddress', srcChainOrderAuthorityAddress)
    }

    if (dstChainOrderAuthorityAddress) {
      url.searchParams.append('dstChainOrderAuthorityAddress', dstChainOrderAuthorityAddress)
    }

    if (affiliateFeePercent > 0 && affiliateFeeRecipient) {
      url.searchParams.append('affiliateFeePercent', affiliateFeePercent.toString())
      url.searchParams.append('affiliateFeeRecipient', affiliateFeeRecipient)
    }

    console.log('[deBridge] Request URL:', url.toString())

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`deBridge API error: ${response.status} ${errorText}`)
    }

    const result: DeBridgeQuote = await response.json()

    console.log('[deBridge] Quote received:', {
      srcAmount: result.estimation.srcChainTokenIn.amount,
      dstAmount: result.estimation.dstChainTokenOut.recommendedAmount,
      delay: result.order.approximateFulfillmentDelay
    })

    return result
  } catch (error) {
    console.error('[deBridge] Failed to get bridge quote:', error)
    throw new Error(`Failed to get deBridge quote: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 查询订单状态
 */
export async function getDeBridgeOrderStatus(orderId: string): Promise<DeBridgeOrderStatus> {
  try {
    console.log('[deBridge] Getting order status:', orderId)

    const response = await fetch(`${DEBRIDGE_API_BASE_URL}/dln/order/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`deBridge API error: ${response.status} ${errorText}`)
    }

    const result: DeBridgeOrderStatus = await response.json()

    console.log('[deBridge] Order status:', {
      orderId: result.orderId,
      status: result.status,
      fulfilledAt: result.fulfilledAt
    })

    return result
  } catch (error) {
    console.error('[deBridge] Failed to get order status:', error)
    throw new Error(`Failed to get deBridge order status: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 创建带 Gas 赞助的桥接订单（Ethereum）
 * 使用用户钱包签名，Gas 由 Privy/后端赞助
 */
export async function createDeBridgeOrderEthereum(
  quote: DeBridgeQuote,
  sendTransaction: (params: any) => Promise<{ transactionHash: string }>,
  fromAddress: string
): Promise<{ txHash: string; orderId?: string }> {
  try {
    console.log('[deBridge] Creating Ethereum bridge order with gas sponsorship...')

    // 使用 Privy sendTransaction (自动处理 gas sponsorship)
    const result = await sendTransaction({
      to: quote.tx.to || quote.tx.allowanceTarget,
      data: quote.tx.data as `0x${string}`,
      value: BigInt(quote.tx.value || '0')
    })

    console.log('[deBridge] Bridge transaction sent:', result.transactionHash)

    return {
      txHash: result.transactionHash,
      orderId: quote.orderId
    }
  } catch (error) {
    console.error('[deBridge] Failed to create Ethereum bridge order:', error)
    throw new Error(`Failed to create bridge order: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 创建带 Gas 赞助的桥接订单（Solana）
 * 使用 Privy 的 signAndSendTransaction 和 sponsor 选项
 */
export async function createDeBridgeOrderSolana(
  quote: DeBridgeQuote,
  solanaWallet: any,
  connection: any
): Promise<{ txHash: string; orderId?: string }> {
  try {
    console.log('[deBridge-Solana] Creating Solana bridge order with gas sponsorship...')

    // 从 quote 中获取交易数据
    if (!quote.tx.data) {
      throw new Error('No transaction data in quote')
    }

    // quote.tx.data 是 base64 编码的 Solana 交易
    const transactionBuffer = Buffer.from(quote.tx.data, 'base64')
    const transaction = new Uint8Array(transactionBuffer)

    console.log('[deBridge-Solana] Transaction size:', transaction.length, 'bytes')

    // 使用 Privy 的 signAndSendTransaction 发送交易（支持 gas sponsorship）
    // 注意：这需要使用 @privy-io/react-auth/solana 的 useSignAndSendTransaction hook
    // 在实际使用时需要从组件中传入 signAndSendTransaction 函数
    if (!solanaWallet.signAndSendTransaction) {
      throw new Error('Solana wallet does not support signAndSendTransaction')
    }

    const result = await solanaWallet.signAndSendTransaction({
      transaction: transaction,
      wallet: solanaWallet,
      options: {
        sponsor: true // Enable gas sponsorship
      }
    })

    console.log('[deBridge-Solana] ✅ Transaction sent:', result.signature)

    return {
      txHash: result.signature,
      orderId: quote.orderId
    }
  } catch (error) {
    console.error('[deBridge-Solana] Failed to create Solana bridge order:', error)
    throw new Error(`Failed to create bridge order: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 创建 TRON 桥接订单（使用 Privy 嵌入式钱包）
 * 支持 Gas 赞助功能
 */
export async function createDeBridgeOrderTron(
  quote: DeBridgeQuote,
  tokenAddress: string,
  amount: string,
  fromAddress: string,
  ethereumAddress: string,
  walletId: string,
  publicKey: string,
  accessToken: string,
  useGasSponsorship: boolean = true
): Promise<{ txHash: string; orderId: string; dstChainTokenOutAmount: string }> {
  try {
    console.log('[deBridge-TRON] Creating bridge order...')
    console.log('[deBridge-TRON] Token:', tokenAddress)
    console.log('[deBridge-TRON] From:', fromAddress)
    console.log('[deBridge-TRON] Gas sponsorship:', useGasSponsorship ? 'Enabled ✅' : 'Disabled')

    // 动态导入 TronWeb
    const { TronWeb } = await import('tronweb')
    const tronWeb = new TronWeb({
      fullHost: 'https://rpc.ankr.com/premium-http/tron/0935b8711b527426dac2e2431d0b1ed85200be5d7034988fda8c718e3caa4374'
    })

    const DLN_SOURCE_ADDRESS = tronWeb.address.fromHex(quote.tx.allowanceTarget)

    // Step 1: Check and approve token
    console.log('[deBridge-TRON] Step 1: Checking token allowance...')

    const tokenContract = await tronWeb.contract().at(tokenAddress)
    const allowance = await tokenContract.allowance(fromAddress, DLN_SOURCE_ADDRESS).call({ from: fromAddress })

    console.log('[deBridge-TRON] Current allowance:', allowance.toString())
    console.log('[deBridge-TRON] Required allowance:', amount)

    if (BigInt(allowance.toString()) < BigInt(amount)) {
      console.log('[deBridge-TRON] Insufficient allowance, creating approve transaction...')

      const parameter = [
        { type: 'address', value: DLN_SOURCE_ADDRESS },
        { type: 'uint256', value: amount }
      ]

      const approveTransaction = await tronWeb.transactionBuilder.triggerSmartContract(
        tokenAddress,
        'approve(address,uint256)',
        { feeLimit: 50_000_000, callValue: 0 },
        parameter,
        fromAddress
      )

      if (!approveTransaction.result?.result) {
        throw new Error('Failed to build approve transaction')
      }

      console.log('[deBridge-TRON] Signing approve tx via backend...')

      const approveTxObject = approveTransaction.transaction
      const approveTxID = approveTxObject.txID

      // 使用 fetch 而不是 request，避免自动添加 Blade-Auth header
      const signResponse = await fetch(TRON_API_ENDPOINTS.SIGN_TRANSACTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          walletId,
          transactionHash: approveTxID,
          publicKey
        })
      })

      if (!signResponse.ok) {
        const errorText = await signResponse.text()
        throw new Error(`Approval failed: ${errorText}`)
      }

      const signData = await signResponse.json()
      const signature64 = signData.signature
      const signature64Clean = signature64.startsWith('0x') ? signature64.slice(2) : signature64

      console.log('[deBridge-TRON] Testing recovery IDs for approve signature...')

      // Test recovery ID '1b' first
      approveTxObject.signature = [signature64Clean + '1b']
      let recoveredAddress1b
      try {
        recoveredAddress1b = tronWeb.trx.ecRecover(approveTxObject)
        console.log('[deBridge-TRON] Approve recovery (1b):', {
          fromAddress,
          recovered: recoveredAddress1b,
          match: recoveredAddress1b === fromAddress
        })
      } catch (e) {
        console.error('[deBridge-TRON] Approve recovery (1b) failed:', e)
        recoveredAddress1b = null
      }

      // If '1b' doesn't match, try '1c'
      if (recoveredAddress1b !== fromAddress) {
        approveTxObject.signature = [signature64Clean + '1c']
        let recoveredAddress1c
        try {
          recoveredAddress1c = tronWeb.trx.ecRecover(approveTxObject)
          console.log('[deBridge-TRON] Approve recovery (1c):', {
            fromAddress,
            recovered: recoveredAddress1c,
            match: recoveredAddress1c === fromAddress
          })

          if (recoveredAddress1c !== fromAddress) {
            throw new Error('Approve signature recovery failed - address mismatch')
          }
        } catch (e) {
          console.error('[deBridge-TRON] Approve recovery (1c) failed:', e)
          throw new Error('Approve signature recovery failed with both recovery IDs')
        }
      }

      console.log('[deBridge-TRON] ✅ Approve signature verified, broadcasting...')

      // Broadcast transaction
      const approveResult = await tronWeb.trx.sendRawTransaction(approveTxObject)

      if (!approveResult.result) {
        throw new Error(`Approve transaction failed: ${JSON.stringify(approveResult)}`)
      }

      console.log('[deBridge-TRON] ✅ Approve tx:', approveResult.txid)

      // Wait for confirmation
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }

    // Step 2: Create order transaction
    console.log('[deBridge-TRON] Step 2: Creating order transaction...')

    const createTxUrl = new URL(`${DEBRIDGE_API_BASE_URL}/dln/order/create-tx`)
    createTxUrl.searchParams.append('srcChainId', DEBRIDGE_CHAIN_IDS.TRON.toString())
    createTxUrl.searchParams.append('srcChainTokenIn', tokenAddress)
    createTxUrl.searchParams.append('srcChainTokenInAmount', amount)
    createTxUrl.searchParams.append('dstChainId', '1')
    createTxUrl.searchParams.append('dstChainTokenOut', quote.estimation.dstChainTokenOut.address)
    createTxUrl.searchParams.append('dstChainTokenOutRecipient', ethereumAddress)
    createTxUrl.searchParams.append('srcChainOrderAuthorityAddress', fromAddress)
    createTxUrl.searchParams.append('dstChainOrderAuthorityAddress', ethereumAddress)
    createTxUrl.searchParams.append('prependOperatingExpenses', 'false')

    const createTxResponse = await fetch(createTxUrl.toString())
    if (!createTxResponse.ok) {
      throw new Error(`Failed to get transaction data: ${createTxResponse.status}`)
    }

    const txData = (await createTxResponse.json()) as any
    
    console.log('[deBridge-TRON] ========== CREATE-TX API RESPONSE ==========')
    console.log('[deBridge-TRON] Full response:', JSON.stringify(txData, null, 2))
    console.log('[deBridge-TRON] Available fields:', Object.keys(txData))
    console.log('[deBridge-TRON] ===========================================')
    
    if (!txData.tx?.data) {
      console.error('[deBridge-TRON] Missing tx.data in response!')
      throw new Error('No transaction data in response')
    }

    const orderId = txData.orderId
    const dstChainTokenOutAmount = txData.estimation?.dstChainTokenOut?.recommendedAmount || 
                                   txData.estimation?.dstChainTokenOut?.amount || 
                                   '0'
    
    console.log('[deBridge-TRON] Extracted Order ID:', orderId || '❌ NULL/UNDEFINED')
    console.log('[deBridge-TRON] Extracted Dst amount:', dstChainTokenOutAmount)

    if (!orderId) {
      console.error('[deBridge-TRON] ⚠️⚠️⚠️ CRITICAL: No orderId in API response!')
      console.error('[deBridge-TRON] This will prevent order tracking.')
      console.error('[deBridge-TRON] Possible reasons:')
      console.error('[deBridge-TRON]   1. deBridge API changed response format')
      console.error('[deBridge-TRON]   2. Wrong API endpoint or parameters')
      console.error('[deBridge-TRON]   3. Order not created yet (async processing)')
    }

    // Build transaction
    const fullCallData = txData.tx.data.startsWith('0x') ? txData.tx.data.slice(2) : txData.tx.data
    const callValue = parseInt(txData.tx.value || '0')

    const baseTransaction = await tronWeb.transactionBuilder.triggerSmartContract(
      DLN_SOURCE_ADDRESS,
      'fallback()',
      { feeLimit: 50_000_000, callValue },
      [],
      fromAddress
    )

    if (!baseTransaction.result?.result) {
      throw new Error('Failed to create base transaction')
    }

    const txObject = baseTransaction.transaction

    // Inject calldata
    if (txObject.raw_data?.contract?.[0]?.parameter?.value) {
      txObject.raw_data.contract[0].parameter.value.data = fullCallData
    }

    // Recalculate txID
    const txPb = tronWeb.utils.transaction.txJsonToPb(txObject)
    const rawDataBytes = txPb.getRawData().serializeBinary()
    const newRawDataHex = tronWeb.utils.code.byteArray2hexStr(rawDataBytes)
    txObject.raw_data_hex = newRawDataHex

    const txHash = tronWeb.utils.crypto.SHA256(rawDataBytes)
    const newTxID = tronWeb.utils.code.byteArray2hexStr(txHash)
    txObject.txID = newTxID

    console.log('[deBridge-TRON] Signing order tx via backend...')
    console.log('[deBridge-TRON] Transaction ID:', newTxID)

    // 使用 fetch 而不是 request，避免自动添加 Blade-Auth header
    const signResponse = await fetch(TRON_API_ENDPOINTS.SIGN_TRANSACTION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        walletId,
        transactionHash: newTxID,
        publicKey
      })
    })

    if (!signResponse.ok) {
      const errorText = await signResponse.text()
      throw new Error(`Order creation failed: ${errorText}`)
    }

    const signData = await signResponse.json()
    const signature64 = signData.signature
    const signature64Clean = signature64.startsWith('0x') ? signature64.slice(2) : signature64

    console.log('[deBridge-TRON] Testing recovery IDs for order signature...')

    // Test recovery ID '1b' first
    txObject.signature = [signature64Clean + '1b']
    let recoveredAddress1b
    try {
      recoveredAddress1b = tronWeb.trx.ecRecover(txObject)
      console.log('[deBridge-TRON] Order recovery (1b):', {
        fromAddress,
        recovered: recoveredAddress1b,
        match: recoveredAddress1b === fromAddress
      })
    } catch (e) {
      console.error('[deBridge-TRON] Order recovery (1b) failed:', e)
      recoveredAddress1b = null
    }

    // If '1b' doesn't match, try '1c'
    if (recoveredAddress1b !== fromAddress) {
      txObject.signature = [signature64Clean + '1c']
      let recoveredAddress1c
      try {
        recoveredAddress1c = tronWeb.trx.ecRecover(txObject)
        console.log('[deBridge-TRON] Order recovery (1c):', {
          fromAddress,
          recovered: recoveredAddress1c,
          match: recoveredAddress1c === fromAddress
        })

        if (recoveredAddress1c !== fromAddress) {
          throw new Error('Order signature recovery failed - address mismatch')
        }
      } catch (e) {
        console.error('[deBridge-TRON] Order recovery (1c) failed:', e)
        throw new Error('Order signature recovery failed with both recovery IDs')
      }
    }

    console.log('[deBridge-TRON] ✅ Order signature verified, broadcasting...')

    // Broadcast transaction
    const orderResult = await tronWeb.trx.sendRawTransaction(txObject)

    if (!orderResult.result) {
      throw new Error(`Order transaction failed: ${JSON.stringify(orderResult)}`)
    }

    console.log('[deBridge-TRON] ✅ Order tx:', orderResult.txid)

    return {
      txHash: orderResult.txid,
      orderId: orderId || '',
      dstChainTokenOutAmount
    }
  } catch (error) {
    console.error('[deBridge-TRON] Failed:', error)
    throw new Error(`TRON bridge failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 等待订单完成
 */
export async function waitForOrderCompletion(
  orderId: string,
  maxWaitTime: number = 600000, // 默认 10 分钟
  pollInterval: number = 10000 // 每 10 秒检查一次
): Promise<DeBridgeOrderStatus> {
  const startTime = Date.now()

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const status = await getDeBridgeOrderStatus(orderId)
      console.log(`[deBridge] Order ${orderId} status: ${status.status}`)

      if (status.status === 'Fulfilled' || status.status === 'SentUnlock') {
        console.log('[deBridge] ✅ Order completed successfully!')
        return status
      }

      if (status.status === 'OrderCancelled') {
        throw new Error('Order was cancelled')
      }
    } catch (error) {
      console.warn('[deBridge] Status check failed:', error)
    }

    // 等待后重试
    await new Promise((resolve) => setTimeout(resolve, pollInterval))
  }

  throw new Error('Order completion timeout')
}

/**
 * 通用 TRON → EVM 链桥接
 * 支持 TRON → Ethereum、BSC、Polygon、Arbitrum 等所有 EVM 兼容链
 *
 * @param params.targetChain - 目标 EVM 链名称 (Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Avalanche)
 * @param params.tokenAddress - TRON token 地址 (如 TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t for USDT)
 * @param params.amount - 转账金额（最小单位，如 20000000 = 20 USDT）
 * @param params.fromAddress - TRON 钱包地址
 * @param params.evmAddress - 目标 EVM 链接收地址
 * @param params.walletId - Privy wallet ID
 * @param params.publicKey - Wallet public key (可选)
 * @param params.accessToken - Privy access token
 * @param params.useGasSponsorship - 是否使用 Gas 赞助（默认 true）
 * @returns 交易哈希、订单ID、目标链金额
 */
export async function bridgeTronToEvm(params: {
  targetChain: string // Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Avalanche
  tokenAddress: string
  amount: string
  fromAddress: string
  evmAddress: string
  walletId: string
  publicKey: string
  accessToken: string
  useGasSponsorship?: boolean
}): Promise<{ txHash: string; orderId: string; dstChainTokenOutAmount: string }> {
  const { targetChain } = params
  
  // 获取目标链配置
  const chainConfig = EVM_CHAIN_CONFIG[targetChain]
  if (!chainConfig) {
    throw new Error(`Unsupported target chain: ${targetChain}. Supported: ${Object.keys(EVM_CHAIN_CONFIG).join(', ')}`)
  }

  console.log(`[deBridge] Bridge: TRON → ${targetChain}`)

  // 获取目标链的 token 地址
  const targetChainTokens = DEBRIDGE_TOKENS[targetChain]
  if (!targetChainTokens) {
    throw new Error(`No token configuration for chain: ${targetChain}`)
  }

  // 根据源链 token 地址，映射到目标链的对应 token（保持相同类型）
  let dstTokenAddress: string
  const srcTokenUpper = params.tokenAddress.toUpperCase()
  const tronTokens = DEBRIDGE_TOKENS.TRON

  if (tronTokens?.USDT && srcTokenUpper === tronTokens.USDT.toUpperCase()) {
    // USDT → USDT (如果目标链有 USDT)
    dstTokenAddress = targetChainTokens.USDT || targetChainTokens.USDC || ''
    if (!dstTokenAddress) throw new Error(`${targetChain} does not support USDT or USDC`)
  } else if (tronTokens?.USDC && srcTokenUpper === tronTokens.USDC.toUpperCase()) {
    // USDC → USDC
    dstTokenAddress = targetChainTokens.USDC || targetChainTokens.USDT || ''
    if (!dstTokenAddress) throw new Error(`${targetChain} does not support USDC or USDT`)
  } else {
    throw new Error(`Unsupported TRON token address: ${params.tokenAddress}`)
  }

  console.log('[deBridge] Token mapping:', {
    src: params.tokenAddress,
    srcChain: 'TRON',
    dst: dstTokenAddress,
    dstChain: targetChain,
    note: `TRON→${targetChain} auto-maps to available stablecoin`
  })

  // 1. 获取报价
  const quote = await getDeBridgeQuote({
    srcChainId: DEBRIDGE_CHAIN_IDS.TRON,
    srcChainTokenIn: params.tokenAddress,
    srcChainTokenInAmount: params.amount,
    dstChainId: chainConfig.chainId,
    dstChainTokenOut: dstTokenAddress,
    dstChainTokenOutRecipient: params.evmAddress,
    srcChainOrderAuthorityAddress: params.fromAddress,
    dstChainOrderAuthorityAddress: params.evmAddress,
    prependOperatingExpenses: false
  })

  // 2. 创建订单
  return await createDeBridgeOrderTron(
    quote,
    params.tokenAddress,
    params.amount,
    params.fromAddress,
    params.evmAddress,
    params.walletId,
    params.publicKey,
    params.accessToken,
    params.useGasSponsorship ?? true
  )
}

/**
 * 通用 EVM 链 → Solana 桥接
 * 支持 Ethereum、BSC、Polygon、Arbitrum、Optimism、Base、Avalanche 等 EVM 兼容链
 * 
 * @param params.chainName - 源链名称 (Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Avalanche)
 * @param params.tokenAddress - 源链 token 地址 (USDC/USDT)
 * @param params.amount - 转账金额（最小单位，如 20000000 = 20 USDC）
 * @param params.solanaAddress - Solana 接收地址
 * @param params.privyWallet - Privy EVM 钱包对象
 * @param params.sendTransaction - Privy Gas 赞助函数
 * @returns 交易哈希、订单ID
 */
export async function bridgeEvmToSolana(params: {
  chainName: string // Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Avalanche
  tokenAddress: string
  amount: string
  solanaAddress: string
  privyWallet: any
  sendTransaction: (tx: any) => Promise<{ hash: string }>
}): Promise<{ txHash: string; orderId?: string }> {
  const { chainName, tokenAddress, amount, solanaAddress, privyWallet, sendTransaction } = params
  
  // 获取链配置
  const chainConfig = EVM_CHAIN_CONFIG[chainName]
  if (!chainConfig) {
    throw new Error(`Unsupported chain: ${chainName}. Supported chains: ${Object.keys(EVM_CHAIN_CONFIG).join(', ')}`)
  }

  console.log(`[deBridge] Bridge: ${chainName} → Solana`)
  console.log(`[deBridge-EVM] Chain: ${chainName} (chainId: ${chainConfig.chainId})`)
  console.log('[deBridge-EVM] 🔍 Wallet address:', privyWallet?.address)
  console.log('[deBridge-EVM] 🔍 Token address:', tokenAddress)
  console.log('[deBridge-EVM] 🔍 Amount:', amount)

  // 🔥 关键：目标链 Solana 始终使用 USDC（流动性更好）
  const dstTokenAddress = DEBRIDGE_TOKENS.Solana?.USDC
  if (!dstTokenAddress) {
    throw new Error('Solana USDC address not configured')
  }

  // 验证源 token 是支持的稳定币
  const chainTokens = DEBRIDGE_TOKENS[chainName]
  const srcTokenLower = tokenAddress.toLowerCase()
  const isValidToken = chainTokens && (
    (chainTokens.USDT && srcTokenLower === chainTokens.USDT.toLowerCase()) ||
    (chainTokens.USDC && srcTokenLower === chainTokens.USDC.toLowerCase())
  )

  if (!isValidToken) {
    throw new Error(`Unsupported token address on ${chainName}: ${tokenAddress}`)
  }

  console.log('[deBridge-EVM] Token mapping:', {
    src: tokenAddress,
    srcChain: chainName,
    dst: dstTokenAddress,
    dstChain: 'Solana',
    note: 'Solana always uses USDC (better liquidity)'
  })

  // 动态导入 viem
  const { createPublicClient, http, encodeFunctionData, defineChain } = await import('viem')

  // 创建自定义链配置
  const customChain = defineChain({
    id: chainConfig.chainId,
    name: chainConfig.name,
    nativeCurrency: {
      decimals: 18,
      name: chainConfig.nativeCurrency,
      symbol: chainConfig.nativeCurrency,
    },
    rpcUrls: {
      default: { http: [chainConfig.rpcUrl] },
    },
  })

  // 创建 public client 用于读取链上数据
  const publicClient = createPublicClient({
    chain: customChain,
    transport: http(chainConfig.rpcUrl)
  })

  console.log(`[deBridge-EVM] Using Privy Gas Sponsorship on ${chainName}`)

  // ERC20 ABI
  const ERC20_ABI = [
    {
      name: 'approve',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: [{ name: '', type: 'bool' }]
    },
    {
      name: 'allowance',
      type: 'function',
      stateMutability: 'view',
      inputs: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' }
      ],
      outputs: [{ name: '', type: 'uint256' }]
    }
  ] as const

  // 1. 获取报价
  const quote = await getDeBridgeQuote({
    srcChainId: chainConfig.chainId,
    srcChainTokenIn: tokenAddress,
    srcChainTokenInAmount: amount,
    dstChainId: DEBRIDGE_CHAIN_IDS.SOLANA,
    dstChainTokenOut: dstTokenAddress,
    dstChainTokenOutRecipient: solanaAddress,
    srcChainOrderAuthorityAddress: privyWallet.address,
    dstChainOrderAuthorityAddress: solanaAddress,
    prependOperatingExpenses: false
  })

  console.log('[deBridge-EVM] Quote received:', {
    srcAmount: quote.estimation.srcChainTokenIn.amount,
    dstAmount: quote.estimation.dstChainTokenOut.recommendedAmount,
    orderId: quote.orderId,
    allowanceTarget: quote.tx.allowanceTarget,
    allowanceValue: quote.tx.allowanceValue
  })

  // 2. 检查当前 allowance
  console.log('[deBridge-EVM] Checking current allowance...')
  const currentAllowance = (await publicClient.readContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [privyWallet.address as `0x${string}`, quote.tx.allowanceTarget as `0x${string}`]
  })) as bigint

  console.log('[deBridge-EVM] Current allowance:', currentAllowance.toString())
  console.log('[deBridge-EVM] Required amount:', amount)

  // 3. 如果需要，进行 approve
  if (currentAllowance < BigInt(amount)) {
    console.log('[deBridge-EVM] Insufficient allowance, requesting approval...')

    try {
      // 🔥 USDT 特殊处理：Ethereum 和 BSC 上的 USDT 如果当前 allowance > 0，必须先重置为 0
      const isEthereumUSDT = chainName === 'Ethereum' && srcTokenLower === '0xdac17f958d2ee523a2206206994597c13d831ec7'
      
      if (isEthereumUSDT && currentAllowance > BigInt(0)) {
        console.log('[deBridge-EVM] ⚠️ Ethereum USDT detected with existing allowance, resetting to 0 first...')

        const resetApproveData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [quote.tx.allowanceTarget as `0x${string}`, BigInt(0)]
        })

        const resetTxResult = await sendTransaction({
          to: tokenAddress as `0x${string}`,
          data: resetApproveData as `0x${string}`,
          chainId: chainConfig.chainId,
          sponsorGas: true
        })

        console.log('[deBridge-EVM] ✅ Reset approval tx sent:', resetTxResult.hash)

        const resetReceipt = await publicClient.waitForTransactionReceipt({
          hash: resetTxResult.hash as `0x${string}`,
          timeout: 180_000
        })

        if (resetReceipt.status === 'reverted') {
          throw new Error('Reset approval transaction failed')
        }

        console.log('[deBridge-EVM] ✅ Reset approval confirmed')
      }

      // 正式 approve
      console.log('[deBridge-EVM] Sending approval transaction...')
      const approveData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [quote.tx.allowanceTarget as `0x${string}`, BigInt(quote.tx.allowanceValue)]
      })

      const approveTxResult = await sendTransaction({
        to: tokenAddress as `0x${string}`,
        data: approveData as `0x${string}`,
        chainId: chainConfig.chainId,
        sponsorGas: true
      })

      console.log('[deBridge-EVM] ✅ Approval tx sent:', approveTxResult.hash)

      const approveReceipt = await publicClient.waitForTransactionReceipt({
        hash: approveTxResult.hash as `0x${string}`,
        timeout: 180_000
      })

      if (approveReceipt.status === 'reverted') {
        throw new Error('Token approval transaction failed')
      }

      console.log('[deBridge-EVM] ✅ Approval confirmed:', approveReceipt.transactionHash)
    } catch (error) {
      console.error('[deBridge-EVM] Approval failed:', error)
      throw new Error(`Token approval failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  } else {
    console.log('[deBridge-EVM] ✅ Sufficient allowance, skipping approval')
  }

  // 4. 创建桥接订单
  console.log('[deBridge-EVM] Creating bridge order...')

  try {
    // 调用 create-tx API 获取 orderId
    const createTxUrl = new URL(`${DEBRIDGE_API_BASE_URL}/dln/order/create-tx`)
    createTxUrl.searchParams.append('srcChainId', chainConfig.chainId.toString())
    createTxUrl.searchParams.append('srcChainTokenIn', tokenAddress)
    createTxUrl.searchParams.append('srcChainTokenInAmount', amount)
    createTxUrl.searchParams.append('dstChainId', DEBRIDGE_CHAIN_IDS.SOLANA.toString())
    createTxUrl.searchParams.append('dstChainTokenOut', dstTokenAddress)
    createTxUrl.searchParams.append('dstChainTokenOutRecipient', solanaAddress)
    createTxUrl.searchParams.append('srcChainOrderAuthorityAddress', privyWallet.address)
    createTxUrl.searchParams.append('dstChainOrderAuthorityAddress', solanaAddress)
    createTxUrl.searchParams.append('prependOperatingExpenses', 'false')

    console.log('[deBridge-EVM] create-tx URL:', createTxUrl.toString())

    const createTxResponse = await fetch(createTxUrl.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' }
    })

    if (!createTxResponse.ok) {
      const errorText = await createTxResponse.text()
      throw new Error(`DeBridge create-tx API error: ${createTxResponse.status} ${errorText}`)
    }

    const txData = (await createTxResponse.json()) as any
    console.log('[deBridge-EVM] Transaction data received')
    console.log('[deBridge-EVM] - Order ID:', txData.orderId || 'NOT_AVAILABLE')

    if (!txData.tx || !txData.tx.to || !txData.tx.data) {
      throw new Error('DeBridge API did not return valid transaction data')
    }

    const orderId = txData.orderId
    const dstChainTokenOutAmount =
      txData.estimation?.dstChainTokenOut?.recommendedAmount || txData.estimation?.dstChainTokenOut?.amount

    console.log('[deBridge-EVM] Expected Solana output amount:', dstChainTokenOutAmount)

    // 发送桥接交易
    const bridgeTxResult = await sendTransaction({
      to: txData.tx.to as `0x${string}`,
      from: privyWallet.address as `0x${string}`,
      data: txData.tx.data as `0x${string}`,
      value: txData.tx.value ? BigInt(txData.tx.value) : BigInt(0),
      chainId: chainConfig.chainId,
      sponsorGas: true
    })

    console.log('[deBridge-EVM] ✅ Bridge tx sent:', bridgeTxResult.hash)

    // 等待交易确认
    console.log('[deBridge-EVM] Waiting for bridge transaction confirmation...')
    const bridgeReceipt = await publicClient.waitForTransactionReceipt({
      hash: bridgeTxResult.hash as `0x${string}`,
      timeout: 180_000
    })

    if (bridgeReceipt.status === 'reverted') {
      throw new Error('Bridge transaction failed')
    }

    console.log('[deBridge-EVM] ✅ Bridge transaction confirmed:', bridgeReceipt.transactionHash)
    console.log('[deBridge-EVM] ✅ Order ID:', orderId || 'NOT_AVAILABLE')

    return {
      txHash: bridgeTxResult.hash,
      orderId: orderId
    }
  } catch (error) {
    console.error('[deBridge-EVM] Bridge transaction failed:', error)
    throw new Error(`Bridge transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * deBridge Service Wrapper
 */
export const debridgeService = {
  getDeBridgeQuote,
  getDeBridgeOrderStatus,
  createDeBridgeOrderEthereum,
  createDeBridgeOrderSolana,
  createDeBridgeOrderTron,
  waitForOrderCompletion,
  bridgeTronToEvm, // 🔥 通用：TRON → 任意 EVM 链
  bridgeEvmToSolana, // 🔥 通用：任意 EVM → Solana
  bridgeSolanaToEvm, // 🔥 通用：Solana → 任意 EVM 链
  bridgeSolanaToTron,
  // 导出链配置供外部使用
  DEBRIDGE_CHAIN_IDS,
  DEBRIDGE_TOKENS,
  EVM_CHAIN_CONFIG
}

/**
 * 通用 Solana → EVM 链桥接 (出金使用)
 * 用于将 Solana USDC 桥接到任意 EVM 链
 * 
 * @param params.targetChain - 目标 EVM 链名称 (Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Avalanche)
 * @param params.amount - USDC 金额（最小单位，6位小数）
 * @param params.evmAddress - 目标 EVM 链地址
 * @param params.solanaWallet - Privy Solana 钱包
 * @param params.signAndSendTransaction - Privy signAndSendTransaction hook
 */
async function bridgeSolanaToEvm(params: {
  targetChain: string // Ethereum, BSC, Polygon, Arbitrum, etc.
  amount: string // USDC 金额（最小单位，6位小数）
  evmAddress: string // 目标 EVM 链地址
  solanaWallet: any // Privy Solana 钱包
  signAndSendTransaction: any // Privy signAndSendTransaction hook
}): Promise<{ txHash: string; orderId: string }> {
  const { targetChain, amount, evmAddress, solanaWallet, signAndSendTransaction } = params

  // 获取目标链配置
  const chainConfig = EVM_CHAIN_CONFIG[targetChain]
  if (!chainConfig) {
    throw new Error(`Unsupported target chain: ${targetChain}. Supported: ${Object.keys(EVM_CHAIN_CONFIG).join(', ')}`)
  }

  console.log(`[deBridge-SOL→${targetChain}] 🔄 Starting Solana to ${targetChain} bridge:`, {
    amount,
    evmAddress,
    solanaWallet: solanaWallet?.address,
    targetChainId: chainConfig.chainId
  })

  // 检查最小金额
  const MIN_AMOUNT = 10_000_000 // 10 USD
  const amountNum = parseInt(amount)
  if (amountNum < MIN_AMOUNT) {
    throw new Error(`金额太小，最少需要 $10 USD（当前: $${(amountNum / 1_000_000).toFixed(2)}）`)
  }

  // 源 token: Solana USDC
  const srcTokenAddress = DEBRIDGE_TOKENS.Solana?.USDC
  if (!srcTokenAddress) {
    throw new Error('Solana USDC address not configured')
  }

  // 目标 token: 目标链 USDC (保持相同类型)
  const targetChainTokens = DEBRIDGE_TOKENS[targetChain]
  if (!targetChainTokens) {
    throw new Error(`No token configuration for chain: ${targetChain}`)
  }
  
  // 优先使用 USDC，如果没有则使用 USDT
  const dstTokenAddress = targetChainTokens.USDC || targetChainTokens.USDT
  if (!dstTokenAddress) {
    throw new Error(`${targetChain} does not support USDC or USDT`)
  }

  console.log(`[deBridge-SOL→${targetChain}] Token mapping:`, {
    src: srcTokenAddress,
    srcChain: 'Solana',
    dst: dstTokenAddress,
    dstChain: targetChain,
    note: `SOL→${targetChain} keeps same token type (USDC→USDC)`
  })

  // 1. 获取报价
  console.log(`[deBridge-SOL→${targetChain}] Requesting quote...`)
  const quote = await getDeBridgeQuote({
    srcChainId: DEBRIDGE_CHAIN_IDS.SOLANA,
    srcChainTokenIn: srcTokenAddress,
    srcChainTokenInAmount: amount,
    dstChainId: chainConfig.chainId,
    dstChainTokenOut: dstTokenAddress,
    dstChainTokenOutRecipient: evmAddress,
    srcChainOrderAuthorityAddress: solanaWallet.address,
    dstChainOrderAuthorityAddress: evmAddress,
    prependOperatingExpenses: false
  })

  console.log(`[deBridge-SOL→${targetChain}] Quote received:`, {
    srcAmount: quote.estimation.srcChainTokenIn.amount,
    dstAmount: quote.estimation.dstChainTokenOut.recommendedAmount,
    orderId: quote.orderId
  })

  // 2. 调用 create-tx API 获取 Solana 交易
  console.log(`[deBridge-SOL→${targetChain}] Calling create-tx API...`)
  
  const createTxUrl = new URL(`${DEBRIDGE_API_BASE_URL}/dln/order/create-tx`)
  createTxUrl.searchParams.append('srcChainId', DEBRIDGE_CHAIN_IDS.SOLANA.toString())
  createTxUrl.searchParams.append('srcChainTokenIn', srcTokenAddress)
  createTxUrl.searchParams.append('srcChainTokenInAmount', amount)
  createTxUrl.searchParams.append('dstChainId', chainConfig.chainId.toString())
  createTxUrl.searchParams.append('dstChainTokenOut', dstTokenAddress)
  createTxUrl.searchParams.append('dstChainTokenOutRecipient', evmAddress)
  createTxUrl.searchParams.append('srcChainOrderAuthorityAddress', solanaWallet.address)
  createTxUrl.searchParams.append('dstChainOrderAuthorityAddress', evmAddress)
  createTxUrl.searchParams.append('prependOperatingExpenses', 'false')

  console.log(`[deBridge-SOL→${targetChain}] create-tx URL:`, createTxUrl.toString())

  const createTxResponse = await fetch(createTxUrl.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  })

  if (!createTxResponse.ok) {
    const errorText = await createTxResponse.text()
    throw new Error(`DeBridge create-tx API error: ${createTxResponse.status} ${errorText}`)
  }

  const txData = (await createTxResponse.json()) as any
  console.log(`[deBridge-SOL→${targetChain}] Transaction data received`)
  console.log(`[deBridge-SOL→${targetChain}] - Order ID:`, txData.orderId || 'NOT_AVAILABLE')
  console.log(`[deBridge-SOL→${targetChain}] - Has tx data:`, !!txData.tx)

  if (!txData.tx || !txData.tx.data) {
    throw new Error('DeBridge API did not return valid Solana transaction data')
  }

  const orderId = txData.orderId || ''
  const dstChainTokenOutAmount =
    txData.estimation?.dstChainTokenOut?.recommendedAmount || txData.estimation?.dstChainTokenOut?.amount

  console.log(`[deBridge-SOL→${targetChain}] Expected ${targetChain} output amount:`, dstChainTokenOutAmount)

  // 3. 发送 Solana 交易
  console.log(`[deBridge-SOL→${targetChain}] 🔐 Signing and sending Solana transaction...`)

  try {
    // 根据 Privy 嵌入式钱包：
    // 1. txData 是 hex 格式 (0x 开头)
    // 2. 反序列化为 buffer
    // 3. 使用 Privy 的 signAndSendTransaction hook 发送
    //    这个方法支持 gas sponsorship 并正确处理序列化交易
    
    console.log(`[deBridge-SOL→${targetChain}] Transaction data:`, txData.tx.data.substring(0, 20) + '...')
    
    // deBridge 返回的 tx.data 是 hex 格式，去除 0x 前缀后转为 buffer
    const hexString = txData.tx.data.startsWith('0x') 
      ? txData.tx.data.slice(2) 
      : txData.tx.data
    const txBuffer = Buffer.from(hexString, 'hex')
    
    console.log(`[deBridge-SOL→${targetChain}] Buffer length:`, txBuffer.length)
    
    // 使用 Privy 的 signAndSendTransaction 发送序列化的交易
    if (!signAndSendTransaction) {
      throw new Error('signAndSendTransaction hook not available')
    }

    console.log(`[deBridge-SOL→${targetChain}] Sending transaction via Privy signAndSendTransaction...`)
    
    // signAndSendTransaction 接受序列化的交易 buffer
    const result = await signAndSendTransaction({
      transaction: txBuffer,
      wallet: solanaWallet,
      options: {
        sponsor: true, // Enable gas sponsorship - Privy pays the gas fees
      },
    })
    
    const txSignature = result.signature
    
    console.log(`[deBridge-SOL→${targetChain}] ✅ Transaction sent:`, txSignature)
    console.log(`[deBridge-SOL→${targetChain}] 🎉 Check tx: https://solscan.io/tx/${txSignature}`)
    
    // signAndSendTransaction 已经等待交易确认，所以不需要再次等待

    return {
      txHash: txSignature,
      orderId: orderId
    }
  } catch (error) {
    console.error(`[deBridge-SOL→${targetChain}] Transaction failed:`, error)
    throw new Error(`Solana bridge transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 桥接 Solana → Tron (出金使用)
 * 两步桥接：Solana → BSC → Tron
 * 使用 BSC 作为中转链（费用更低）
 */
async function bridgeSolanaToTron(params: {
  amount: string
  tronAddress: string
  solanaWallet: any
  signAndSendTransaction: any // Privy signAndSendTransaction hook
  evmWallet: any // EVM 钱包（用于 BSC 中转）
}): Promise<{ txHash: string; orderId: string }> {
  const { amount, tronAddress, solanaWallet, signAndSendTransaction, evmWallet } = params

  console.log('[deBridge-SOL→TRON] 🔄 Starting Solana to Tron bridge (2 steps via BSC):', {
    amount,
    tronAddress,
    solanaWallet: solanaWallet?.address,
    evmWallet: evmWallet?.address
  })

  // 检查最小金额（TRON 需要更高，因为有两次桥接费用）
  const MIN_AMOUNT = 20_000_000 // 20 USD
  const amountNum = parseInt(amount)
  if (amountNum < MIN_AMOUNT) {
    throw new Error(`金额太小，Solana → Tron 需要两次桥接，最少需要 $20 USD（当前: $${(amountNum / 1_000_000).toFixed(2)}）`)
  }

  console.log('[deBridge-SOL→TRON] Step 1/2: Solana → BSC (intermediate)')

  // 步骤 1: Solana → BSC (中转到 BSC 钱包，费用更低)
  const step1Result = await bridgeSolanaToEvm({
    targetChain: 'BSC',
    amount,
    evmAddress: evmWallet.address,
    solanaWallet,
    signAndSendTransaction
  })

  console.log('[deBridge-SOL→TRON] ✅ Step 1 completed:', step1Result.txHash)
  console.log('[deBridge-SOL→TRON] Waiting for BSC to receive USDC...')

  // 等待第一步完成（通常需要 2-5 分钟）
  if (step1Result.orderId) {
    try {
      await waitForOrderCompletion(step1Result.orderId, 600000, 10000) // 10分钟超时
      console.log('[deBridge-SOL→TRON] ✅ Step 1 order fulfilled')
    } catch (error) {
      console.warn('[deBridge-SOL→TRON] ⚠️ Order tracking failed, proceeding anyway:', error)
    }
  }

  console.log('[deBridge-SOL→TRON] Step 2/2: BSC → Tron (final)')

  // 步骤 2: BSC → Tron
  // 需要等待 BSC 收到 USDC 后才能继续
  // TODO: 这里需要实现余额监听或手动触发
  // 当前返回第一步的结果，提示用户等待
  console.warn('[deBridge-SOL→TRON] ⚠️ Step 2 (BSC → Tron) needs to be triggered manually or via balance polling')
  console.warn('[deBridge-SOL→TRON] Returning step 1 result. User needs to wait for BSC to receive USDC.')
  
  return {
    txHash: step1Result.txHash,
    orderId: step1Result.orderId
  }
}
