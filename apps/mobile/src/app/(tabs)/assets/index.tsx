import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { IconifyBell, IconifyCoinsSwap, IconifyCopy, IconifyEye, IconifyEyeClosed, IconifyNavArrowDown, IconifyPlusCircle, IconifySettings, IconifyUserCircle, IconPayment, IconRecord, IconWithdrawFunds } from '@/components/ui/icons';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import React, { useState } from 'react';
import { View, TouchableOpacity, TouchableHighlight } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { CollapsibleTab, CollapsibleTabScene, CollapsibleScrollView, CollapsibleStickyNavBar, CollapsibleStickyContent, CollapsibleStickyHeader } from '@/components/ui/collapsible-tab';
import { AccountSelectionDrawer, type Account } from '@/app/(tabs)/assets/_comps/account-selection-drawer';
import { TransferHintModal } from '@/app/(tabs)/assets/_comps/transfer-hint-modal';
import { t } from '@/locales/i18n';
import { ScreenHeader } from '@/components/ui/screen-header';
import { MockAccountDepositModal } from '@/app/(tabs)/assets/_comps/mock-account-deposit-modal';
import { router, useRouter } from 'expo-router';
import { IconButton } from '@/components/ui/button';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/v1/provider/mobxProvider';
import { getAccountSynopsisByLng } from '@/v1/utils/business';
// import { getAccountSynopsisByLng } from '@/v1/utils/business';

const REAL_ACCOUNTS = [
  { id: '88234912', type: 'STP' as const, balance: '10,234.50', currency: 'USDC', leverage: '500', platform: 'MT5' as const, server: 'Mullet-Live', address: '0x862D...B22A' },
  { id: '88234913', type: 'STP' as const, balance: '5,000.00', currency: 'USDC', leverage: '100', platform: 'MT5' as const, server: 'Mullet-Live', address: '0x1A2B...C3D4' },
]

const MOCK_ACCOUNTS = [
  { id: '10023491', type: '热门' as const, balance: '100,000.00', currency: 'USDC', leverage: '500', platform: 'MT5' as const, server: 'Mullet-Demo', address: '0x0000...0000' },
]

export default observer(function AssetsScreen() {
  const { trade } = useStores()
  const currentAccountInfo = trade.currentAccountInfo

  console.log(currentAccountInfo)

  const [currentAccount, setCurrentAccount] = useState(REAL_ACCOUNTS[0]);
  const [isSwitcherVisible, setIsSwitcherVisible] = useState(false);
  const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);
  const { textColorContent1 } = useThemeColors();

  const renderHeader = React.useCallback(() => {
    return (
      <CollapsibleStickyHeader className="bg-secondary" >
        <CollapsibleStickyNavBar>
          <ScreenHeader
            showBackButton={false}
            content={<Trans>资产</Trans>}
            right={
              <View className="flex-row items-center gap-4">
                <TouchableOpacity onPress={() => { }}>
                  <IconifyBell width={22} height={22} color={textColorContent1} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/setting')}>
                  <IconifySettings width={22} height={22} color={textColorContent1} />
                </TouchableOpacity>
              </View>
            }
          />
        </CollapsibleStickyNavBar>

        <CollapsibleStickyContent className="px-xl pt-4 pb-xl gap-xl">
          {/* 资产概览 */}
          <AssetOverviewCard
            account={currentAccountInfo}
            onPressSwitch={() => setIsSwitcherVisible(true)}
          />
          {/* 操作 */}
          <AssetActions />
        </CollapsibleStickyContent>
      </CollapsibleStickyHeader>
    );
  }, [currentAccountInfo, setIsSwitcherVisible, textColorContent1]);

  const handleAccountManage = () => {
    router.push('/account')
  }

  return (
    <View className="flex-1 bg-secondary">
      <CollapsibleTab
        renderHeader={renderHeader}
        initialTabName="real"
        size='md'
        variant='underline'
        renderTabBarRight={() => (
          <IconButton
            variant='ghost'
            onPress={() => handleAccountManage()}
          >
            <IconifyPlusCircle width={20} height={20} />
          </IconButton>
        )}
      >
        <CollapsibleTabScene name="real" label={t`真实账户`}>
          <CollapsibleScrollView contentContainerStyle={{ padding: 12 }}>
            <View className='gap-medium py-xl'>
              {REAL_ACCOUNTS.map(account => (
                <RealAccountRow key={account.id} {...account} onPress={() => { }} />
              ))}
            </View>
          </CollapsibleScrollView>
        </CollapsibleTabScene>

        <CollapsibleTabScene name="mock" label={t`模拟账户`}>
          <CollapsibleScrollView contentContainerStyle={{ padding: 12 }}>
            <View className='gap-medium py-xl'>
              {MOCK_ACCOUNTS.map(account => (
                <MockAccountRow
                  key={account.id}
                  {...account}
                  onPress={() => { }}
                  onPressDeposit={() => setIsDepositModalVisible(true)}
                />
              ))}
            </View>
          </CollapsibleScrollView>
        </CollapsibleTabScene>
      </CollapsibleTab>

      <AccountSelectionDrawer
        selectedAccountId={currentAccount.id}
        onSelect={(account: Account) => {
          // Force cast or ensure compatibility. 
          // The Account type in Switcher is compatible now.
          setCurrentAccount(account as typeof REAL_ACCOUNTS[0])
        }}
        visible={isSwitcherVisible}
        onClose={() => setIsSwitcherVisible(false)}
        realAccounts={REAL_ACCOUNTS}
        mockAccounts={MOCK_ACCOUNTS}
      />



      <MockAccountDepositModal
        open={isDepositModalVisible}
        onClose={() => setIsDepositModalVisible(false)}
        onConfirm={() => {
          setIsDepositModalVisible(false);
          // TODO: Implement deposit logic
        }}
      />
    </View>
  );
})

