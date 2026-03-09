import { useState } from 'react'

import { Connection, TransactionSignature } from '@solana/web3.js'

export const useConfirmTransactionStatus = () => {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [isError, setIsError] = useState(false)

  // 使用 confirmTransaction 确认交易状态
  const confirmTransactionStatus = async (
    signature: TransactionSignature,
    { connection }: { connection?: Connection },
  ): Promise<boolean> => {
    try {
      if (!connection) {
        throw new Error('connection is missing')
      }

      // 等待交易确认，设置超时时间
      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash: (await connection.getLatestBlockhash()).blockhash,
          lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
        },
        'confirmed',
      )

      // 检查是否有错误
      if (confirmation?.value?.err) {
        console.error('交易失败:', confirmation.value.err)
        if (typeof confirmation?.value?.err === 'string') {
          setErrorMessage(confirmation?.value?.err)
        }
        setIsConfirmed(false)
        setIsError(true)
        return false
      }

      console.log('交易确认成功!')
      setErrorMessage(undefined)
      setIsConfirmed(true)
      setIsError(false)
      return true
    } catch (error: any) {
      console.error('确认交易时出错:', error)
      setIsConfirmed(false)
      setIsError(true)
      setErrorMessage(error?.message)
      return false
    }
  }

  return {
    isConfirmed,
    errorMessage,
    isError,
    confirmTransactionStatus,
  }
}
