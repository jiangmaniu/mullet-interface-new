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
import { useStores } from '@/v1/provider/mobxProvider'
import { useAccountSynopsis } from '@/hooks/account/use-account-synopsis'
import { BNumber } from '@mullet/utils/number'

import { useSelectedWithdrawAccount } from '../../_hooks/use-selected-account'
import { useWithdrawStore } from '../../_store'

export const AccountSelection = observer(function AccountSelection() {
  const { user, trade } = useStores()
  const params = useLocalSearchParams<{ accountId?: string }>()

  const setSelectedAccountId = useWithdrawStore((s) => s.setSelectedAccountId)
  const selectedAccountId = useWithdrawStore((s) => s.selectedAccountId)

  const selectedAccount = useSelectedWithdrawAccount()
  const drawerRef = useRef<DrawerRef>(null)

  // 使用 ref 保存最新的 setter 函数
  const setSelectedAccountIdRef = useRef(setSelectedAccountId)
  useEffect(() => {
    setSelectedAccountIdRef.current = setSelectedAccountId
  }, [setSelectedAccountId])

  // 初始化选中的账户
  useEffect(() => {
    // 如果已经有选中的账户，不再初始化
    if (selectedAccountId) return

    // 优先使用路由参数中的 accountId
    if (params.accountId) {
      const account = user.realAccountList.find((a) => a.id === params.accountId)
      if (account) {
        setSelectedAccountIdRef.current(account.id)
        return
      }
    }

    // Fallback 到当前交易账户
    if (trade.currentAccountInfo?.id) {
      const account = user.realAccountList.find((a) => a.id === trade.currentAccountInfo?.id)
      if (account) {
        setSelectedAccountIdRef.current(account.id)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.accountId, selectedAccountId])

  const synopsis = useAccountSynopsis(selectedAccount?.synopsis)

  const handleSelectAccount = (account: User.AccountItem) => {
    setSelectedAccountIdRef.current(account.id)
  }

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
        onSelect={handleSelectAccount}
      />
    </>
  )
})
