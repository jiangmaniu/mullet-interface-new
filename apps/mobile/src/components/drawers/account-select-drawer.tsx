import { IconifyUserCircle } from '@/components/ui/icons';
import { SwipeableTabs } from '@/components/ui/tabs';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { t } from '@/locales/i18n';
import { Trans } from '@lingui/react/macro';
import { useCallback, useMemo } from 'react';
import { ScrollView, Pressable, View } from 'react-native';
import type { Route } from 'react-native-tab-view';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Drawer, DrawerContent } from '@/components/ui/drawer';

export interface Account {
	id: string;
	type: string;
	balance: string;
	currency: string;
	isReal?: boolean;
	leverage?: string;
	platform?: string;
	server?: string;
	address?: string;
	[key: string]: any;
}

// TODO: 替换为真实 API 数据
const REAL_ACCOUNTS: Account[] = [
	{ id: '152365963', type: 'STP', balance: '152,563.00', currency: 'USDC', isReal: true, leverage: '500', platform: 'MT5', server: 'Mullet-Live', address: '0x862D...B22A' },
	{ id: '88234912', type: 'STP', balance: '10,234.50', currency: 'USDC', isReal: true, leverage: '500', platform: 'MT5', server: 'Mullet-Live', address: '0x862D...B22A' },
	{ id: '88234913', type: 'STP', balance: '5,000.00', currency: 'USDC', isReal: true, leverage: '100', platform: 'MT5', server: 'Mullet-Live', address: '0x1A2B...C3D4' },
];

const MOCK_ACCOUNTS: Account[] = [
	{ id: '10023491', type: 'STP', balance: '100,000.00', currency: 'USDC', isReal: false, leverage: '500', platform: 'MT5', server: 'Mullet-Demo', address: '0x0000...0000' },
];

interface AccountSelectDrawerProps {
	visible: boolean;
	onClose: () => void;
	selectedAccountId?: string;
	onSelect: (account: Account) => void;
}

export function AccountSelectDrawer({
	visible,
	onClose,
	selectedAccountId,
	onSelect,
}: AccountSelectDrawerProps) {
	const handleSelect = useCallback((account: Account) => {
		onSelect(account);
		onClose();
	}, [onSelect, onClose]);

	const routes = useMemo<Route[]>(() => [
		{ key: 'real', title: t`真实账户` },
		{ key: 'mock', title: t`模拟账户` },
	], []);

	const renderScene = useCallback(({ route }: { route: Route }) => {
		const isReal = route.key === 'real';
		const accounts = isReal ? REAL_ACCOUNTS : MOCK_ACCOUNTS;
		return (
			<ScrollView className="flex-1">
				{accounts.map((account: Account) => (
					<AccountRow
						key={account.id}
						account={{ ...account, isReal }}
						isSelected={selectedAccountId === account.id}
						onPress={() => handleSelect({ ...account, isReal })}
					/>
				))}
			</ScrollView>
		);
	}, [selectedAccountId, handleSelect]);

	return (
		<Drawer open={visible} onOpenChange={onClose}>
			<DrawerContent className="px-0 h-[292px]">
				<SwipeableTabs
					routes={routes}
					renderScene={renderScene}
					variant="underline"
					size="md"
					tabBarClassName="py-xl"
					tabFlex
				/>
			</DrawerContent>
		</Drawer>
	);
}

interface AccountRowProps {
	account: Account;
	isSelected: boolean;
	onPress: () => void;
}

function AccountRow({ account, isSelected, onPress }: AccountRowProps) {
	const { textColorContent1 } = useThemeColors();

	return (
		<Pressable onPress={isSelected ? undefined : onPress}>
			<Card className="border-0">
				<CardContent className="px-5 py-[14px] flex-row items-center justify-between">
					<View className="gap-xs">
						<View className="flex-row items-center justify-between gap-medium">
							<View className="flex-row items-center gap-xs">
								<IconifyUserCircle width={20} height={20} color={textColorContent1} />
								<Text className="text-paragraph-p2 text-content-1">{account.id}</Text>
							</View>

							<View className="flex-row items-center gap-medium">
								<Badge color={account.isReal ? 'green' : 'secondary'}>
									<Text>{account.isReal ? <Trans>真实</Trans> : <Trans>模拟</Trans>}</Text>
								</Badge>
								<Badge color="default">
									<Text>{account.type.toUpperCase()}</Text>
								</Badge>
							</View>
						</View>

						<View className="min-h-[24px] flex-row gap-xs">
							<Text className="text-paragraph-p3 text-content-4"><Trans>账户余额</Trans></Text>
							<Text className="text-paragraph-p3 text-content-1">{account.balance} {account.currency}</Text>
						</View>
					</View>

					<Checkbox checked={isSelected} onCheckedChange={() => { if (!isSelected) onPress(); }} />
				</CardContent>
			</Card>
		</Pressable>
	);
}
