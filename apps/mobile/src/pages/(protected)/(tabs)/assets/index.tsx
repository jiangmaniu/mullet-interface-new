import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { Pressable, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'

import { IconButton } from '@/components/ui/button'
import {
  CollapsibleScrollView,
  CollapsibleStickyContent,
  CollapsibleStickyHeader,
  CollapsibleStickyNavBar,
  CollapsibleTab,
  CollapsibleTabScene,
} from '@/components/ui/collapsible-tab'
import { IconifyBell, IconifyPlusCircle, IconifySettings } from '@/components/ui/icons'
import { ScreenHeader } from '@/components/ui/screen-header'
import { useI18n } from '@/hooks/use-i18n'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { NotificationBadge } from '@/pages/(protected)/(home)/notifications/_comps/notification-badge'
import { useUnreadCount } from '@/pages/(protected)/(home)/notifications/_hooks/use-unread-count'
import { msg } from '@lingui/core/macro'

import { RealAccountList, SimulateAccountList } from './_comps/account-list'
import { TradeAccountActions } from './_comps/trade-account-actions.tsx'
import { TradeAccountOverviewCard } from './_comps/trade-account-overview-card.tsx'

export default observer(function AssetsScreen() {
  const { textColorContent1 } = useThemeColors()
  const { tab } = useLocalSearchParams<{ tab?: string }>()
  const { data: unreadCount = 0 } = useUnreadCount()
  const { renderLinguiMsg } = useI18n()

  const renderHeader = () => {
    return (
      <CollapsibleStickyHeader className="bg-secondary">
        <CollapsibleStickyNavBar>
          <ScreenHeader
            showBackButton={false}
            content={<Trans>资产</Trans>}
            right={
              <View className="flex-row items-center gap-4">
                <Pressable onPress={() => router.push('/notifications')} className="relative">
                  <IconifyBell width={22} height={22} color={textColorContent1} />
                  <NotificationBadge count={unreadCount} />
                </Pressable>
                <Pressable onPress={() => router.push('/settings')}>
                  <IconifySettings width={22} height={22} color={textColorContent1} />
                </Pressable>
              </View>
            }
          />
        </CollapsibleStickyNavBar>

        <CollapsibleStickyContent className="px-xl pb-xl gap-xl pt-4">
          {/* 资产概览 */}
          <TradeAccountOverviewCard />
          {/* 操作 */}
          <TradeAccountActions />
        </CollapsibleStickyContent>
      </CollapsibleStickyHeader>
    )
  }

  const [currentTab, setCurrentTab] = useState(tab === 'mock' ? 'mock' : 'real')

  const handleAccountManage = () => {
    router.push({ pathname: '/create-account', params: { tab: currentTab } })
  }

  return (
    <View className="bg-secondary flex-1">
      <CollapsibleTab
        renderHeader={renderHeader}
        initialTabName={tab === 'mock' ? 'mock' : 'real'}
        size="md"
        variant="underline"
        onIndexChange={(index) => setCurrentTab(index === 0 ? 'real' : 'mock')}
        renderTabBarRight={() => (
          <IconButton onPress={() => handleAccountManage()}>
            <IconifyPlusCircle width={20} height={20} />
          </IconButton>
        )}
      >
        <CollapsibleTabScene name="real" label={renderLinguiMsg(msg`真实账户`)}>
          <CollapsibleScrollView contentContainerStyle={{ padding: 12 }}>
            <View className="gap-medium py-xl">
              <RealAccountList />
            </View>
          </CollapsibleScrollView>
        </CollapsibleTabScene>

        <CollapsibleTabScene name="mock" label={renderLinguiMsg(msg`模拟账户`)}>
          <CollapsibleScrollView contentContainerStyle={{ padding: 12 }}>
            <View className="gap-medium py-xl">
              <SimulateAccountList />
            </View>
          </CollapsibleScrollView>
        </CollapsibleTabScene>
      </CollapsibleTab>
    </View>
  )
})
