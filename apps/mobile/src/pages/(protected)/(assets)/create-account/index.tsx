import { Trans } from '@lingui/react/macro'
import React, { createContext, useContext, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBoolean } from 'ahooks'
import { router, useLocalSearchParams } from 'expo-router'

import { EmptyState } from '@/components/states/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  CollapsibleScrollView,
  CollapsibleStickyContent,
  CollapsibleStickyHeader,
  CollapsibleStickyNavBar,
  CollapsibleTab,
  CollapsibleTabScene,
} from '@/components/ui/collapsible-tab'
import { IconifyUserCircle } from '@/components/ui/icons'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'
import { useAccountSynopsis } from '@/hooks/account/use-account-synopsis'
import { useStores } from '@/v1/provider/mobxProvider'
import { AddAccount } from '@/v1/services/tradeCore/account'
import { AccountGroup } from '@/v1/services/tradeCore/accountGroup/typings'
import { t } from '@lingui/core/macro'

import { useAccountGroupList } from './_apis/use-account-group-list'

interface AccountGroupCardProps {
  accountGroup: AccountGroup.AccountGroupItem
}

function AccountGroupCard({ accountGroup }: AccountGroupCardProps) {
  const { selectedAccountGroup, setSelectedAccountGroup } = useCrateAccountScreenContext()
  const isMock = accountGroup?.isSimulate
  const isSelected = selectedAccountGroup?.id === accountGroup.id
  const synopsis = useAccountSynopsis(accountGroup.synopsis)

  return (
    <Pressable onPress={() => setSelectedAccountGroup(accountGroup)}>
      <Card className={isSelected ? 'border-brand-primary' : ''}>
        <CardContent className="gap-xs p-xl">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="gap-xs flex-1 flex-row items-center justify-center">
              <IconifyUserCircle width={20} height={20} className="text-content-1" />
              <Text className="text-paragraph-p1 text-content-1 flex-1" numberOfLines={1}>
                {synopsis?.name || accountGroup?.groupName}
              </Text>
            </View>

            <View className="gap-xs flex-row items-center">
              {synopsis.tag && (
                <Badge color={isMock ? 'secondary' : 'green'}>
                  <Text>{synopsis.tag}</Text>
                </Badge>
              )}
              {synopsis.abbr && (
                <Badge color="default">
                  <Text>{synopsis.abbr}</Text>
                </Badge>
              )}
            </View>
          </View>

          {(synopsis?.remark || accountGroup.remark) && (
            <View>
              <Text className="text-paragraph-p3 text-content-3">{synopsis?.remark || accountGroup.remark}</Text>
            </View>
          )}

          {/* Details */}
          <View className="gap-xs mt-2">
            {synopsis?.list?.map((item: { title: string; content: string }, index: number) => {
              return (
                <View className="h-6 flex-row items-center justify-between" key={index}>
                  <Text className="text-paragraph-p3 text-content-4">{item.title}</Text>
                  <Text className="text-paragraph-p3 text-content-1">{item.content}</Text>
                </View>
              )
            })}
          </View>
        </CardContent>
      </Card>
    </Pressable>
  )
}

// --- Main Screen ---

const CrateAccountScreenContext = createContext<{
  selectedAccountGroup: AccountGroup.AccountGroupItem | null
  setSelectedAccountGroup: (accountGroup: AccountGroup.AccountGroupItem | null) => void
}>({} as any)

function useCrateAccountScreenContext() {
  return useContext(CrateAccountScreenContext)
}

