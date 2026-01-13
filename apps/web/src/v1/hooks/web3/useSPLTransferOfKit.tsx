import { useStores } from '@/context/mobxProvider'
import { BNumber } from '@/utils/b-number'
import { message } from '@/utils/message'
import { useSendTransaction, useStandardSignAndSendTransaction, useStandardSignTransaction } from '@privy-io/react-auth/solana'
import { findAssociatedTokenPda, getTransferInstruction, TOKEN_2022_PROGRAM_ADDRESS } from '@solana-program/token-2022'
import {
  address,
  Address,
  appendTransactionMessageInstructions,
  assertAccountExists,
  assertIsSendableTransaction,
  createTransactionMessage,
  fetchEncodedAccount,
  getSignatureFromTransaction,
  Instruction,
  isTransactionMessageWithinSizeLimit,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  SolanaError
} from '@solana/kit'
import { TransactionSignature } from '@solana/web3.js'
import { useIntl } from '@umijs/max'
import { useState } from 'react'
import useConnection from './useConnection'
import { useEstimateComputeUnitLimit } from './useEstimateComputeUnitLimit'
import useNotice from './useNotice'
import usePrivyInfo from './usePrivyInfo'
import { useSendAndConfirmTransaction } from './useSendAndConfirmTransaction'
import useSPLTokenBalance from './useSPLTokenBalance'
import { useTransactionSendingSignerAction } from './useTransactionSendingSigner'

type TransferProps = {
  // 转入目标地址
  toAddress: Address
  amount: number
  tokenMint?: Address // 代币的mint地址
  decimals?: number // 代币的小数位数，默认为6
  onBeforeTransfer?: () => void
}

