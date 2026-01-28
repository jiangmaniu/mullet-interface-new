import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { IconifyBell, IconifyCoinsSwap, IconifyCopy, IconifyEye, IconifyEyeClosed, IconifyNavArrowDown, IconifyPlusCircle, IconifySettings, IconifyUserCircle, IconPayment, IconRecord, IconWithdrawFunds } from '@/components/ui/icons';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { View, TouchableOpacity, TouchableHighlight } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { CollapsibleTab, CollapsibleTabScene, CollapsibleScrollView } from '@/components/ui/collapsible-tab';
import { AccountSwitcherModal } from './_comps/account-switcher-modal';
import { TransferHintModal } from '@/app/(tabs)/assets/_comps/transfer-hint-modal';
import { t } from '@/locales/i18n';
import { useResolveClassNames } from 'uniwind';

const REAL_ACCOUNTS = [
  { id: '88234912', type: 'STP' as const, balance: '10,234.50', currency: 'USD', leverage: '500', platform: 'MT5' as const, server: 'Mullet-Live', address: '0x862D...B22A' },
  { id: '88234913', type: 'STP' as const, balance: '5,000.00', currency: 'USD', leverage: '100', platform: 'MT5' as const, server: 'Mullet-Live', address: '0x1A2B...C3D4' },
]

const MOCK_ACCOUNTS = [
  { id: '10023491', type: '热门' as const, balance: '100,000.00', currency: 'USD', leverage: '500', platform: 'MT5' as const, server: 'Mullet-Demo', address: '0x0000...0000' },
]

