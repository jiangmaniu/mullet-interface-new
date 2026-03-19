import { Trans } from '@lingui/react/macro'
import { View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IconSuccess } from '@/components/ui/icons/set/success'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'
import { DEPOSIT_SOLANA_CHAIN_ID } from '@/constants/config/deposit'
import { useAccountSynopsis } from '@/hooks/account/use-account-synopsis'
import { useDepositAddress } from '@/pages/(protected)/(assets)/deposit/_apis/use-deposit-address'
import { useAccountInfo } from '@/hooks/account/use-account-info'
import { renderFallback } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'
import { formatAddress } from '@mullet/utils/web3'

export default function TransferDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    amount: string
    fromAccountId: string
    toAccountId: string
    hash: string
  }>()
  const { amount, fromAccountId, toAccountId, hash } = params

  const fromAccount = useAccountInfo(fromAccountId)
  const toAccount = useAccountInfo(toAccountId)

  const fromSynopsis = useAccountSynopsis(fromAccount?.synopsis)
  const toSynopsis = useAccountSynopsis(toAccount?.synopsis)

  const { data: fromDepositInfo } = useDepositAddress(DEPOSIT_SOLANA_CHAIN_ID, fromAccountId)
  const { data: toDepositInfo } = useDepositAddress(DEPOSIT_SOLANA_CHAIN_ID, toAccountId)
  const fromAddress = fromDepositInfo?.address
  const toAddress = toDepositInfo?.address

  return (
    <View className="gap-xl flex-1">
      <ScreenHeader content={<Trans>转账详情</Trans>} />

      <View className="gap-xl px-5">
        {/* 成功状态 */}
        <View className="py-xl gap-large items-center justify-center">
          <IconSuccess width={50} height={50} />
          <Text className="text-paragraph-p2 text-content-1">
            <Trans>转账成功，等待链上确认交易</Trans>
          </Text>
        </View>

        {/* 详情列表 */}
        <View className="gap-medium">
          {/* 转出账户 */}
          <View className="flex-row items-start justify-between">
            <Text className="text-paragraph-p2 text-content-4">
              <Trans>转出账户</Trans>
            </Text>
            <View className="flex-row items-center gap-1">
              <Badge color="default">
                <Text>{fromSynopsis.abbr}</Text>
              </Badge>
              <Text className="text-paragraph-p2 text-content-1">{renderFallback(fromAccount?.id)}</Text>
            </View>
          </View>

          {/* 转出地址 */}
          <View className="flex-row items-start justify-between">
            <Text className="text-paragraph-p2 text-content-4">
              <Trans>转出地址</Trans>
            </Text>
            <Text className="text-paragraph-p2 text-content-1">{formatAddress(fromAddress)}</Text>
          </View>

          {/* 转入账户 */}
          <View className="flex-row items-start justify-between">
            <Text className="text-paragraph-p2 text-content-4">
              <Trans>转入账户</Trans>
            </Text>
            <View className="flex-row items-center gap-1">
              <Badge color="default">
                <Text>{toSynopsis.abbr}</Text>
              </Badge>
              <Text className="text-paragraph-p2 text-content-1">{renderFallback(toAccount?.id)}</Text>
            </View>
          </View>

          {/* 转入地址 */}
          <View className="flex-row items-start justify-between">
            <Text className="text-paragraph-p2 text-content-4">
              <Trans>转入地址</Trans>
            </Text>
            <Text className="text-paragraph-p2 text-content-1">{formatAddress(toAddress)}</Text>
          </View>

          {/* 哈希地址 */}
          <View className="flex-row items-start justify-between">
            <Text className="text-paragraph-p2 text-content-4">
              <Trans>哈希地址</Trans>
            </Text>
            <Text className="text-paragraph-p2 text-content-1">{renderFallback(hash)}</Text>
          </View>

          {/* 您收到 */}
          <View className="flex-row items-start justify-between">
            <Text className="text-paragraph-p2 text-content-4">
              <Trans>您收到</Trans>
            </Text>
            <Text className="text-paragraph-p2 text-content-1">
              {BNumber.toFormatNumber(amount, {
                unit: fromAccount?.currencyUnit,
                volScale: fromAccount?.currencyDecimal,
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* 底部按钮 */}
      <View className="py-3xl px-5">
        <Button
          size="lg"
          color="primary"
          onPress={() =>
            router.replace({
              pathname: '/(protected)/(assets)/bills',
              params: { tab: 'transfer', accountId: fromAccountId },
            })
          }
          block
        >
          <Text>
            <Trans>查看详情</Trans>
          </Text>
        </Button>
      </View>
    </View>
  )
}
