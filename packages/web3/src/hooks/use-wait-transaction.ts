import { useCallback } from 'react'

import { waitTransactionConfirm as waitTransactionConfirmAction } from '@mullet/web3/actions'
import { MulletWeb3Config, useMulletWeb3Context } from '@mullet/web3/provider'

export const useWaitTransactionConfirm = (config?: MulletWeb3Config) => {
  const { config: globalConfig } = useMulletWeb3Context()
  const waitTransactionConfirm = useCallback(
    async (txSig: string) => {
      return waitTransactionConfirmAction(config ?? globalConfig, txSig)
    },
    [config],
  )
  return waitTransactionConfirm
}