export default function AssetsScreen() {
  const [currentAccount, setCurrentAccount] = useState<typeof REAL_ACCOUNTS[0] | typeof MOCK_ACCOUNTS[0]>(REAL_ACCOUNTS[0]);
  const [isSwitcherVisible, setIsSwitcherVisible] = useState(false);
  const [isTransferHintVisible, setIsTransferHintVisible] = useState(false);
  const { textColorContent1, backgroundColorPrimary } = useThemeColors();

  // Render the sticky header content that collapses
  const renderHeader = React.useCallback(() => {
    return (
      <View className="px-xl pt-2xl pb-xl gap-xl pointer-events-box-none">
        <AssetOverviewCard
          account={currentAccount}
          onPressSwitch={() => setIsSwitcherVisible(true)}
        />
        <AssetActions onPressTransfer={() => setIsTransferHintVisible(true)} />
      </View>
    );
  }, [currentAccount, setIsSwitcherVisible]);

  const headerStyle = useResolveClassNames('bg-secondary')
  const titleStyle = useResolveClassNames('text-important-1 text-content-1')
  return (
    <View className="flex-1">
      <Tabs.Screen
        options={{
          headerShown: true,
          title: t`资产`,
          headerStyle: headerStyle,
          headerTitleStyle: titleStyle,
          headerTitleAlign: 'left',
          headerShadowVisible: false,
          headerTitleContainerStyle: { paddingLeft: 0, left: -2, bottom: -2 },
          headerRightContainerStyle: { paddingRight: 12 },
          headerRight: () => (
            <View className="flex-row items-center gap-4">
              <TouchableOpacity onPress={() => { }}>
                <IconifyBell width={22} height={22} color={textColorContent1} />
              </TouchableOpacity>
              <TouchableOpacity>
                <IconifySettings width={22} height={22} color={textColorContent1} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <CollapsibleTab
        renderHeader={renderHeader}
        initialTabName="real"
        size='md'
        variant='underline'
        renderTabBarRight={() => (
          <TouchableOpacity hitSlop={10} className="items-center justify-center h-full" onPress={() => setIsSwitcherVisible(true)}>
            <IconifyPlusCircle width={20} height={20} className="text-content-1" />
          </TouchableOpacity>
        )}
      >
        <CollapsibleTabScene name="real" label={t`真实账户`}>
          <CollapsibleScrollView contentContainerStyle={{ padding: 12 }} showsVerticalScrollIndicator={false}>
            <View className='gap-medium py-xl'>
              {REAL_ACCOUNTS.map(account => (
                <AccountRow isReal key={account.id} {...account} onPress={() => { }} />
              ))}
            </View>
          </CollapsibleScrollView>
        </CollapsibleTabScene>
        <CollapsibleTabScene name="mock" label={t`模拟账户`}>
          <CollapsibleScrollView contentContainerStyle={{ padding: 12 }} showsVerticalScrollIndicator={false}>
            <View className='gap-medium py-xl'>
              {MOCK_ACCOUNTS.map(account => (
                <AccountRow isReal={false} key={account.id} {...account} onPress={() => { }} />
              ))}
            </View>
          </CollapsibleScrollView>
        </CollapsibleTabScene>
      </CollapsibleTab>

      <AccountSwitcherModal
        visible={isSwitcherVisible}
        onClose={() => setIsSwitcherVisible(false)}
      />

      <TransferHintModal
        open={isTransferHintVisible}
        onClose={() => setIsTransferHintVisible(false)}
        onCreateAccount={() => setIsTransferHintVisible(false)}
      />
    </View>
  );
}

interface AccountRowProps {
  id: string
  type: 'STP' | '热门'
  balance: string
  currency: string
  isReal?: boolean
  address?: string
  onPress?: () => void
}

export function AccountRow({
  id,
  type,
  balance,
  currency,
  isReal = true,
  address = '0x0000...0000',
  onPress
}: AccountRowProps) {
  const { textColorContent1, colorBrandPrimary, colorBrandSecondary1 } = useThemeColors()

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card>
        <CardContent className='gap-xs'>
          {/* Header: User & Badges */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-medium">
              <IconifyUserCircle width={20} height={20} color={textColorContent1} />
              <Text className="text-paragraph-p1 text-content-1">{id}</Text>
            </View>

            <View className="flex-row items-center gap-medium">
              <Badge color={isReal ? 'rise' : 'secondary'} >
                <Text>{isReal ? <Trans>真实</Trans> : <Trans>模拟</Trans>}</Text>
              </Badge>
              <Badge color='default'>
                <Text>{type.toUpperCase()}</Text>
              </Badge>
            </View>
          </View>

          {/* Balance */}
          <View className="flex-row items-center justify-between min-h-[24px]">
            <Text className="text-paragraph-p3 text-content-4"><Trans>账户余额</Trans></Text>
            <View className="flex-row items-center gap-xs">
              <Text className="text-paragraph-p3 text-content-1">{balance} {currency}</Text>
              <TouchableOpacity>
                <IconifyPlusCircle width={14} height={14} color={colorBrandPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Address */}
          {isReal && <View className="flex-row items-center justify-between min-h-[24px]">
            <Text className="text-paragraph-p3 text-content-4"><Trans>地址</Trans></Text>
            <View className="flex-row items-center gap-xs">
              <Text className="text-paragraph-p3 text-content-1">{address}</Text>
              <TouchableOpacity>
                <IconifyCopy width={20} height={20} color={colorBrandSecondary1} />
              </TouchableOpacity>
            </View>
          </View>}
        </CardContent>
      </Card>
    </TouchableOpacity>
  )
}

interface AssetOverviewCardProps {
  account: typeof REAL_ACCOUNTS[0] | typeof MOCK_ACCOUNTS[0];
  onPressSwitch: () => void;
}

function AssetOverviewCard({ account, onPressSwitch }: AssetOverviewCardProps) {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const { textColorContent4, textColorContent1 } = useThemeColors();

  // Determine if it is a real account based on the list it comes from or a property.
  // The mock data doesn't explicitly say "isReal" but we can infer or pass it.
  // For now checking if it's in REAL_ACCOUNTS by ID or we can add a helper.
  // Actually the account object has `type` which might help, or we can just assume based on tab context.
  // But wait, `currentAccount` comes from the switcher which mixes them.
  // Let's add a helper or just check id existence in REAL_ACCOUNTS.
  const isReal = REAL_ACCOUNTS.some(a => a.id === account.id);

  return (
    <Card className="px-xl py-2xl gap-xl">
      {/* 账户信息 */}
      <TouchableHighlight onPress={onPressSwitch} underlayColor="transparent">
        <View className="flex-row items-center justify-between gap-2xl bg-special rounded-small px-xl py-xs h-8">
          <View className="flex-row items-center gap-medium">
            <View className="flex-row items-center gap-xs">
              <IconifyUserCircle width={20} height={20} className="text-content-1" />
              <Text className="text-content-1 text-paragraph-p2">{account.id}</Text>
            </View>
            <Badge color={isReal ? "rise" : "secondary"}><Text>{isReal ? <Trans>真实</Trans> : <Trans>模拟</Trans>}</Text></Badge>
            <Badge><Text>{account.type.toUpperCase()}</Text></Badge>
          </View>
          <IconifyNavArrowDown width={16} height={16} className="text-content-1" />
        </View>
      </TouchableHighlight>

      {/* 资产信息 */}
      <View className="gap-xl">
        <View className="flex-col gap-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="text-paragraph-p2 text-content-4"><Trans>总资产</Trans></Text>
              <TouchableOpacity onPress={() => setIsBalanceHidden(!isBalanceHidden)}>
                {isBalanceHidden ? (
                  <IconifyEyeClosed width={16} height={16} color={textColorContent4} />
                ) : (
                  <IconifyEye width={16} height={16} color={textColorContent4} />
                )}
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center gap-medium">
              <Text className="text-muted-foreground text-sm">{account.address}</Text>
              <IconifyCopy width={16} height={16} color={textColorContent1} />
            </View>
          </View>

          <View className="flex-row items-end justify-between">
            <View className="flex-row items-baseline gap-medium">
              <Text className="text-title-h3 text-content-1">
                {isBalanceHidden ? '******' : account.balance}
              </Text>
              <Text className="text-paragraph-p2 text-content-1">{account.currency}</Text>
            </View>
            <Text className="text-paragraph-p2 text-market-rise">+0.00</Text>
          </View>
        </View>
      </View>

      {/* 分割线 */}
      <Separator />

      {/* 详情列表 */}
      <View className="gap-xs">
        <View className="flex-row justify-between items-center">
          <Text className="text-paragraph-p3 text-content-4"><Trans>账户余额</Trans></Text>
          <Text className="text-paragraph-p3 text-content-1">
            {isBalanceHidden ? '******' : `${account.balance} ${account.currency}`}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-paragraph-p3 text-content-4"><Trans>可用</Trans></Text>
          <Text className="text-paragraph-p3 text-content-1">
            {isBalanceHidden ? '******' : `${account.balance} ${account.currency}`}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-paragraph-p3 text-content-4"><Trans>占用</Trans></Text>
          <Text className="text-paragraph-p3 text-content-1">
            {isBalanceHidden ? '******' : `0.00 ${account.currency}`}
          </Text>
        </View>
      </View>
    </Card>
  );
}


function AssetActions({ onPressTransfer }: { onPressTransfer?: () => void }) {

  return (
    <View className='flex-row items-center justify-between px-xl py-xl'>
      <TouchableOpacity>
        <View className="flex-col items-center">
          <View className='p-medium'>
            <IconWithdrawFunds width={24} height={24} />
          </View>
          <Text className="text-paragraph-p3 text-content-1"><Trans>取现</Trans></Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity>
        <View className="flex-col items-center">
          <View className='p-medium'>
            <IconPayment width={24} height={24} />
          </View>
          <Text className="text-paragraph-p3 text-content-1"><Trans>存款</Trans></Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressTransfer}>
        <View className="flex-col items-center">
          <View className='p-medium'>
            <IconifyCoinsSwap width={24} height={24} />
          </View>
          <Text className="text-paragraph-p3 text-content-1"><Trans>划转</Trans></Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity>
        <View className="flex-col items-center">
          <View className='p-medium'>
            <IconRecord width={24} height={24} />
          </View>
          <Text className="text-paragraph-p3 text-content-1"><Trans>账单</Trans></Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}
