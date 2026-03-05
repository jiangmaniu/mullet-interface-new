import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import React, { useRef } from 'react'
import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'

import {
  TradeSimulateAccountDepositDrawer,
  TradeSimulateAccountDepositDrawerRef,
} from '@/components/drawers/trade-simulate-account-deposit-drawer'
import { IconifyCoinsSwap, IconPayment, IconRecord, IconWithdrawFunds } from '@/components/ui/icons'
import { Text } from '@/components/ui/text'
import { useStores } from '@/v1/provider/mobxProvider'

const RealAccountActions = observer(({ account }: { account: User.AccountItem }) => {
  const router = useRouter()

  const handlePressDeposit = () => {
    // 跳转到存款页面，传入当前账户 ID
    router.push({ pathname: '/deposit', params: { accountId: account.id } })
  }

  const handlePressWithdraw = () => {
    // 跳转到取现页面，传入当前账户 ID
    router.push({ pathname: '/withdraw', params: { accountId: account.id } })
  }

  // const transferHintModalRef = useRef<ModalRef>(null)

  const handlePressTransfer = () => {
    // 跳转到划转页面，传入当前账户 ID
    router.push({ pathname: '/transfer', params: { accountId: account.id } })
  }

  const handlePressBill = () => {
    router.push('/(assets)/bills')
  }

  return (
    <>
      <View className="px-xl py-xl flex-row items-center justify-between">
        {!account.isSimulate && (
          <Pressable onPress={handlePressWithdraw}>
            <View className="flex-col items-center">
              <View className="p-medium">
                <IconWithdrawFunds width={24} height={24} />
              </View>
              <Text className="text-paragraph-p3 text-content-1">
                <Trans>取现</Trans>
              </Text>
            </View>
          </Pressable>
        )}

        <Pressable onPress={handlePressDeposit}>
          <View className="flex-col items-center">
            <View className="p-medium">
              <IconPayment width={24} height={24} />
            </View>
            <Text className="text-paragraph-p3 text-content-1">
              <Trans>存款</Trans>
            </Text>
          </View>
        </Pressable>

        <Pressable onPress={handlePressTransfer}>
          <View className="flex-col items-center">
            <View className="p-medium">
              <IconifyCoinsSwap width={24} height={24} className="text-content-1" />
            </View>
            <Text className="text-paragraph-p3 text-content-1">
              <Trans>划转</Trans>
            </Text>
          </View>
        </Pressable>

        <Pressable onPress={handlePressBill}>
          <View className="flex-col items-center">
            <View className="p-medium">
              <IconRecord width={24} height={24} />
            </View>
            <Text className="text-paragraph-p3 text-content-1">
              <Trans>账单</Trans>
            </Text>
          </View>
        </Pressable>
      </View>

      {/* <TransferHintModal
        ref={transferHintModalRef}
        onCreateAccount={() => setIsTransferHintVisible(false)}
      /> */}
    </>
  )
})

const SimulateAccountActions = observer(({ account }: { account: User.AccountItem }) => {
  const tradeSimulateAccountDepositDrawerRef = useRef<TradeSimulateAccountDepositDrawerRef>(null)

  return (
    <>
      <View className="px-xl py-xl flex-row items-center justify-between">
        <>
          <Pressable
            onPress={() => {
              tradeSimulateAccountDepositDrawerRef.current?.open()
            }}
          >
            <View className="flex-col items-center">
              <View className="p-medium">
                <IconPayment width={24} height={24} />
              </View>
              <Text className="text-paragraph-p3 text-content-1">
                <Trans>存款</Trans>
              </Text>
            </View>
          </Pressable>

          <TradeSimulateAccountDepositDrawer ref={tradeSimulateAccountDepositDrawerRef} account={account} />
        </>
      </View>
    </>
  )
})

export const TradeAccountActions = observer(() => {
  const { trade } = useStores()
  const account = trade.currentAccountInfo

  if (account.isSimulate) {
    return <SimulateAccountActions account={account} />
  }
  return <RealAccountActions account={account} />
})
