import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { Pressable, View } from 'react-native'
import { router } from 'expo-router'

import { IconRecord } from '@/components/ui/icons'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'

import { DepositAccountSelector } from './_comps/account-selection'
import { BankDepositCard } from './_comps/bank-deposit-card'
import { QrDepositCard } from './_comps/qr-deposit-card'
import { WalletDepositCard } from './_comps/wallet-deposit-card'
import { useSelectedDepositAccount } from './_hooks/use-selected-account'

const DepositScreen = observer(function DepositScreen() {
  const selectedAccount = useSelectedDepositAccount()

  return (
    <View className="flex-1">
      <ScreenHeader
        content={<Trans>存款</Trans>}
        right={
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(protected)/(assets)/bills',
                params: { tab: 'deposit', accountId: selectedAccount?.id },
              })
            }
          >
            <IconRecord width={24} height={24} className="text-content-1" />
          </Pressable>
        }
      />
      <View className="gap-xl pt-xl flex-1">
        <View className="mb-xl px-5">
          <DepositAccountSelector />
        </View>
        <View className="px-5">
          <Text className="text-paragraph-p2 text-content-4">
            <Trans>选择适合您的入金方式</Trans>
          </Text>
        </View>
        <View className="gap-xl px-5">
          {/* 钱包入金 */}
          <WalletDepositCard />
          {/* 扫码入金 */}
          <QrDepositCard />
          {/* 银行卡入金 */}
          <BankDepositCard />
        </View>
      </View>
    </View>
  )
})

export default DepositScreen
