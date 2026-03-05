import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useRef } from 'react'
import { Pressable, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

import { RealAccountSelectionDrawer } from '@/components/drawers/real-account-selector-drawer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DrawerRef } from '@/components/ui/drawer'
import { IconifyNavArrowDown, IconifyUserCircle } from '@/components/ui/icons'
import { Text } from '@/components/ui/text'
import { useStores } from '@/v1/provider/mobxProvider'
import { getAccountSynopsisByLng } from '@/v1/utils/business'
import { BNumber } from '@mullet/utils/number'

import { useWithdrawStore } from '../../_store'

export const AccountSelection = observer(function AccountSelection() {
  const { user, trade } = useStores()
  const withdrawSourceAccount = useWithdrawStore((s) => s.withdrawSourceAccount)
  const setWithdrawSourceAccount = useWithdrawStore((s) => s.setWithdrawSourceAccount)
  const drawerRef = useRef<DrawerRef>(null)

  const accountList = useMemo(() => user.realAccountList ?? [], [user.realAccountList])
  const { accountId } = useLocalSearchParams<{ accountId?: string }>()

  // 初始化源账户
  useEffect(() => {
    if (accountList.length === 0 || withdrawSourceAccount) return
    const account = accountId
      ? (accountList.find((a) => a.id === accountId) ?? accountList[0])
      : (accountList.find((a) => a.id === trade.currentAccountInfo?.id) ?? accountList[0])
    if (account) setWithdrawSourceAccount(account)
  }, [accountId, accountList, trade.currentAccountInfo?.id, withdrawSourceAccount, setWithdrawSourceAccount])

  const selectedAccount = withdrawSourceAccount
  const synopsis = selectedAccount ? getAccountSynopsisByLng(selectedAccount.synopsis) : null

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
        onSelect={setWithdrawSourceAccount}
      />
    </>
  )
})
