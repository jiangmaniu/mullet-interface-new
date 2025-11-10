import { useCallback } from 'react'

import { waitTransactionConfirm } from '@/ations/wait-transaction'
import { MulletWeb3Config, useMulletWeb3Context } from '@/provider'

export const useWaitTransactionConfirm = (config?: MulletWeb3Config) => {
  const { config: globalConfig } = useMulletWeb3Context()
  const waitTransactionConfirm = useCallback(
    async (txSig: string) => {
      return waitTransactionConfirm(config ?? globalConfig, txSig)
    },
    [config],
  )
  return waitTransactionConfirm
}
