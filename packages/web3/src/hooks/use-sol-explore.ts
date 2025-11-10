import { useCallback } from 'react'
import { get } from 'lodash-es'

import { ChainId, getChainConfig } from '@/config/chain'
import { SOL_CHAIN_IDS } from '@/constants'
import { useMulletWeb3Context } from '@/provider'

export const useSolExploreUrl = (chainId: ChainId) => {
  const { config } = useMulletWeb3Context()

  const getSolExplorerUrl = useCallback((txHash: string) => {
    // if (!SOL_CHAIN_IDS.includes(chainId)) {
    //   throw new Error(`Chain ${chainId} is not supported`)
    // }

    const chainConfig = getChainConfig(chainId)

    const [baseUrl, env] = chainConfig.blockExplorers.default.url
    return `${baseUrl}/tx/${txHash}${env}`
  }, [])

  return { getSolExplorerUrl }
}
