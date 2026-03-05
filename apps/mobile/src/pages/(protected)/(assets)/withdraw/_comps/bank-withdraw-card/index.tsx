import { Trans } from '@lingui/react/macro'
import { View } from 'react-native'

import { Badge } from '@/components/ui/badge'
import { IconifyCreditCardSolid } from '@/components/ui/icons/iconify'
import { IconMastercard } from '@/components/ui/icons/set/mastercard'
import { IconVisa } from '@/components/ui/icons/set/visa'
import { Text } from '@/components/ui/text'

import { DepositMethodCard } from '../../../deposit/_comps/method-card'

export function BankWithdrawCard() {
  return (
    <DepositMethodCard
      icon={<IconifyCreditCardSolid width={24} height={24} className="text-content-1" />}
      title={
        <View className="gap-medium flex-row items-center">
          <Text className="text-paragraph-p2 text-content-1">
            <Trans>银行卡</Trans>
          </Text>
          <Badge color="default">
            <Text>
              <Trans>即将推出</Trans>
            </Text>
          </Badge>
        </View>
      }
      subtitle={<Trans>最低$1000 · 5分钟</Trans>}
      rightContent={
        <View className="gap-medium flex-row items-center">
          <IconVisa width={24} height={24} />
          <IconMastercard width={24} height={24} />
        </View>
      }
      onPress={() => {}}
      disabled
    />
  )
}
