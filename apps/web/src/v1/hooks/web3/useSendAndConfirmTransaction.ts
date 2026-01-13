import { sendAndConfirmTransactionFactory } from '@solana/kit'
import { useCallback, useMemo } from 'react'
import usePrivyInfo from './usePrivyInfo'
import useConnection from './useConnection'

export function useSendAndConfirmTransaction() {
  const { rpc, rpcSubscriptions } = useConnection()

  const sendAndConfirmTransaction = useMemo(() => {
    return sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions
    })
  }, [rpc])

  return { sendAndConfirmTransaction }
}
