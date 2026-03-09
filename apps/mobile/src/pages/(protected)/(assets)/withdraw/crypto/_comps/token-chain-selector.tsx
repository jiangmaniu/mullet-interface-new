import { useEffect, useMemo } from 'react'
import { Image, View } from 'react-native'
import type { Option } from '@/components/ui/select'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useDepositAddress } from '../../../deposit/_apis/use-deposit-address'
import { useWithdrawSupportedChains } from '../../_apis/use-supported-chains'
import { useWithdrawSupportedTokens } from '../../_apis/use-supported-tokens'
import { useSelectedWithdrawAccount } from '../../_hooks/use-selected-account'
import { useWithdrawStore } from '../../_store'

export function TokenChainSelector() {
  const selectedAccount = useSelectedWithdrawAccount()
  const selectedTokenSymbol = useWithdrawStore((s) => s.selectedTokenSymbol)
  const selectedChainId = useWithdrawStore((s) => s.selectedChainId)
  const setSelectedTokenSymbol = useWithdrawStore((s) => s.setSelectedTokenSymbol)
  const setSelectedChainId = useWithdrawStore((s) => s.setSelectedChainId)
  const setFromWalletAddress = useWithdrawStore((s) => s.setFromWalletAddress)

  // 获取所有链列表（包含每个链支持的代币）
  const { data: chains, isLoading: isLoadingChains } = useWithdrawSupportedChains()

  // 获取出金代币配置（用于获取代币图标）
  const { data: tokens } = useWithdrawSupportedTokens()

  // 获取交易账户的充值地址（用于获取钱包地址）
  const { data: depositAddressData } = useDepositAddress(selectedChainId, selectedAccount?.id ?? '')

  // 当获取到钱包地址时，存储到 withdraw store
  useEffect(() => {
    if (depositAddressData?.address) {
      setFromWalletAddress(depositAddressData.address)
    }
  }, [depositAddressData, setFromWalletAddress])

  // 根据选中的链，计算可用的代币列表
  const availableTokens = useMemo(() => {
    const selectedChain = chains?.find((c) => c.chainId === selectedChainId)
    return selectedChain?.supportedTokens || []
  }, [chains, selectedChainId])

  // 初始化默认选择的链（第一个）
  useEffect(() => {
    if (chains && chains.length > 0 && !selectedChainId) {
      setSelectedChainId(chains[0].chainId)
    }
  }, [chains, selectedChainId, setSelectedChainId])

  // 初始化默认选择的代币（第一个）
  useEffect(() => {
    if (availableTokens.length > 0 && !selectedTokenSymbol) {
      setSelectedTokenSymbol(availableTokens[0].symbol)
    }
  }, [availableTokens, selectedTokenSymbol, setSelectedTokenSymbol])

  // 当选择的链改变时，检查当前代币是否支持，不支持则选择第一个
  useEffect(() => {
    if (selectedChainId && availableTokens.length > 0) {
      const isTokenSupported = availableTokens.some((t) => t.symbol === selectedTokenSymbol)
      if (!isTokenSupported) {
        setSelectedTokenSymbol(availableTokens[0].symbol)
      }
    }
  }, [selectedChainId, selectedTokenSymbol, availableTokens, setSelectedTokenSymbol])

  // 处理 Select 组件的 Option 类型
  const handleChainChange = (option: Option) => {
    setSelectedChainId(option.value)
  }

  const handleTokenChange = (option: Option) => {
    setSelectedTokenSymbol(option.value)
  }

  // 从出金代币配置中获取代币图标 URL
  const getTokenIconUrl = (symbol: string) => {
    const tokenConfig = tokens?.find((t) => t.symbol === symbol)
    return tokenConfig?.iconUrl
  }

  // 转换为 Option 类型
  const selectedChain = chains?.find((c) => c.chainId === selectedChainId)
  const selectedChainOption: Option = {
    value: selectedChainId,
    label: selectedChain?.displayName ?? selectedChainId,
    icon: selectedChain?.iconUrl ? (
      <Image source={{ uri: selectedChain.iconUrl }} style={{ width: 16, height: 16 }} />
    ) : undefined,
  }

  const selectedTokenIconUrl = getTokenIconUrl(selectedTokenSymbol)
  const selectedTokenOption: Option = {
    value: selectedTokenSymbol,
    label: selectedTokenSymbol,
    icon: selectedTokenIconUrl ? (
      <Image source={{ uri: selectedTokenIconUrl }} style={{ width: 16, height: 16 }} />
    ) : undefined,
  }

  return (
    <View className="gap-xl">
      {/* 网络选择器 */}
      <Select value={selectedChainOption} onValueChange={handleChainChange}>
        <SelectTrigger placeholder="选择网络" loading={isLoadingChains}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {chains?.map((chain) => (
            <SelectItem
              className="px-5 py-[14px]"
              key={chain.chainId}
              value={chain.chainId}
              label={chain.displayName}
              icon={
                chain.iconUrl ? <Image source={{ uri: chain.iconUrl }} style={{ width: 16, height: 16 }} /> : undefined
              }
            />
          ))}
        </SelectContent>
      </Select>

      {/* 代币选择器 */}
      <Select value={selectedTokenOption} onValueChange={handleTokenChange}>
        <SelectTrigger placeholder="选择币种" loading={isLoadingChains}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableTokens.map((token) => {
            const tokenIconUrl = getTokenIconUrl(token.symbol)
            return (
              <SelectItem
                className="px-5 py-[14px]"
                key={token.symbol}
                value={token.symbol}
                label={token.symbol}
                icon={
                  tokenIconUrl ? <Image source={{ uri: tokenIconUrl }} style={{ width: 16, height: 16 }} /> : undefined
                }
              />
            )
          })}
        </SelectContent>
      </Select>
    </View>
  )
}
