import { useMemo } from 'react'

import { useWithdrawStore } from '../_store'
import { useWithdrawSupportedChains } from './use-supported-chains'

/**
 * 获取当前选中的链信息和代币信息
 */
export function useSelectedChainInfo() {
  const selectedTokenSymbol = useWithdrawStore((s) => s.selectedTokenSymbol)
  const selectedChainId = useWithdrawStore((s) => s.selectedChainId)
  const { data: supportedChains } = useWithdrawSupportedChains()

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
  const selectedChainId = useWithdrawStore((s) => s.selectedChainId)
  const { data: supportedChains } = useWithdrawSupportedChains()

  return useMemo(() => {
    const chainInfo = supportedChains?.find((c) => c.chainId === selectedChainId)
    const tokenInfo = chainInfo?.supportedTokens.find((t) => t.symbol === tokenSymbol)

    return {
      chainInfo,
      tokenInfo,
    }
  }, [supportedChains, selectedChainId, tokenSymbol])
}
