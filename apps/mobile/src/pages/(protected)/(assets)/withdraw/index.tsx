import { Trans } from '@lingui/react/macro'
import React from 'react'
import { Pressable, View } from 'react-native'
import { router } from 'expo-router'

import { IconRecord } from '@/components/ui/icons/set/record'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'

import { AccountSelection } from './_comps/account-selector'
import { BankWithdrawCard } from './_comps/bank-withdraw-card'
import { CryptoWithdrawCard } from './_comps/crypto-withdraw-card/index'
import { useSelectedWithdrawAccount } from './_hooks/use-selected-account'

const WithdrawScreen = function WithdrawScreen() {
  const selectedAccount = useSelectedWithdrawAccount()

  return (
    <View className="flex-1">
      <ScreenHeader
        content={<Trans>取现</Trans>}
        right={
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(protected)/(assets)/bills',
                params: { tab: 'withdraw', accountId: selectedAccount?.id },
              })
            }
          >
            <IconRecord width={24} height={24} className="text-content-1" />
          </Pressable>
        }
      />
      <View className="gap-xl pt-xl flex-1">
        <View className="mb-xl px-5">
          <AccountSelection />
        </View>
        <View className="px-5">
          <Text className="text-paragraph-p2 text-content-4">
            <Trans>选择适合您的出金方式</Trans>
          </Text>
        </View>
        <View className="gap-xl px-5">
          {/* 加密货币取现 */}
          <CryptoWithdrawCard />
          {/* 银行卡取现 */}
          <BankWithdrawCard />
        </View>
      </View>
    </View>
  )
}

export default WithdrawScreen
