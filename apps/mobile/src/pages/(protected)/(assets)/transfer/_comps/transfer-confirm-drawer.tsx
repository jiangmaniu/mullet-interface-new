import { Trans } from '@lingui/react/macro'
import { useAccountInfo } from '@/hooks/account/use-account-info'
import { View } from 'react-native'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Text } from '@/components/ui/text'
import { DEPOSIT_SOLANA_CHAIN_ID } from '@/constants/config/deposit'
import { useAccountSynopsis } from '@/hooks/account/use-account-synopsis'
import { useDepositAddress } from '@/pages/(protected)/(assets)/deposit/_apis/use-deposit-address'
import { renderFallback } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'
import { formatAddress } from '@mullet/utils/web3'

interface TransferConfirmDrawerProps {
  visible: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  fromAccountId: string
  toAccountId: string
  amount: string
}

export function TransferConfirmDrawer({
  visible,
  onClose,
  onConfirm,
  loading,
  fromAccountId,
  toAccountId,
  amount,
}: TransferConfirmDrawerProps) {
  const fromAccount = useAccountInfo(fromAccountId)
  const toAccount = useAccountInfo(toAccountId)

  const fromSynopsis = useAccountSynopsis(fromAccount?.synopsis)
  const toSynopsis = useAccountSynopsis(toAccount?.synopsis)

  const { data: fromDepositInfo } = useDepositAddress(DEPOSIT_SOLANA_CHAIN_ID, fromAccountId)
  const { data: toDepositInfo } = useDepositAddress(DEPOSIT_SOLANA_CHAIN_ID, toAccountId)
  const fromAddress = fromDepositInfo?.address
  const toAddress = toDepositInfo?.address

  return (
    <Drawer open={visible} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="pt-3xl pb-8">
        <DrawerHeader className="px-5">
          <DrawerTitle>
            <Trans>转账确认</Trans>
          </DrawerTitle>
        </DrawerHeader>

        <View className="gap-medium items-center px-5">
          {/* 转账金额 */}
          <View className="items-center gap-1">
            <Text className="text-title-h3 text-content-1">
              {BNumber.toFormatNumber(amount, {
                unit: fromAccount?.currencyUnit,
                volScale: fromAccount?.currencyDecimal,
              })}
            </Text>
            <Text className="text-paragraph-p2 text-content-4">
              <Trans>转账金额</Trans>
            </Text>
          </View>

          {/* 转出账户 */}
          <View className="w-full flex-row items-start justify-between">
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
          <View className="w-full flex-row items-start justify-between">
            <Text className="text-paragraph-p2 text-content-4">
              <Trans>转出地址</Trans>
            </Text>
            <Text className="text-paragraph-p2 text-content-1">{formatAddress(fromAddress)}</Text>
          </View>

          {/* 转入账户 */}
          <View className="w-full flex-row items-start justify-between">
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
          <View className="w-full flex-row items-start justify-between">
            <Text className="text-paragraph-p2 text-content-4">
              <Trans>转入地址</Trans>
            </Text>
            <Text className="text-paragraph-p2 text-content-1">{formatAddress(toAddress)}</Text>
          </View>

          {/* 手续费 */}
          <View className="w-full flex-row items-start justify-between">
            <Text className="text-paragraph-p2 text-content-4">
              <Trans>手续费</Trans>
            </Text>
            <Text className="text-paragraph-p2 text-content-1">
              <Trans>免费</Trans>
            </Text>
          </View>
        </View>

        <DrawerFooter className="px-5">
          <Button size="lg" color="primary" loading={loading} onPress={onConfirm} block>
            <Text>
              <Trans>确定</Trans>
            </Text>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
