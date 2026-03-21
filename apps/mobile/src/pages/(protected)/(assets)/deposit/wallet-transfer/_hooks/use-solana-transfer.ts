import { Buffer } from 'buffer'
import bs58 from 'bs58'
import type { EnhancedSolanaProvider } from '@/lib/appkit/use-solana-provider'

import { useWalletRouteCallback, WalletActionType } from '@/hooks/use-wallet-route-callback'
import { BNumber, BNumberValue } from '@mullet/utils/number'
import { createMemoInstruction } from '@solana/spl-memo'
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'

export type TransferTokenResult = {
  signature: string
  blockhash: string
  lastValidBlockHeight: number
}

/**
 * 自定义 Hook：处理 Solana 钱包的代币转账逻辑
 * 封装了获取钱包连接、构建交易、签名并发送的完整流程
 */
export function useSolanaTransfer() {
  const { saveContext } = useWalletRouteCallback()

  /**
   * 执行 SPL 代币代币转账
   */
  const transferToken = async (
    {
      fromAddress,
      toAddress,
      mintAddress,
      amount,
      decimals,
    }: {
      /** 发送方钱包地址 */
      fromAddress?: string
      /** 接收方钱包地址 */
      toAddress: string
      /** 代币的 Mint 合约地址*/
      mintAddress: string
      /** 需转账的数量（不带精度的常规数值，如 '1.5'） */
      amount: BNumberValue
      decimals: number
    },
    {
      memoContent,
      connection,
      walletProvider,
    }: {
      memoContent?: Record<string, any>
      connection?: Connection
      walletProvider?: EnhancedSolanaProvider
    },
  ) => {
    if (!fromAddress) {
      throw new Error('No from address')
    }

    if (!walletProvider || !connection) {
      throw new Error('Provider or connection is missing')
    }

    const activeFromAddress = fromAddress
    if (!activeFromAddress || !toAddress) {
      throw new Error('No from address or to address')
    }

    // 提取目标代币的 mintAddress（未传入时根据当前环境网络匹配合理的默认 USDC Mint 地址）
    const finalMintAddress = mintAddress

    // console.log('====== SOLANA 钱包转账调试 ======')
    // console.log('[发起地址]:', activeFromAddress)
    // console.log('[收款地址]:', toAddress)
    // console.log('[转账原始数量]:', amount)
    // console.log('[Token Mint]:', finalMintAddress)
    // console.log('-> 正在唤起 AppKit 原生 solanaAdapter 进行组装和签名...')

    try {
      // 构建交易
      const transaction = new Transaction()

      const mintAddressPublicKey = new PublicKey(mintAddress)
      const toTokenAccountPublicKey = new PublicKey(toAddress)
      const fromTokenAccountPublicKey = new PublicKey(fromAddress)

      // 获取关联代币账户地址
      const fromTokenAccountAtaAddress = getAssociatedTokenAddressSync(mintAddressPublicKey, fromTokenAccountPublicKey)
      const toTokenAccountAtaAddress = getAssociatedTokenAddressSync(mintAddressPublicKey, toTokenAccountPublicKey)

      // 检查目标代币账户是否存在，如果不存在则创建
      try {
        await getAccount(connection, toTokenAccountAtaAddress)
        // console.log('目标代币账户已存在')
      } catch (error) {
        console.log('目标代币账户不存在，需要创建', error)
        // 创建关联代币账户指令
        const createAccountInstruction = createAssociatedTokenAccountInstruction(
          fromTokenAccountPublicKey, // payer
          toTokenAccountAtaAddress, // associatedToken
          toTokenAccountPublicKey, // owner
          mintAddressPublicKey, // mint
        )
        transaction.add(createAccountInstruction)
      }

      const transferAmount = BNumber.from(amount).multipliedBy(10 ** decimals)

      // 添加转账指令
      const transferInstruction = createTransferInstruction(
        fromTokenAccountAtaAddress, // source
        toTokenAccountAtaAddress, // destination
        fromTokenAccountPublicKey, // owner
        transferAmount.toBigInt(), // amount
        [], // multiSigners
        TOKEN_PROGRAM_ID, // programId
      )

      transaction.add(transferInstruction)

      if (memoContent) {
        transaction.add(createMemoInstruction(JSON.stringify(memoContent), [fromTokenAccountPublicKey]))
        // console.log('[SwapDialog] Added memo:', memoContent)
      }

      // 设置区块哈希
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.lastValidBlockHeight = lastValidBlockHeight
      transaction.feePayer = fromTokenAccountPublicKey

      // 序列化交易（用于签名）
      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })

      // 使用 provider 的 signTransaction 方法签名交易
      // console.log('-> 正在请求钱包签名交易...')

      // 保存上下文
      saveContext(WalletActionType.SignTransaction)
      const signatureData = await walletProvider.signTransaction(serializedTransaction.toString('base64'))
      // console.log('✅ 钱包返回签名数据:', signatureData)

      if (!signatureData) {
        throw new Error('签名失败：钱包未返回签名')
      }

      // 智能处理：根据返回数据长度判断是完整交易还是单独签名
      let signedTransaction: Buffer

      if (signatureData.length < 150) {
        // 短字符串：单独的签名（64 字节，base58 编码约 88 字符）
        // console.log('-> 钱包返回单独签名，添加到交易中')
        const signatureBytes = bs58.decode(signatureData)

        // 将签名添加到交易的 signatures 数组中
        transaction.signatures[0] = {
          publicKey: fromTokenAccountPublicKey,
          signature: Buffer.from(signatureBytes),
        }

        // 序列化已签名的交易
        signedTransaction = transaction.serialize()
      } else {
        // 长字符串：完整的已签名交易
        // console.log('-> 钱包返回完整的已签名交易')
        signedTransaction = Buffer.from(bs58.decode(signatureData))
      }

      // console.log('✅ 交易签名完成，准备发送')

      // 将签名后的交易发送到链上
      // console.log('-> 正在发送交易到链上...')
      const txSignature = await connection.sendRawTransaction(signedTransaction, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      })
      // console.log('🎉 交易上链广播成功！签名 TxID:', txSignature)

      // 等待交易确认（使用推荐的 TransactionConfirmationStrategy）
      // console.log('-> 等待交易确认...')
      // await connection.confirmTransaction(
      //   {
      //     signature: txSignature,
      //     blockhash,
      //     lastValidBlockHeight,
      //   },
      //   'confirmed',
      // )
      // console.log('✅ 交易已确认')

      return {
        signature: txSignature,
        blockhash,
        lastValidBlockHeight,
      }
    } catch (err: any) {
      console.error('❌ SolanaAdapter 发送异常:', err)
      throw err
    }
  }

  return { transferToken }
}
