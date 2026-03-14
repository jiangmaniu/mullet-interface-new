import { useMemo } from 'react'

import { DEPOSIT_SOLANA_CHAIN_ID } from '@/constants/config/deposit'

import { useWithdrawSupportedChains } from '../_apis/use-supported-chains'
import { useWithdrawSupportedTokens } from '../_apis/use-supported-tokens'
import { useWithdrawStore } from '../_store'
import { useWithdrawState } from './use-withdraw-state'

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

/**
 * 获取当前选中的代币配置
 * @returns 当前选中的代币配置
 */
export function useSelectedTokenConfig() {
  const { selectedTokenSymbol } = useWithdrawState()
  const { data: tokensConfig } = useWithdrawSupportedTokens(DEPOSIT_SOLANA_CHAIN_ID)

  return useMemo(() => {
    return tokensConfig?.find((t) => t.symbol.toUpperCase() === selectedTokenSymbol.toUpperCase())
  }, [tokensConfig, selectedTokenSymbol])
}
