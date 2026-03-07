import { IconifyBell, IconifyPlusCircle, IconifySettings } from '@/components/ui/icons';
import { Trans } from '@lingui/react/macro';
import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { CollapsibleTab, CollapsibleTabScene, CollapsibleScrollView, CollapsibleStickyNavBar, CollapsibleStickyContent, CollapsibleStickyHeader } from '@/components/ui/collapsible-tab';
import { t } from '@/locales/i18n';
import { ScreenHeader } from '@/components/ui/screen-header';
import { router, useLocalSearchParams } from 'expo-router';
import { IconButton } from '@/components/ui/button';
import { observer } from 'mobx-react-lite';
import { TradeAccountOverviewCard } from './_comps/trade-account-overview-card.tsx';
import { TradeAccountActions } from './_comps/trade-account-actions.tsx';
import { RealAccountList, SimulateAccountList } from './_comps/account-list';
import { useUnreadCount } from '@/pages/(protected)/(home)/notifications/_hooks/use-unread-count';
import { NotificationBadge } from '@/pages/(protected)/(home)/notifications/_comps/notification-badge';

export default observer(function AssetsScreen() {
  const { textColorContent1 } = useThemeColors();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const { data: unreadCount = 0 } = useUnreadCount();

  const renderHeader = () => {
    return (
      <CollapsibleStickyHeader className="bg-secondary" >
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

        <CollapsibleStickyContent className="px-xl pt-4 pb-xl gap-xl">
          {/* 资产概览 */}
          <TradeAccountOverviewCard />
          {/* 操作 */}
          <TradeAccountActions />
        </CollapsibleStickyContent>
      </CollapsibleStickyHeader>
    );
  }

  const [currentTab, setCurrentTab] = useState(tab === 'mock' ? 'mock' : 'real');

  const handleAccountManage = () => {
    router.push({ pathname: '/create-account', params: { tab: currentTab } })
  }

  return (
    <View className="flex-1 bg-secondary">
      <CollapsibleTab
        renderHeader={renderHeader}
        initialTabName={tab === 'mock' ? 'mock' : 'real'}
        size='md'
        variant='underline'
        onIndexChange={(index) => setCurrentTab(index === 0 ? 'real' : 'mock')}
        renderTabBarRight={() => (
          <IconButton
            onPress={() => handleAccountManage()}
          >
            <IconifyPlusCircle width={20} height={20} />
          </IconButton>
        )}
      >
        <CollapsibleTabScene name="real" label={t`真实账户`}>
          <CollapsibleScrollView contentContainerStyle={{ padding: 12 }}>
            <View className='gap-medium py-xl'>
              <RealAccountList />
            </View>
          </CollapsibleScrollView>
        </CollapsibleTabScene>

        <CollapsibleTabScene name="mock" label={t`模拟账户`}>
          <CollapsibleScrollView contentContainerStyle={{ padding: 12 }}>
            <View className='gap-medium py-xl'>
              <SimulateAccountList />
            </View>
          </CollapsibleScrollView>
        </CollapsibleTabScene>
      </CollapsibleTab>
    </View>
  );
})
