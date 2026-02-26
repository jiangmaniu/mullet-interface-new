import { IconifyUserCircle } from '@/components/ui/icons';
import { SwipeableTabs } from '@/components/ui/tabs';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { t } from '@/locales/i18n';
import { Trans, useLingui } from '@lingui/react/macro';
import { useCallback, useMemo } from 'react';
import { ScrollView, Pressable, View } from 'react-native';
import type { Route } from 'react-native-tab-view';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/v1/provider/mobxProvider';
import { getAccountSynopsisByLng } from '@/v1/utils/business';
import { BNumber } from '@mullet/utils/number';
import { toast } from '../ui/toast';

interface AccountSelectDrawerProps {
	visible: boolean;
	onClose: () => void;
	selectedAccountId?: string;
	onSelect: (account: User.AccountItem) => void;
}

export const AccountSelectDrawer = observer(({
	visible,
	onClose,
	selectedAccountId,
	onSelect,
}: AccountSelectDrawerProps) => {

	const { user } = useStores()
	const { t } = useLingui();
	console.log(user.currentUser)
	const realAccountList = user.currentUser?.accountList?.filter((item) => !item.isSimulate) || []
	const simulateAccountList = user.currentUser?.accountList?.filter((item) => item.isSimulate) || []

	const handleSelect = (account: User.AccountItem) => {
		if (!account?.enableConnect || account.status === 'DISABLED') {
			toast.error(t`该账户已被禁用`);
			return;
		}

		onSelect(account);
		onClose();
	}

	const routes: Route[] = [
		{ key: 'real', title: t`真实账户` },
		{ key: 'mock', title: t`模拟账户` },
	]

	const renderScene = ({ route }: { route: Route }) => {
		const isReal = route.key === 'real';
		const accounts = isReal ? realAccountList : simulateAccountList;
		return (
			<ScrollView className="flex-1">
				{accounts.map((account) => (
					<AccountRow
						key={account.id}
						account={account}
						isSelected={selectedAccountId === account.id}
						onPress={() => handleSelect(account)}
					/>
				))}
			</ScrollView>
		);
	}

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
})

interface AccountRowProps {
	account: User.AccountItem;
	isSelected: boolean;
	onPress?: () => void;
}

const AccountRow = observer(({ account, isSelected, onPress }: AccountRowProps) => {
	const { textColorContent1 } = useThemeColors();

	const synopsis = getAccountSynopsisByLng(account.synopsis)
	return (
		<Pressable onPress={isSelected ? undefined : onPress}>
			<Card className="border-0">
				<CardContent className="px-5 py-[14px] flex-row items-center justify-between">
					<View className="gap-xs">
						<View className="flex-row items-center justify-between gap-medium">
							<View className="flex-row items-center gap-xs">
								<IconifyUserCircle width={20} height={20} color={textColorContent1} />
								<Text className="text-paragraph-p2 text-content-1">{account.name}</Text>
							</View>

							<View className="flex-row items-center gap-medium">
								<Badge color={!account.isSimulate ? 'green' : 'secondary'}>
									<Text>{!account.isSimulate ? <Trans>真实</Trans> : <Trans>模拟</Trans>}</Text>
								</Badge>
								<Badge color="default">
									<Text>{synopsis.abbr}</Text>
								</Badge>
							</View>
						</View>

						<View className="min-h-[24px] flex-row gap-xs">
							<Text className="text-paragraph-p3 text-content-4"><Trans>账户余额</Trans></Text>
							<Text className="text-paragraph-p3 text-content-1">{BNumber.toFormatNumber(account.money, { unit: account.currencyUnit, volScale: account.currencyDecimal })}</Text>
						</View>
					</View>

					<Checkbox checked={isSelected} onCheckedChange={() => { if (!isSelected) onPress?.(); }} />
				</CardContent>
			</Card>
		</Pressable>
	);
})
