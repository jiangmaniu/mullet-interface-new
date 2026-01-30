import { IconifyUserCircle } from '@/components/ui/icons';
import {
	CollapsibleScrollView,
	CollapsibleTab,
	CollapsibleTabScene,
} from '@/components/ui/collapsible-tab';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { t } from '@/locales/i18n';
import { Trans } from '@lingui/react/macro';
import { TouchableOpacity, View } from 'react-native';
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
	// Allow any other properties to avoid tight coupling if parent has more fields
	[key: string]: any;
}

interface AccountSelectionDrawerProps {
	visible: boolean;
	onClose: () => void;
	selectedAccountId?: string;
	onSelect: (account: Account) => void;
	realAccounts: Account[];
	mockAccounts: Account[];
}

export function AccountSelectionDrawer({
	visible,
	onClose,
	selectedAccountId,
	onSelect,
	realAccounts,
	mockAccounts,
}: AccountSelectionDrawerProps) {
	const handleSelect = (account: Account) => {
		onSelect(account);
		onClose();
	};

	return (
		<Drawer open={visible} onOpenChange={onClose}>
			<DrawerContent className='p-0'>
				<View className="h-[292px] pt-xl">
					<CollapsibleTab
						initialTabName="real"
						size="md"
						variant="underline"
						minHeaderHeight={0}
						scrollEnabled={false}
						tabBarClassName='bg-special'
					>
						<CollapsibleTabScene name="real" label={t`真实账户`}>
							<CollapsibleScrollView className="flex-1 pt-xl">
								{realAccounts.map(account => (
									<AccountRow
										key={account.id}
										account={{ ...account, isReal: true }}
										isSelected={selectedAccountId === account.id}
										onPress={() => handleSelect({ ...account, isReal: true })}
									/>
								))}
							</CollapsibleScrollView>
						</CollapsibleTabScene>

						<CollapsibleTabScene name="mock" label={t`模拟账户`}>
							<CollapsibleScrollView className="flex-1 pt-xl">
								{mockAccounts.map(account => (
									<AccountRow
										key={account.id}
										account={{ ...account, isReal: false }}
										isSelected={selectedAccountId === account.id}
										onPress={() => handleSelect({ ...account, isReal: false })}
									/>
								))}
							</CollapsibleScrollView>
						</CollapsibleTabScene>
					</CollapsibleTab>
				</View>
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
		<TouchableOpacity onPress={onPress}>
			<Card className='border-0'>
				<CardContent className='px-5 py-[14px] flex-row items-center justify-between'>
					<View className='gap-xs'>
						{/* Header: User & Badges */}
						<View className="flex-row items-center justify-between gap-medium">
							<View className="flex-row items-center gap-xs">
								<IconifyUserCircle width={20} height={20} color={textColorContent1} />
								<Text className="text-paragraph-p2 text-content-1">{account.id}</Text>
							</View>

							<View className="flex-row items-center gap-medium">
								<Badge color={account.isReal ? 'rise' : 'secondary'}>
									<Text>{account.isReal ? <Trans>真实</Trans> : <Trans>模拟</Trans>}</Text>
								</Badge>
								<Badge color='default'>
									<Text>{account.type.toUpperCase()}</Text>
								</Badge>
							</View>
						</View>

						{/* Balance */}
						<View className="min-h-[24px] flex-row gap-xs">
							<Text className="text-paragraph-p3 text-content-4"><Trans>账户余额</Trans></Text>
							<Text className="text-paragraph-p3 text-content-1">{account.balance} {account.currency}</Text>
						</View>
					</View>

					<Checkbox checked={isSelected} onCheckedChange={onPress} />
				</CardContent>
			</Card>
		</TouchableOpacity>
	);
}
