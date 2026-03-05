import { Trans } from '@lingui/react/macro'
import React, { useCallback } from 'react'
import { ActivityIndicator, Pressable, View } from 'react-native'
import QRCodeStyled from 'react-native-qrcode-styled'
import * as ExpoClipboard from 'expo-clipboard'

import { Alert, AlertText } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { IconifyCopy, IconifyRefresh } from '@/components/ui/icons/iconify'
import { Text } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'
import { BNumber } from '@mullet/utils/number'

import { useDepositAddress } from '../../_hooks/use-deposit-address'
import { useDepositStore } from '../../_store'

/**
 * 充值地址和注意事项组合组件
 * 统一管理 useDepositAddress 接口调用
 */
export function DepositAddressSection() {
  const selectedChainId = useDepositStore((s) => s.selectedChainId)
  const selectedTokenSymbol = useDepositStore((s) => s.selectedTokenSymbol)
  const depositTargetAccount = useDepositStore((s) => s.depositTargetAccount)

  // 获取充值地址信息（包含 address 和 tips）
  const tradeAccountId = depositTargetAccount?.id?.toString() || ''
  const { data: depositAddressInfo, isLoading, isError, refetch } = useDepositAddress(selectedChainId, tradeAccountId)

  const address = depositAddressInfo?.address
  const chainDisplayName = depositAddressInfo?.displayName || selectedChainId // 网络显示名称

  // 从 supportedTokens 中找到当前选中币种的 minDeposit
  const selectedTokenInfo = depositAddressInfo?.supportedTokens?.find((token) => token.symbol === selectedTokenSymbol)
  const minDeposit = BNumber.toFormatNumber(selectedTokenInfo?.minDeposit, {
    unit: selectedTokenInfo?.symbol,
    volScale: selectedTokenInfo?.displayDecimals,
  })

  const handleCopyAddress = useCallback(async () => {
    if (!address) return
    try {
      await ExpoClipboard.setStringAsync(address)
      toast.success(<Trans>复制成功</Trans>)
    } catch {
      toast.error(<Trans>复制失败，请重试</Trans>)
    }
  }, [address])

  const handleRetry = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <View className="gap-xl">
      {/* 充值地址展示 */}
      <View className="gap-medium">
        {/* 标题 */}
        <Text className="text-paragraph-p3 text-content-4">
          <Trans>存款地址</Trans>
        </Text>

        {/* QR Code 区域 - 固定高度，状态叠加显示 */}
        <View className="h-[140px] items-center justify-center">
          {isLoading && (
            <View className="gap-small absolute z-10 items-center">
              <ActivityIndicator size="small" />
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>加载地址中...</Trans>
              </Text>
            </View>
          )}

          {isError && !isLoading && (
            <View className="gap-small absolute z-10 items-center">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>加载失败</Trans>
              </Text>
              <Button size="sm" onPress={handleRetry}>
                <IconifyRefresh width={12} height={12} />
                <Text>
                  <Trans>重试</Trans>
                </Text>
              </Button>
            </View>
          )}

          {address && !isLoading && (
            <QRCodeStyled
              data={address}
              style={{ backgroundColor: 'white', borderRadius: 12 }}
              padding={10}
              size={120}
            />
          )}

          {!address && !isLoading && !isError && (
            <View className="items-center">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>请选择网络</Trans>
              </Text>
            </View>
          )}
        </View>

        {/* 地址显示 + 复制 */}
        {address && (
          <View className="bg-special rounded-small p-2xl gap-2xl flex-row items-center">
            <Text className="text-paragraph-p3 text-content-1 flex-1" numberOfLines={2}>
              {address}
            </Text>
            <Pressable onPress={handleCopyAddress} hitSlop={12}>
              <IconifyCopy width={16} height={16} className="text-content-4" />
            </Pressable>
          </View>
        )}
      </View>

      {/* 注意事项 */}
      {address && (
        <View className="gap-xl">
          <Alert variant="warning">
            <AlertText>
              <Trans>Mullet只支持Solana链的USDC，转入非Solana链USDC资产Mullet会进行跨链桥交易/Swap交易;</Trans>
            </AlertText>
          </Alert>

          <View>
            <Text className="text-paragraph-p3 text-content-4">
              1.{' '}
              <Trans>
                最低充值{minDeposit}，低于{minDeposit}不上账;(可累计充值≥{minDeposit})
              </Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-4">
              2.{' '}
              <Trans>
                请勿转入{chainDisplayName}
                网络下不支持的币种，不支持的币种充值到该地址一律销毁处理;详情可查看对应网络支持的币种
              </Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-4">
              3. <Trans>跨链桥服务由多个桥服务商提供，Mullet会采用最优报价交易</Trans>
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}
