import { useEffect, useState } from 'react'

import { Connection, TransactionConfirmationStrategy, TransactionSignature } from '@solana/web3.js'

export enum ConfirmTransactionStatus {
  IDLE = 'idle',
  CONFIRMING = 'confirming',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export type ConfirmTransactionParams = TransactionSignature | TransactionConfirmationStrategy

export type ConfirmTransactionParamsOptions = {
  connection?: Connection
  onConfirm?: () => void
  onError?: (error: any) => void
}

export const useConfirmTransaction = () => {
  const [confirmStatus, setConfirmStatus] = useState<ConfirmTransactionStatus>(ConfirmTransactionStatus.IDLE)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const isConfirmed = confirmStatus === ConfirmTransactionStatus.CONFIRMED
  const isConfirming = confirmStatus === ConfirmTransactionStatus.CONFIRMING
  const isError = confirmStatus === ConfirmTransactionStatus.FAILED

  // 使用 confirmTransaction 确认交易状态
  const confirmTransaction = async (
    params: TransactionSignature | TransactionConfirmationStrategy,

    { connection, onConfirm, onError }: ConfirmTransactionParamsOptions,
  ): Promise<boolean> => {
    try {
      if (!connection) {
        throw new Error('connection is missing')
      }

      const transactionParams =
        typeof params === 'string'
          ? {
              signature: params,
              blockhash: (await connection.getLatestBlockhash()).blockhash,
              lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
            }
          : params

      setConfirmStatus(ConfirmTransactionStatus.CONFIRMING)
      // 等待交易确认，设置超时时间
      const confirmation = await connection.confirmTransaction(transactionParams, 'confirmed')

      // 检查是否有错误
      if (confirmation?.value?.err) {
        console.error('交易失败:', confirmation.value.err)
        if (typeof confirmation?.value?.err === 'string') {
          setErrorMessage(confirmation?.value?.err)
        }
        setConfirmStatus(ConfirmTransactionStatus.FAILED)
        return false
      }

      // console.log('交易确认成功!')
      setErrorMessage(undefined)
      setConfirmStatus(ConfirmTransactionStatus.CONFIRMED)
      onConfirm?.()
      return true
    } catch (error: any) {
      console.error('确认交易时出错:', error)
      setConfirmStatus(ConfirmTransactionStatus.FAILED)
      setErrorMessage(error?.message)
      onError?.(error)
      return false
    } finally {
      setConfirmStatus(ConfirmTransactionStatus.IDLE)
    }
  }

  return {
    isConfirming,
    confirmStatus,
    isConfirmed,
    errorMessage,
    isError,
    confirmTransaction,
  }
}

export const useConfirmTransactionStatus = (
  props?: ConfirmTransactionParams,
  options?: ConfirmTransactionParamsOptions,
) => {
  const { confirmTransaction, ...rest } = useConfirmTransaction()
  useEffect(() => {
    if (props && options) {
      confirmTransaction(props, options)
    }
  }, [props, confirmTransaction, options])

  return {
    ...rest,
  }
}
