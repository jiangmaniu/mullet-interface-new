import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import { Pressable, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

import { RealAccountSelectionDrawer } from '@/components/drawers/real-account-selector-drawer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DrawerRef } from '@/components/ui/drawer'
import { IconifyNavArrowDown, IconifyUserCircle } from '@/components/ui/icons'
import { Text } from '@/components/ui/text'
import { useAccountSynopsis } from '@/hooks/account/use-account-synopsis'
import { useRootStore } from '@/stores'
import {
  createRealAccountInfoSelector,
  userInfoActiveTradeAccountInfoSelector,
  userInfoRealAccountListSelector,
} from '@/stores/user-slice/infoSlice'
import { BNumber } from '@mullet/utils/number'

import { useDepositActions, useDepositState } from '../../_hooks/use-deposit-state'
import { useSelectedDepositAccount } from '../../_hooks/use-selected-account'

export const DepositAccountSelector = observer(function DepositAccountSelector() {
  const { selectedAccountId } = useDepositState()
  const { setSelectedAccountId } = useDepositActions()
  const selectedAccount = useSelectedDepositAccount()
  const drawerRef = useRef<DrawerRef>(null)
  const { accountId } = useLocalSearchParams<{ accountId?: string }>()

  // 初始化目标账户，只监听 accountId 变化，内部通过 get 方式读取最新状态
  useEffect(() => {
    if (selectedAccountId) return
    const state = useRootStore.getState()
    const realAccountList = userInfoRealAccountListSelector(state)
    if (realAccountList.length === 0) return

    const account =
      createRealAccountInfoSelector(accountId)(state) ??
      userInfoActiveTradeAccountInfoSelector(state) ??
      realAccountList[0]

    if (account) setSelectedAccountId(account.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId])

  const synopsis = useAccountSynopsis(selectedAccount?.synopsis)

  return (
    <>
      <Pressable onPress={() => drawerRef.current?.open()}>
        <Card className="rounded-small">
          <CardContent className="py-xl px-xl gap-medium">
            <View className="flex-row items-center justify-between">
              <View className="gap-xl flex-row items-center">
                <View className="gap-xs flex-row items-center">
                  <IconifyUserCircle width={24} height={24} className="text-content-1" />
                  <Text className="text-paragraph-p2 text-content-1">{selectedAccount?.id}</Text>
                </View>
                <View className="gap-medium flex-row items-center">
                  {selectedAccount && !selectedAccount.isSimulate && (
                    <Badge color="green">
                      <Text>
                        <Trans>真实</Trans>
                      </Text>
                    </Badge>
                  )}
                  {synopsis && (
                    <Badge color="default">
                      <Text>{synopsis.abbr}</Text>
                    </Badge>
                  )}
                </View>
              </View>
              <IconifyNavArrowDown width={16} height={16} className="text-content-4" />
            </View>
            <View>
              <Text className="text-paragraph-p3 text-content-1">
                <Trans>
                  余额：
                  {BNumber.toFormatNumber(selectedAccount?.money, {
                    unit: selectedAccount?.currencyUnit,
                    volScale: selectedAccount?.currencyDecimal,
                  })}
                </Trans>
              </Text>
            </View>
          </CardContent>
        </Card>
      </Pressable>
      <RealAccountSelectionDrawer
        ref={drawerRef}
        selectedAccountId={selectedAccount?.id}
        onSelect={(account) => setSelectedAccountId(account.id)}
      />
    </>
  )
})
