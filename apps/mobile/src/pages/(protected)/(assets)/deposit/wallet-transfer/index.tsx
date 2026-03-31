import { Trans } from '@lingui/react/macro'
import { useEffect, useMemo, useState } from 'react'
import { Image, Pressable, ScrollView, View } from 'react-native'
import { router } from 'expo-router'

import { RefreshControl } from '@/components/pull-to-refresh/refresh-control'
import { EmptyState } from '@/components/states/empty-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { IconSpinner } from '@/components/ui/icons'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'
import { DEPOSIT_SOLANA_CHAIN_ID, USDC_TOKEN_SYMBOL } from '@/constants/config/deposit'
import { useAccount } from '@/lib/appkit'
import { renderFallback } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'

import { useDepositAddress } from '../_apis/use-deposit-address'
import { useSolanaWalletBalance } from '../_apis/use-solana-wallet-balance'
import { useDepositSupportedTokens } from '../_apis/use-supported-tokens'
import { useDepositActions, useDepositState } from '../_hooks/use-deposit-state'
import { useSelectedDepositAccount } from '../_hooks/use-selected-account'

interface WalletAsset {
  symbol: string
  displayName: string
  balance: string // 代币数量
  balanceUsd: string // USD 估值
  iconUrl?: string
  isInsufficientBalance: boolean // 是否余额不足
}

export default function WalletTransferScreen() {
  const { fromWalletAddress } = useDepositState()
  const { setToWalletAddress, setFromWalletAddress } = useDepositActions()
  const selectedAccount = useSelectedDepositAccount()
  const [refreshing, setRefreshing] = useState(false)
  const { address: currentWalletAddress } = useAccount()

  // 获取充值地址
  const { data: depositAddressInfo } = useDepositAddress(DEPOSIT_SOLANA_CHAIN_ID, selectedAccount?.id ?? '')

  // 当获取到充值地址时，存储到 deposit store
  useEffect(() => {
    if (depositAddressInfo?.address) {
      setToWalletAddress(depositAddressInfo.address)
    }
  }, [depositAddressInfo?.address, setToWalletAddress])

  // 当获取到当前钱包地址时，存储到 deposit store
  useEffect(() => {
    if (currentWalletAddress) {
      setFromWalletAddress(currentWalletAddress)
    }
  }, [currentWalletAddress, setFromWalletAddress])

  // 查询钱包余额（列表页面,使用默认 30 秒轮询）
  const {
    data: balanceData,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useSolanaWalletBalance(fromWalletAddress)

  // 查询代币配置（获取图标）
  const {
    data: tokensConfig,
    isLoading: isLoadingTokens,
    refetch: refetchTokens,
  } = useDepositSupportedTokens(DEPOSIT_SOLANA_CHAIN_ID)

  // 转换 API 数据为组件所需格式
  const assetsRendered: WalletAsset[] = useMemo(() => {
    if (!tokensConfig) return []

    return tokensConfig.map((tokenConfig) => {
      const tokenBalance = balanceData?.balances.find((b) => b.symbol === tokenConfig.symbol)

      return {
        symbol: renderFallback(tokenConfig?.symbol),
        displayName: renderFallback(tokenConfig?.symbol),
        iconUrl: tokenConfig?.iconUrl,
        balance: renderFallback(
          BNumber.toFormatNumber(tokenBalance?.amount, {
            volScale: tokenConfig?.displayDecimals,
            unit: tokenConfig?.symbol,
          }),
        ),
        balanceUsd: renderFallback(
          BNumber.toFormatNumber(tokenBalance?.usdValue, {
            volScale: selectedAccount?.currencyDecimal,
            unit: selectedAccount?.currencyUnit,
          }),
        ),
        isInsufficientBalance: !!BNumber.from(tokenBalance?.minAmount)?.gt(tokenBalance?.amount),
      }
    })
  }, [balanceData, tokensConfig, selectedAccount])

  const isLoading = isLoadingBalance || isLoadingTokens

  // 下拉刷新处理
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([refetchBalance(), refetchTokens()])
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <View className="gap-xl flex-1">
      <ScreenHeader content={<Trans>钱包转入</Trans>} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-xl"
        nestedScrollEnabled
        // refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {isLoading ? (
          <View className="py-xl items-center">
            <IconSpinner width={24} height={24} className="text-content-4" />
          </View>
        ) : (
          <>
            <View className="px-5">
              <Text className="text-paragraph-p2 text-content-4">
                <Trans>余额</Trans>:{' '}
                {BNumber.toFormatNumber(balanceData?.totalUsdValue, {
                  prefix: '≈',
                  volScale: selectedAccount?.currencyDecimal,
                  unit: selectedAccount?.currencyUnit,
                })}
              </Text>
            </View>
            <View className="gap-xl px-5">
              {assetsRendered.length > 0 ? (
                assetsRendered.map((asset) => <AssetRow key={asset.symbol} asset={asset} />)
              ) : (
                <EmptyState message={<Trans>暂无资产</Trans>} className="py-20" />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  )
}

function AssetRow({ asset }: { asset: WalletAsset }) {
  const { setSelectedTokenSymbol } = useDepositActions()

  // 是否禁用
  const disabled = asset.isInsufficientBalance

  const handlePress = () => {
    if (!__DEV__) {
      if (asset.isInsufficientBalance) {
        toast.error(<Trans>当前余额低于最小充值额度，请使用其他代币充值</Trans>)
        return
      }
    }

    setSelectedTokenSymbol(asset.symbol)
    if (asset.symbol.toUpperCase() === USDC_TOKEN_SYMBOL.toUpperCase()) {
      router.push('/(assets)/deposit/wallet-transfer/usdc')
    } else {
      router.push('/(assets)/deposit/wallet-transfer/swap')
    }
  }

  return (
    <Pressable onPress={handlePress}>
      <Card className="rounded-small" style={disabled ? { opacity: 0.5 } : undefined}>
        <CardContent className="py-medium px-xl flex-row items-center justify-between">
          <View className="gap-medium flex-row items-center">
            {asset.iconUrl ? (
              <Image source={{ uri: asset.iconUrl }} style={{ width: 24, height: 24, borderRadius: 12 }} />
            ) : (
              <View style={{ width: 24, height: 24 }} />
            )}
            <View className="gap-xs">
              <Text className="text-paragraph-p2 text-content-1">{asset.displayName}</Text>
              <Text className="text-paragraph-p3 text-content-4">{asset.balance}</Text>
            </View>
          </View>
          <View className="gap-small flex-row items-center">
            {disabled && (
              <Badge color="default">
                <Text>
                  <Trans>余额不足</Trans>
                </Text>
              </Badge>
            )}
            <Text className="text-paragraph-p2 text-content-1">≈ {asset.balanceUsd}</Text>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  )
}
