import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { IconDepthTB, IconifyBell, IconifyCoinsSwap, IconifyCopy, IconifyEye, IconifyEyeClosed, IconifyNavArrowDown, IconifyPlusCircle, IconifySettings, IconifyUserCircle, IconPayment, IconRecord, IconWithdrawFunds } from '@/components/ui/icons';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Trans } from '@lingui/react/macro';
import { useRouter, router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, TouchableHighlight, Pressable } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountSwitcherModal } from './_comps/account-switcher-modal';

const REAL_ACCOUNTS = [
  { id: '88234912', type: 'STP' as const, balance: '10,234.50', currency: 'USD', leverage: '500', platform: 'MT5' as const, server: 'Mullet-Live', address: '0x862D...B22A' },
  { id: '88234913', type: 'STP' as const, balance: '5,000.00', currency: 'USD', leverage: '100', platform: 'MT5' as const, server: 'Mullet-Live', address: '0x1A2B...C3D4' },
]

const MOCK_ACCOUNTS = [
  { id: '10023491', type: '热门' as const, balance: '100,000.00', currency: 'USD', leverage: '500', platform: 'MT5' as const, server: 'Mullet-Demo', address: '0x0000...0000' },
]

export default function AssetsScreen() {
  const router = useRouter();
  const [currentAccount, setCurrentAccount] = useState<typeof REAL_ACCOUNTS[0] | typeof MOCK_ACCOUNTS[0]>(REAL_ACCOUNTS[0]);
  const [isSwitcherVisible, setIsSwitcherVisible] = useState(false);

  const handleLogin = () => {
    router.push("/(login)");
  };


  return (
    <View className="flex-1">
      <ScreenHeader
        showBackButton={false}
        content={<Text className='text-content-1 text-important-1'><Trans>资产</Trans></Text>}
        right={
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => { }}>
              <IconifyBell width={22} height={22} />
            </TouchableOpacity>
            <TouchableOpacity>
              <IconifySettings width={22} height={22} />
            </TouchableOpacity>
          </View>
        } />

      <ScrollView className="flex-1 px-xl py-2xl" showsVerticalScrollIndicator={false}>
        <AssetOverviewCard
          account={currentAccount}
          onPressSwitch={() => setIsSwitcherVisible(true)}
        />
        <AssetActions />
        <AccountList />
        <Pressable
          onPress={handleLogin}
          className="bg-primary px-8 py-4 rounded-lg active:opacity-80"
        >
          <Text className="text-primary-foreground text-lg font-semibold">
            登录
          </Text>
        </Pressable>

      </ScrollView>

      <AccountSwitcherModal
        visible={isSwitcherVisible}
        onClose={() => setIsSwitcherVisible(false)}
      />
    </View>
  );
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


function AssetActions() {

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
      <TouchableOpacity>
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

function AccountList() {
  const [activeTab, setActiveTab] = useState('real')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 border-none">
      <View className='justify-between items-center flex-row mb-medium'>
        <TabsList variant="underline" size="md">
          <TabsTrigger value="real">
            <Text className={cn('text-button-2 text-content-4', activeTab === 'real' && 'text-content-1')}><Trans>真实账户</Trans></Text>
          </TabsTrigger>
          <TabsTrigger value="mock">
            <Text className={cn('text-button-2 text-content-4', activeTab === 'mock' && 'text-content-1')}><Trans>模拟账户</Trans></Text>
          </TabsTrigger>
        </TabsList>

        <TouchableOpacity>
          <IconifyPlusCircle width={20} height={20} className="text-content-1" />
        </TouchableOpacity>
      </View>

      <TabsContent value="real" className='gap-medium'>
        {REAL_ACCOUNTS.map(account => (
          <AccountRow isReal key={account.id} {...account} onPress={() => { }} />
        ))}
      </TabsContent>

      <TabsContent value="mock" className='gap-medium'>
        {MOCK_ACCOUNTS.map(account => (
          <AccountRow isReal={false} key={account.id} {...account} onPress={() => { }} />
        ))}
      </TabsContent>
    </Tabs>
  )
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