interface BaseAccountRowProps {
  id: string
  type: 'STP' | '热门'
  balance: string
  currency: string
  onPress?: () => void
}

interface MockAccountRowProps extends BaseAccountRowProps {
  onPressDeposit?: () => void
}

interface RealAccountRowProps extends BaseAccountRowProps {
  address?: string
}

export function RealAccountRow({
  id,
  type,
  balance,
  currency,
  address = '0x0000...0000',
  onPress,
}: RealAccountRowProps) {
  const { textColorContent1, colorBrandSecondary1 } = useThemeColors()

  return (
    <TouchableOpacity onPress={onPress}>
      <Card>
        <CardContent className='gap-xs'>
          {/* Header: User & Badges */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-medium">
              <IconifyUserCircle width={20} height={20} color={textColorContent1} />
              <Text className="text-paragraph-p1 text-content-1">{id}</Text>
            </View>

            <View className="flex-row items-center gap-medium">
              <Badge color='rise'>
                <Text><Trans>真实</Trans></Text>
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
            </View>
          </View>

          {/* Address */}
          <View className="flex-row items-center justify-between min-h-[24px]">
            <Text className="text-paragraph-p3 text-content-4"><Trans>地址</Trans></Text>
            <View className="flex-row items-center gap-xs">
              <Text className="text-paragraph-p3 text-content-1">{address}</Text>
              <TouchableOpacity>
                <IconifyCopy width={20} height={20} color={colorBrandSecondary1} />
              </TouchableOpacity>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  )
}

export function MockAccountRow({
  id,
  type,
  balance,
  currency,
  onPress,
  onPressDeposit
}: MockAccountRowProps) {
  const { textColorContent1, colorBrandPrimary } = useThemeColors()

  return (
    <TouchableOpacity onPress={onPress}>
      <Card>
        <CardContent className='gap-xs'>
          {/* Header: User & Badges */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-medium">
              <IconifyUserCircle width={20} height={20} color={textColorContent1} />
              <Text className="text-paragraph-p1 text-content-1">{id}</Text>
            </View>

            <View className="flex-row items-center gap-medium">
              <Badge color='secondary'>
                <Text><Trans>模拟</Trans></Text>
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
              <TouchableOpacity onPress={onPressDeposit}>
                <IconifyPlusCircle width={14} height={14} color={colorBrandPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  )
}

interface AssetOverviewCardProps {
  account: User.AccountItem
  onPressSwitch: () => void;
}

function AssetOverviewCard({ account, onPressSwitch }: AssetOverviewCardProps) {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const { textColorContent4, textColorContent1 } = useThemeColors();
  const isReal = REAL_ACCOUNTS.some(a => a.id === account.id);

  const synopsis = getAccountSynopsisByLng(account.synopsis)

  return (
    <Card className="px-xl py-2xl gap-xl">
      {/* 账户信息 */}
      <TouchableHighlight onPress={onPressSwitch} underlayColor="transparent">
        <View className="flex-row items-center justify-between gap-2xl bg-special rounded-small px-xl py-xs h-8">
          <View className="flex-row items-center gap-medium">
            <View className="flex-row items-center gap-xs">
              <IconifyUserCircle width={20} height={20} className="text-content-1" />
              <Text className="text-content-1 text-paragraph-p2">{account.name}</Text>
            </View>
            <Badge color={isReal ? "rise" : "secondary"}><Text>{isReal ? <Trans>真实</Trans> : <Trans>模拟</Trans>}</Text></Badge>
            <Badge><Text>{synopsis.abbr}</Text></Badge>
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
              {/* <Text className="text-muted-foreground text-sm">{account.address}</Text> */}
              <IconifyCopy width={16} height={16} color={textColorContent1} />
            </View>
          </View>

          <View className="flex-row items-end justify-between">
            <View className="flex-row items-baseline gap-medium">
              <Text className="text-title-h3 text-content-1">
                {/* {isBalanceHidden ? '******' : account.balance} */}
              </Text>
              {/* <Text className="text-paragraph-p2 text-content-1">{account.currency}</Text> */}
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
            {/* {isBalanceHidden ? '******' : `${account.balance} ${account.currency}`} */}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-paragraph-p3 text-content-4"><Trans>可用</Trans></Text>
          <Text className="text-paragraph-p3 text-content-1">
            {/* {isBalanceHidden ? '******' : `${account.balance} ${account.currency}`} */}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-paragraph-p3 text-content-4"><Trans>占用</Trans></Text>
          <Text className="text-paragraph-p3 text-content-1">
            {/* {isBalanceHidden ? '******' : `0.00 ${account.currency}`} */}
          </Text>
        </View>
      </View>
    </Card>
  );
}


function AssetActions() {
  const router = useRouter();
  const [isTransferHintVisible, setIsTransferHintVisible] = useState(false);

  const handlePressDeposit = () => {
  }

  const handlePressTransfer = () => {
    if (false) {
      // 如果账户只有1个，无法划转，弹窗提示
      setIsTransferHintVisible(true);
      return
    }
    // 跳转到划转页面
    router.push('/transfer')
  }

  const handlePressBill = () => {
    router.push('/(assets)/bills');
  }

  return (
    <>
      <View className='flex-row items-center justify-between px-xl py-xl'>
        <TouchableOpacity>
          <View className="flex-col items-center">
            <View className='p-medium'>
              <IconWithdrawFunds width={24} height={24} />
            </View>
            <Text className="text-paragraph-p3 text-content-1"><Trans>取现</Trans></Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePressDeposit}>
          <View className="flex-col items-center">
            <View className='p-medium'>
              <IconPayment width={24} height={24} />
            </View>
            <Text className="text-paragraph-p3 text-content-1"><Trans>存款</Trans></Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePressTransfer}>
          <View className="flex-col items-center">
            <View className='p-medium'>
              <IconifyCoinsSwap width={24} height={24} className='text-content-1' />
            </View>
            <Text className="text-paragraph-p3 text-content-1"><Trans>划转</Trans></Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePressBill}>
          <View className="flex-col items-center">
            <View className='p-medium'>
              <IconRecord width={24} height={24} />
            </View>
            <Text className="text-paragraph-p3 text-content-1"><Trans>账单</Trans></Text>
          </View>
        </TouchableOpacity>
      </View>

      <TransferHintModal
        open={isTransferHintVisible}
        onClose={() => setIsTransferHintVisible(false)}
        onCreateAccount={() => setIsTransferHintVisible(false)}
      />
    </>
  )
}
