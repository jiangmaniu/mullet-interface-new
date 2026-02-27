import { IconifyCoinsSwap, IconPayment, IconRecord, IconWithdrawFunds } from '@/components/ui/icons';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import React, { useRef } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/v1/provider/mobxProvider';
import { TradeSimulateAccountDepositDrawer, TradeSimulateAccountDepositDrawerRef } from '@/components/drawers/trade-simulate-account-deposit-drawer';

const RealAccountActions = observer(({ account }: { account: User.AccountItem }) => {
  const router = useRouter();

  const handlePressDeposit = () => {
    const isPrivy = true;
    if (isPrivy) {
      router.push('/(assets)/deposit/privy');
      return;
    }
    router.push('/(assets)/deposit/wallet')
  }


  const handlePressWithdraw = () => {
    const isPrivy = true;
    if (isPrivy) {
      router.push('/(assets)/withdraw/privy');
      return;
    }
    router.push('/(assets)/withdraw/wallet');
  }

  // const transferHintModalRef = useRef<ModalRef>(null)

  const handlePressTransfer = () => {
    // 跳转到划转页面，传入当前账户 ID
    router.push({ pathname: '/transfer', params: { accountId: account.id } })
  }

  const handlePressBill = () => {
    router.push('/(assets)/bills');
  }

  return (
    <>
      <View className='flex-row items-center justify-between px-xl py-xl'>
        {!account.isSimulate && <Pressable onPress={handlePressWithdraw}>
          <View className="flex-col items-center">
            <View className='p-medium'>
              <IconWithdrawFunds width={24} height={24} />
            </View>
            <Text className="text-paragraph-p3 text-content-1"><Trans>取现</Trans></Text>
          </View>
        </Pressable>
        }

        <Pressable onPress={handlePressDeposit}>
          <View className="flex-col items-center">
            <View className='p-medium'>
              <IconPayment width={24} height={24} />
            </View>
            <Text className="text-paragraph-p3 text-content-1"><Trans>存款</Trans></Text>
          </View>
        </Pressable>

        <Pressable onPress={handlePressTransfer}>
          <View className="flex-col items-center">
            <View className='p-medium'>
              <IconifyCoinsSwap width={24} height={24} className='text-content-1' />
            </View>
            <Text className="text-paragraph-p3 text-content-1"><Trans>划转</Trans></Text>
          </View>
        </Pressable>

        <Pressable onPress={handlePressBill}>
          <View className="flex-col items-center">
            <View className='p-medium'>
              <IconRecord width={24} height={24} />
            </View>
            <Text className="text-paragraph-p3 text-content-1"><Trans>账单</Trans></Text>
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
      <View className='flex-row items-center justify-between px-xl py-xl'>
        <>
          <Pressable onPress={() => { tradeSimulateAccountDepositDrawerRef.current?.open() }}>
            <View className="flex-col items-center">
              <View className='p-medium'>
                <IconPayment width={24} height={24} />
              </View>
              <Text className="text-paragraph-p3 text-content-1"><Trans>存款</Trans></Text>
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
