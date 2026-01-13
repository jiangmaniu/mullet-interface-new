import ExplorerLink from '@/components/Wallet/ExplorerLink'
import { message } from '@/utils/message'
import { useWallets } from '@privy-io/react-auth'
import { useSendTransaction } from '@privy-io/react-auth/solana'
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionSignature } from '@solana/web3.js'
import { useIntl } from '@umijs/max'
import { useState } from 'react'
import useConnection from './useConnection'
import useNotice from './useNotice'
import usePrivyInfo from './usePrivyInfo'

type TransferProps = {
  // 转入目标地址
  toAddress: string
  amount: number
  onBeforeTransfer?: () => void
}

// SOL转账
export default function useSoLTransfer() {
  const intl = useIntl()
  const { connection, connected } = useConnection()
  const { wallet } = usePrivyInfo()
  const { wallets } = useWallets()
  const fromAddress = wallet?.address as string
  const { sendTransaction } = useSendTransaction()
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferSuccess, setTransferSuccess] = useState(false)
  const { showNotice } = useNotice()
  const [error, setError] = useState(false)

  // 使用 confirmTransaction 确认交易状态
  const confirmTransactionStatus = async (signature: TransactionSignature): Promise<boolean> => {
    try {
      // 等待交易确认，设置超时时间
      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash: (await connection.getLatestBlockhash()).blockhash,
          lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
        },
        'confirmed'
      )

      // 检查是否有错误
      if (confirmation?.value?.err) {
        console.error('交易失败:', confirmation.value.err)
        return false
      }

      console.log('交易确认成功!')
      return true
    } catch (error) {
      console.error('确认交易时出错:', error)
      setError(true)
      return false
    }
  }

  const onTransfer = async ({ toAddress, amount, onBeforeTransfer }: TransferProps) => {
    if (!connected || !wallet?.address || wallets.length === 0) {
      message.info('Please connect wallet first')
      return
    }

    const lamports = Number(amount) * LAMPORTS_PER_SOL // 1 SOL = 10^9 lamports

    console.log(`from ${fromAddress} to ${toAddress} amount ${amount} SOL`)

    try {
      // 检查余额
      const balance = await connection.getBalance(new PublicKey(fromAddress))

      console.log('balance: ', balance / LAMPORTS_PER_SOL)

      if (!toAddress) {
        message.info(intl.formatMessage({ id: 'mt.zhuanruzhizhiweikong' }))
        return
      }

      if (balance < lamports) {
        message.info(intl.formatMessage({ id: 'mt.yuebuzu' }))
        setError(true)
        return
      }

      if (fromAddress === toAddress) {
        message.info(intl.formatMessage({ id: 'mt.zhuanruzhuanchudizhibunengxiangtong' }))
        return
      }

      // 转账之前回调
      onBeforeTransfer?.()

      setTransferLoading(true)
      const payer = new PublicKey(fromAddress)

      // 1. 构建交易
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer,
          toPubkey: new PublicKey(toAddress),
          lamports
        })
      )

      console.log('transaction', transaction)

      // 2. 设置区块哈希
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = payer

      // 获取钱包的实例
      const foundWallet = wallets.find((v) => v.address === fromAddress)

      console.log('foundWallet', foundWallet)

      let signature = ''

      // 如果钱包是是外部钱包，则使用内置的签名方法
      if (foundWallet && foundWallet.connectorType !== 'embedded') {
        signature = await foundWallet.sendTransaction(transaction, connection)
      } else {
        // 3. 让钱包签名 (如果钱包是内置钱包，则使用自定义的签名方法)
        const result = await sendTransaction({ transaction, connection, address: fromAddress })
        signature = result?.signature
      }
      console.log('交易成功！交易哈希:', signature)

      console.log('正在确认交易...')
      const isConfirmed = await confirmTransactionStatus(signature)
      console.log('交易确认状态:', isConfirmed)
      setTransferSuccess(true)
      setError(false)
      setTimeout(() => {
        setTransferSuccess(false)
        showNotice({
          title: intl.formatMessage({ id: 'mt.zhuanzhangchenggong' }),
          content: (
            <span>
              <span className="mr-2">{intl.formatMessage({ id: 'mt.rujinyiquerenyuejianggengxin' })}</span>
              <ExplorerLink path={`tx/${signature}`} address={signature} label={'Explorer Link'} />
            </span>
          )
        })
      }, 300)
    } catch (error) {
      console.log('转账失败:', error)
    } finally {
      setTransferLoading(false)
    }
  }

  return {
    onTransfer,
    transferLoading,
    transferSuccess,
    error,
    setError
  }
}
