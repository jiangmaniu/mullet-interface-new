import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
	IconifyFilter,
	IconifyNavArrowDown,
	IconifyUserCircle,
} from '@/components/ui/icons';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SwipeableTabs } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { t } from '@/locales/i18n';
import { Trans } from '@lingui/react/macro';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Pressable, View } from 'react-native';
import type { Route } from 'react-native-tab-view';
import { Account, AccountSelectDrawer } from '@/components/drawers/account-select-drawer';
import { DateFilterDrawer, DateRange } from './_comps/date-filter-drawer';
import { useLocalSearchParams } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/v1/provider/mobxProvider';
import { TransferList } from './_comps/transfer-list';
import { getAccountSynopsisByLng } from '@/v1/utils/business';
import { RealAccountSelectionDrawer } from '@/components/drawers/real-account-selector-drawer';
import { DrawerRef } from '@/components/ui/drawer';
import { WithdrawalList } from './_comps/withdrawal-list';
import { DepositList } from './_comps/deposit-list';

// Mock data types
export interface WithdrawalRecord {
	id: string;
	amount: string;
	currency: string;
	status: 'success' | 'failed';
	fromAccount: string;
	fromAccountType: string;
	toAddress: string;
	toAddressLabel: string;
	orderNumber: string;
	time: string;
}

export interface DepositRecord {
	id: string;
	amount: string;
	currency: string;
	status: 'success' | 'failed';
	toAccount: string;
	toAccountType: string;
	fromAddress: string;
	fromAddressLabel: string;
	orderNumber: string;
	time: string;
}

interface BillsScreenContextProps {
	selectedAccount: User.AccountItem;
	setSelectedAccount: (account: User.AccountItem) => void;
	dateRange: DateRange;
}

const BillsScreenContext = createContext<BillsScreenContextProps>({} as BillsScreenContextProps);

export function useBillsScreenContext() {
	return useContext(BillsScreenContext);
}

const BillsScreen = observer(() => {
	const { tab, accountId } = useLocalSearchParams<{ tab?: string; accountId?: string }>();

	const [dateFilterVisible, setDateFilterVisible] = useState(false);
	const [dateRange, setDateRange] = useState<DateRange>({
		startDate: null,
		endDate: null,
	});
	const { user } = useStores()

	const accountList = user.realAccountList ?? []
	const [selectedAccount, setSelectedAccount] = useState<User.AccountItem>(accountList[0]);

	useEffect(() => {
		if (accountId && !selectedAccount) {
			const account = user.currentUser.accountList?.find(a => a.id === accountId);
			if (account) setSelectedAccount(account);
		}
	}, [accountId, selectedAccount, user.currentUser.accountList]);

	const handleFilterPress = () => {
		setDateFilterVisible(true);
	};

	enum TabKeyEnum {
		WITHDRAWAL = 'withdrawal',
		DEPOSIT = 'deposit',
		TRANSFER = 'transfer',
	}

	const routes: Route[] = [
		{ key: TabKeyEnum.WITHDRAWAL, title: t`出金` },
		{ key: TabKeyEnum.DEPOSIT, title: t`入金` },
		{ key: TabKeyEnum.TRANSFER, title: t`划转` },
	]

	const TabContent = {
		[TabKeyEnum.WITHDRAWAL]: () => <WithdrawalList accountSelector={<BillsAccountSelector />} />,
		[TabKeyEnum.DEPOSIT]: () => <DepositList accountSelector={<BillsAccountSelector />} />,

		[TabKeyEnum.TRANSFER]: () => <TransferList accountSelector={<BillsAccountSelector />} />
	}

	// 根据路由参数计算初始 tab index
	const getInitialTabIndex = () => {
		if (!tab) return 0;
		const idx = routes.findIndex(r => r.key === tab);
		return idx >= 0 ? idx : 0;
	}
	const initialTabIndex = getInitialTabIndex()

	const renderScene = ({ route }: { route: Route }) => {
		const content = TabContent[route.key as TabKeyEnum]
		return content()
	}

	return (
		<BillsScreenContext.Provider value={{ selectedAccount, setSelectedAccount, dateRange }}>
			<ScreenHeader
				showBackButton={true}
				content={<Trans>出入金流水</Trans>}
				right={
					<Pressable onPress={handleFilterPress}>
						<IconifyFilter width={22} height={22} className='text-content-1' />
					</Pressable>
				}
			/>
			<SwipeableTabs
				routes={routes}
				renderScene={renderScene}
				variant="underline"
				size="md"
				tabBarClassName="px-xl"
				tabFlex
				initialIndex={initialTabIndex}
			/>

			<DateFilterDrawer
				visible={dateFilterVisible}
				onClose={() => setDateFilterVisible(false)}
				dateRange={dateRange}
				onApply={(range) => setDateRange(range)}
			/>
		</BillsScreenContext.Provider>
	);
})

export default BillsScreen

const BillsAccountSelector = observer(() => {
	const { selectedAccount, setSelectedAccount } = useBillsScreenContext()
	const realAccountSelectionDrawerRef = useRef<DrawerRef>(null)
	return (
		<>
			<AccountSelector selectedAccount={selectedAccount} onPress={() => realAccountSelectionDrawerRef.current?.open()} />

			<RealAccountSelectionDrawer
				ref={realAccountSelectionDrawerRef}
				selectedAccountId={selectedAccount.id}
				onSelect={(account) => {
					setSelectedAccount(account)
				}}
			/>
		</>
	)
})

// Account Selector Component
function AccountSelector({
	selectedAccount,
	onPress
}: {
	selectedAccount: User.AccountItem;
	onPress?: () => void;
}) {
	const { textColorContent1 } = useThemeColors();

	const synopsis = getAccountSynopsisByLng(selectedAccount.synopsis)

	return (
		<Pressable onPress={() => onPress?.()}>
			<View className="flex-row items-center justify-between px-xl py-xl bg-special rounded-small">
				<View className="flex-row items-center gap-medium">
					<IconifyUserCircle width={20} height={20} color={textColorContent1} />
					<Text className="text-paragraph-p2 text-content-1">{selectedAccount?.id}</Text>
					{!selectedAccount?.isSimulate && (
						<Badge color="green">
							<Text><Trans>真实</Trans></Text>
						</Badge>
					)}
					<Badge color="default">
						<Text>{synopsis.abbr}</Text>
					</Badge>
				</View>
				<IconifyNavArrowDown width={18} height={18} color={textColorContent1} />
			</View>
		</Pressable>
	);
}
