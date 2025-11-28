import { useCallback } from 'react'
import { get } from 'lodash-es'

import { ChainId, getChainConfig } from '@mullet/web3/config'
import { SOL_CHAIN_IDS } from '@mullet/web3/constants'
import { useMulletWeb3Context } from '@mullet/web3/provider'

export const useSolExploreUrl = (chainId: ChainId) => {
  const { config } = useMulletWeb3Context()

  const getSolExplorerUrl = useCallback((txHash: string) => {
    // if (!SOL_CHAIN_IDS.includes(chainId)) {
    //   throw new Error(`Chain ${chainId} is not supported`)
    // }

    const chainConfig = getChainConfig(chainId)

    const fullUrl = chainConfig.blockExplorers.default.url[0]
    if (!fullUrl) {
      throw new Error(`No explorer URL configured for chain ${chainId}`)
    }

    const urlObj = new URL(fullUrl)
    const baseUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`
    const env = urlObj.search

    return `${baseUrl}/tx/${txHash}${env}`
  }, [])

  return { getSolExplorerUrl }
}
