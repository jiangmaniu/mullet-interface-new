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
import { Spinning } from '@/components/ui/spinning'
import { Text } from '@/components/ui/text'
import { useAccountSynopsis } from '@/hooks/account/use-account-synopsis'
import { useRootStore } from '@/stores'
import { createRealAccountInfoSelector, userInfoActiveTradeAccountIdSelector } from '@/stores/user-slice/infoSlice'
import { BNumber } from '@mullet/utils/number'

import { useAccountExtractable } from '../../_apis/use-account-extractable'
import { useSelectedWithdrawAccount } from '../../_hooks/use-selected-account'
import { useWithdrawStore } from '../../_store'

export const AccountSelection = observer(function AccountSelection() {
  const activeTradeAccountId = useRootStore(userInfoActiveTradeAccountIdSelector)
  const params = useLocalSearchParams<{ accountId?: string }>()
  const setSelectedAccountId = useWithdrawStore((s) => s.setSelectedAccountId)
  const selectedAccountId = useWithdrawStore((s) => s.selectedAccountId)

  const selectedAccount = useSelectedWithdrawAccount()
  const drawerRef = useRef<DrawerRef>(null)

  // 获取可提取余额
  const { data: extractableBalance, isLoading: isLoadingBalance } = useAccountExtractable(selectedAccount?.id)

  // 使用 ref 保存最新的 setter 函数
  const setSelectedAccountIdRef = useRef(setSelectedAccountId)
  useEffect(() => {
    setSelectedAccountIdRef.current = setSelectedAccountId
  }, [setSelectedAccountId])

  // 初始化选中的账户，只监听 params.accountId，内部通过 get 方式读取最新状态
  useEffect(() => {
    if (selectedAccountId) return
    const state = useRootStore.getState()

    if (params.accountId) {
      const account = createRealAccountInfoSelector(params.accountId)(state)
      if (account) {
        setSelectedAccountIdRef.current(account.id)
        return
      }
    }

    // Fallback 到当前交易账户
    const account = createRealAccountInfoSelector(activeTradeAccountId)(state)
    if (account) {
      setSelectedAccountIdRef.current(account.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.accountId])

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
            <View className="gap-xs flex-row items-center">
              <Text className="text-paragraph-p3 text-content-1">
                <Trans>
                  余额：
                  {!isLoadingBalance &&
                    BNumber.toFormatNumber(extractableBalance, {
                      unit: selectedAccount?.currencyUnit,
                      volScale: selectedAccount?.currencyDecimal,
                    })}
                </Trans>
              </Text>
              {isLoadingBalance && <Spinning height={12} width={12} />}
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