export default function CrateAccountScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>()
  const [selectedAccountGroup, setSelectedAccountGroup] = useState<AccountGroup.AccountGroupItem | null>(null)

  const renderHeader = React.useCallback(() => {
    return (
      <CollapsibleStickyHeader className="bg-secondary">
        <CollapsibleStickyNavBar>
          <ScreenHeader content={<Trans>创建账户</Trans>} />
        </CollapsibleStickyNavBar>

        <CollapsibleStickyContent className="p-xl">
          <Text className="text-paragraph-p4 text-content-4">
            <Trans>
              您最多可以创建10个账户，允许您独立管理每个账户的资产，并灵活分配杠杆率和保证金使用情况。资金可以在帐户之间快速转移，以实现高效的资金配置和方便的交易统计追踪。
            </Trans>
          </Text>
        </CollapsibleStickyContent>
      </CollapsibleStickyHeader>
    )
  }, [])

  const [isLoading, { setTrue: setIsLoadingTrue, setFalse: setIsLoadingFalse }] = useBoolean(false)
  const { user } = useStores()
  const selectedSynopsis = useAccountSynopsis(selectedAccountGroup?.synopsis)

  const handleCreateAccount = async () => {
    if (!selectedAccountGroup) return

    try {
      setIsLoadingTrue()

      const name = selectedSynopsis?.name || selectedAccountGroup.groupName

      const result = await AddAccount({
        accountGroupId: selectedAccountGroup.id,
        clientId: user.currentUser?.user_id,
        name: name,
      })
      if (result?.success) {
        const userInfo = await user.fetchUserInfo(true)
        console.log(userInfo)

        toast.success(t`创建账户成功`, {
          onAutoClose: () => {
            switchCreatedAccount()
          },
        })
      }
    } finally {
      setIsLoadingFalse()
    }
  }

  const switchCreatedAccount = () => {
    const tab = selectedAccountGroup?.isSimulate ? 'mock' : 'real'
    router.replace({ pathname: '/assets', params: { tab } })
  }

  return (
    <CrateAccountScreenContext.Provider value={{ selectedAccountGroup, setSelectedAccountGroup }}>
      <View className="bg-secondary relative flex-1">
        <CollapsibleTab
          renderHeader={renderHeader}
          initialTabName={tab === 'mock' ? 'mock' : 'real'}
          size="md"
          variant="underline"
          scrollEnabled={false} // Disable scroll to make tabs fill width (flex-1)
          // onIndexChange={() => setSelectedAccount(null)}
        >
          <CollapsibleTabScene name="real" label={t`真实账户`}>
            <RealAccountGroupList />
          </CollapsibleTabScene>

          <CollapsibleTabScene name="mock" label={t`模拟账户`}>
            <SimulateAccountGroupList />
          </CollapsibleTabScene>
        </CollapsibleTab>

        {/* 底部按钮 */}
        <SafeAreaView edges={['bottom']}>
          <View className="py-3xl px-5">
            <Button
              size="lg"
              color="primary"
              disabled={!selectedAccountGroup}
              onPress={handleCreateAccount}
              loading={isLoading}
            >
              <Text>
                <Trans>创建账户</Trans>
              </Text>
            </Button>
          </View>
        </SafeAreaView>
      </View>
    </CrateAccountScreenContext.Provider>
  )
}

function RealAccountGroupList() {
  const { data: accountGroupList = [], isLoading, refetch, isRefetching } = useAccountGroupList()

  const realAccountGroupList = React.useMemo(
    () => accountGroupList.filter((group) => !group.isSimulate),
    [accountGroupList],
  )

  const isInitialLoading = isLoading && realAccountGroupList.length === 0
  const isEmpty = !isLoading && realAccountGroupList.length === 0

  return (
    <CollapsibleScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 80 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
    >
      <View className="gap-medium p-xl">
        {isInitialLoading ? (
          <View className="py-3xl items-center">
            <ActivityIndicator />
          </View>
        ) : isEmpty ? (
          <View className="items-center py-[60px]">
            <EmptyState message={<Trans>暂无真实账户组</Trans>} />
          </View>
        ) : (
          realAccountGroupList.map((accountGroup) => (
            <AccountGroupCard key={accountGroup.id} accountGroup={accountGroup} />
          ))
        )}
      </View>
    </CollapsibleScrollView>
  )
}

function SimulateAccountGroupList() {
  const { data: accountGroupList = [], isLoading, refetch, isRefetching } = useAccountGroupList()

  const simulateAccountGroupList = React.useMemo(
    () => accountGroupList.filter((group) => group.isSimulate),
    [accountGroupList],
  )

  const isInitialLoading = isLoading && simulateAccountGroupList.length === 0
  const isEmpty = !isLoading && simulateAccountGroupList.length === 0

  return (
    <CollapsibleScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 80 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
    >
      <View className="gap-medium p-xl">
        {isInitialLoading ? (
          <View className="py-3xl items-center">
            <ActivityIndicator />
          </View>
        ) : isEmpty ? (
          <View className="items-center py-[60px]">
            <EmptyState message={<Trans>暂无模拟账户组</Trans>} />
          </View>
        ) : (
          simulateAccountGroupList.map((accountGroup) => (
            <AccountGroupCard key={accountGroup.id} accountGroup={accountGroup} />
          ))
        )}
      </View>
    </CollapsibleScrollView>
  )
}
