import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Drawer, DrawerContent, DrawerHeader, DrawerRef } from '@/components/ui/drawer';
import { Text } from '@/components/ui/text';
import { useStores } from '@/v1/provider/mobxProvider';
import { useAccountSynopsis } from '@/hooks/account/use-account-synopsis';
import { Trans } from '@lingui/react/macro';
import { BNumber } from '@mullet/utils/number';
import { useToggle } from 'ahooks';
import { observer } from 'mobx-react-lite';
import { RefObject, useImperativeHandle } from 'react';
import { View, ScrollView, Pressable } from 'react-native';

interface RealAccountSelectionDrawerProps {
	onSelect?: (account: User.AccountItem) => void;
	selectedAccountId?: string;
	title?: React.ReactNode;
	ref?: RefObject<DrawerRef | null>
}

export const RealAccountSelectionDrawer = observer(({
	onSelect,
	selectedAccountId,
	title,
	ref
}: RealAccountSelectionDrawerProps) => {
	const { user } = useStores()

	const [isOpen, { toggle, setLeft: setClose, setRight: setOpen, set: setToggle }] = useToggle()

	useImperativeHandle(ref, () => ({
		open: setOpen,
		close: setClose,
		toggle: toggle,
	}))

	const accountList = user.currentUser.accountList?.filter((accountGroup) => !accountGroup.isSimulate) ?? []
	return (
		<Drawer open={isOpen} onOpenChange={setToggle}>
			<DrawerContent className='h-[240px] gap-0 py-xl'>

				{title && <DrawerHeader className='px-5'>
					{title}
				</DrawerHeader>
				}

				<ScrollView className='flex-1 pb-3xl' showsVerticalScrollIndicator={false}>
					{accountList.map(account => (
						<AccountRow
							key={account.id}
							account={account}

							selectedAccountId={selectedAccountId}
							onPress={() => {
								onSelect?.(account);
								setClose();
							}}
						/>
					))}
					<View className="h-safe-bottom" />
				</ScrollView>

			</DrawerContent>
		</Drawer>
	);
})

function AccountRow({
	account,
	selectedAccountId,
	onPress
}: { account: User.AccountItem, selectedAccountId?: string, onPress: () => void }) {
	const isSelected = account.id === selectedAccountId

	const synopsis = useAccountSynopsis(account.synopsis)
	return (
		<Pressable onPress={onPress}>
			<Card className='border-0 bg-transparent'>
				<CardContent className='px-5 py-[14px] flex-row items-center justify-between'>
					<View className='gap-xs'>
						<View className="flex-row items-center justify-between gap-medium">

							<Text className="text-paragraph-p2 text-content-1">{account.id}</Text>

							<View className="flex-row items-center gap-medium">
								<Badge color='green'>
									<Text><Trans>真实</Trans></Text>
								</Badge>
								<Badge color='default'>
									<Text>{synopsis.abbr}</Text>
								</Badge>
							</View>
						</View>

						<Text className="text-paragraph-p3 text-content-4">{BNumber.toFormatNumber(account.money, { unit: account.currencyUnit, volScale: account.currencyDecimal })}</Text>
					</View>

					<Checkbox checked={!!isSelected} onCheckedChange={() => onPress()} />
				</CardContent>
			</Card>
		</Pressable>
	);
}

