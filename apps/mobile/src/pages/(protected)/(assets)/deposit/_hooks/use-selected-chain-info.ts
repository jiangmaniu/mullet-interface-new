import { useMemo } from 'react'

import { useDepositSupportedChains } from '../_apis/use-supported-chains'
import { useDepositStore } from '../_store'

/**
 * 获取当前选中的链信息和代币信息
 */
export function useSelectedChainInfo() {
  const selectedTokenSymbol = useDepositStore((s) => s.selectedTokenSymbol)
  const selectedChainId = useDepositStore((s) => s.selectedChainId)
  const { data: supportedChains } = useDepositSupportedChains()

  return useMemo(() => {
    const chainInfo = supportedChains?.find((c) => c.chainId === selectedChainId)
    const tokenInfo = chainInfo?.supportedTokens.find((t) => t.symbol === selectedTokenSymbol)

    return {
      chainInfo,
      tokenInfo,
      supportedChains,
    }
  }, [supportedChains, selectedChainId, selectedTokenSymbol])
}

/**
 * 获取指定代币的链和代币信息
 */
export function useChainInfoByToken(tokenSymbol: string) {
  const selectedChainId = useDepositStore((s) => s.selectedChainId)
  const { data: supportedChains } = useDepositSupportedChains()

  return useMemo(() => {
    const chainInfo = supportedChains?.find((c) => c.chainId === selectedChainId)
    const tokenInfo = chainInfo?.supportedTokens.find((t) => t.symbol === tokenSymbol)

    return {
      chainInfo,
      tokenInfo,
    }
  }, [supportedChains, selectedChainId, tokenSymbol])
}