// USDC转账
export function useSPLTransferPDA() {
  const intl = useIntl()
  const { connection, rpc, connected } = useConnection()
  const { wallet, activeSolanaWallet } = usePrivyInfo()
  const fromAddress = wallet?.address
  const { sendTransaction } = useSendTransaction()
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferSuccess, setTransferSuccess] = useState(false)
  const { showNotice } = useNotice()
  const [error, setError] = useState(false)
  const { balance: splBalance } = useSPLTokenBalance()
  const { trade } = useStores()
  const currentAccountInfo = trade.currentAccountInfo
  const { signAndSendTransaction } = useStandardSignAndSendTransaction()
  const { signTransaction } = useStandardSignTransaction()
  const { sendAndConfirmTransaction } = useSendAndConfirmTransaction()
  const { transactionSendingSignerAction } = useTransactionSendingSignerAction()
  const { estimateComputeUnitLimit } = useEstimateComputeUnitLimit()

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

  const onTransfer = async ({ toAddress, amount, tokenMint, decimals, onBeforeTransfer }: TransferProps) => {
    const mintAddr = address(tokenMint || (currentAccountInfo.mintAddress as string) || '')
    const decimal = Number(decimals || currentAccountInfo.mintDecimals || 6)
    const recipientAddress = address(toAddress)
    const fromTokenAccountAddress = fromAddress ? address(fromAddress) : undefined

    if (!connected || !fromTokenAccountAddress || !activeSolanaWallet) {
      message.info('Please connect wallet first')
      return
    }

    const transferAmount = BNumber.parseUnits(amount, decimal)

    console.log(`from ${fromTokenAccountAddress} to ${recipientAddress} transferAmount ${transferAmount.toString()} USDC`)

    try {
      const balance = BNumber.parseUnits(splBalance, decimal) // 代币余额
      console.log('balance: ', balance)

      if (!recipientAddress) {
        message.info(intl.formatMessage({ id: 'mt.zhuanruzhizhiweikong' }))
        return
      }
      // 检查代币余额
      if (balance.lt(transferAmount)) {
        message.info(intl.formatMessage({ id: 'mt.yuebuzu' }))
        setError(true)
        return
      }

      if (fromTokenAccountAddress === toAddress) {
        message.info(intl.formatMessage({ id: 'mt.zhuanruzhuanchudizhibunengxiangtong' }))
        return
      }

      // 转账之前回调
      onBeforeTransfer?.()

      setTransferLoading(true)

      const [senderAta] = await findAssociatedTokenPda({
        mint: mintAddr,
        owner: fromTokenAccountAddress,
        tokenProgram: TOKEN_2022_PROGRAM_ADDRESS
      })

      // const [recipientAta] = await findAssociatedTokenPda({
      //   mint: mintAddr,
      //   owner: recipientAddress,
      //   tokenProgram: TOKEN_2022_PROGRAM_ADDRESS
      // })

      let recipientAta = recipientAddress

      // const toTokenAccount = await getAssociatedTokenAddress(
      //   mintAddr,
      //   new PublicKey(toAddress)
      // )
      // 转到pda地址

      console.log('From token account:', senderAta.toString())
      console.log('To token account:', recipientAddress.toString())

      const transactionSendingSigner = transactionSendingSignerAction(foundWallet)
      // 构建交易
      const transactionInstructions: Instruction[] = []
      // 检查目标代币账户是否存在，如果不存在则创建
      try {
        // await getAccount(connection, toTokenAccount)
        const account = await fetchEncodedAccount(rpc, recipientAta)
        assertAccountExists(account)

        console.log('目标代币账户已存在')
      } catch (error) {
        console.log('目标代币账户不存在，需要创建')
        // 创建关联代币账户指令
        // const createAccountInstruction = createAssociatedTokenAccountInstruction(
        //   new PublicKey(fromAddress), // payer
        //   toTokenAccountAddress, // associatedToken
        //   new PublicKey(toAddress), // owner
        //   mintAddr // mint
        // )

        // const createRecipientAtaInstruction = await getCreateAssociatedTokenInstructionAsync({
        //   payer: transactionSendingSigner,
        //   mint: mintAddr,
        //   owner: recipientAddress
        // })

        // transactionInstructions.push(createRecipientAtaInstruction)
      }

      // // 添加转账指令
      // const transferInstruction1 = createTransferInstruction(
      //   fromTokenPdaAccount, // source
      //   toTokenAccountAddress, // destination
      //   new PublicKey(fromAddress), // owner
      //   transferAmount, // amount
      //   [], // multiSigners
      //   TOKEN_PROGRAM_ID // programId
      // )

      const transferInstruction = getTransferInstruction({
        source: senderAta,
        destination: recipientAta,
        authority: fromTokenAccountAddress,
        amount: transferAmount.toBigInt()
      })

      transactionInstructions.push(transferInstruction)

      // transactionInstructions.push(transferInstruction)
      // console.log('transaction', transaction)
      const { value: transferBlockhash } = await rpc.getLatestBlockhash().send()

      const transactionMessage = await pipe(
        createTransactionMessage({ version: 0 }),
        (tx) => setTransactionMessageFeePayerSigner(transactionSendingSigner, tx),
        (tx) => setTransactionMessageLifetimeUsingBlockhash(transferBlockhash, tx),
        (tx) => appendTransactionMessageInstructions(transactionInstructions, tx)
        // (tx) => estimateComputeUnitLimit(tx)
      )

      if (!isTransactionMessageWithinSizeLimit(transactionMessage)) {
        throw new Error('Transaction message exceeds size limit')
      }

      const signedTransferTx = await signTransactionMessageWithSigners(transactionMessage)

      assertIsSendableTransaction(signedTransferTx)
      await sendAndConfirmTransaction(signedTransferTx, { commitment: 'confirmed' })

      // // Get transaction signature
      const transferTxSignature = getSignatureFromTransaction(signedTransferTx)
      console.log('transferTxSignature', transferTxSignature)
      // // 设置区块哈希
      // const { blockhash } = await connection.getLatestBlockhash()
      // transaction.recentBlockhash = blockhash
      // transaction.feePayer = new PublicKey(fromAddress)

      // // 获取钱包的实例
      // console.log('foundWallet', foundWallet)

      // let signature = ''

      // // 如果钱包是外部钱包，则使用内置的签名方法
      // if (foundWallet && foundWallet.connectorType !== 'embedded') {
      //   signature = await foundWallet.sendTransaction(transaction, connection)
      // } else {
      //   // 如果钱包是内置钱包，则使用自定义的签名方法
      //   const result = await sendTransaction({ transaction, connection, address: fromAddress })
      //   signature = result?.signature
      // }

      // console.log('USDC转账成功！交易哈希:', signature)

      // console.log('正在确认交易...')
      // const isConfirmed = await confirmTransactionStatus(signature)
      // console.log('交易确认状态:', isConfirmed)
      // setTransferSuccess(true)
      // setError(false)

      // setTimeout(() => {
      //   setTransferSuccess(false)
      //   showNotice({
      //     title: intl.formatMessage({ id: 'mt.zhuanzhangchenggong' }),
      //     content: (
      //       <span>
      //         <span className="mr-2">{intl.formatMessage({ id: 'mt.rujinyiquerenyuejianggengxin' })}</span>
      //         <ExplorerLink path={`tx/${signature}`} address={signature} label={'Explorer Link'} />
      //       </span>
      //     )
      //   })
      // }, 300)
    } catch (error) {
      console.log((error as SolanaError).cause)
      console.log('USDC转账失败:', error)
      setError(true)
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
