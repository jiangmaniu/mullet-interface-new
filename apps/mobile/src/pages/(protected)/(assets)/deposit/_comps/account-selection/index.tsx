import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DrawerRef } from '@/components/ui/drawer';
import { IconifyNavArrowDown, IconifyUserCircle } from '@/components/ui/icons';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import { getAccountSynopsisByLng } from '@/v1/utils/business';
import { BNumber } from '@mullet/utils/number';
import { useDepositStore } from '../../_store';
import { useStores } from '@/v1/provider/mobxProvider';
import { useLocalSearchParams } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { RealAccountSelectionDrawer } from '@/components/drawers/real-account-selector-drawer';

export const DepositAccountSelector = observer(function DepositAccountSelector() {
	const { user, trade } = useStores();
	const depositTargetAccount = useDepositStore((s) => s.depositTargetAccount);
	const setDepositTargetAccount = useDepositStore((s) => s.setDepositTargetAccount);
	const drawerRef = useRef<DrawerRef>(null);

	const accountList = useMemo(() => user.realAccountList ?? [], [user.realAccountList]);
	const { accountId } = useLocalSearchParams<{ accountId?: string }>();

	// 初始化目标账户
	useEffect(() => {
		if (accountList.length === 0 || depositTargetAccount) return;
		const account = accountId
			? accountList.find((a) => a.id === accountId) ?? accountList[0]
			: accountList.find((a) => a.id === trade.currentAccountInfo?.id) ?? accountList[0];
		if (account) setDepositTargetAccount(account);
	}, [accountId, accountList, trade.currentAccountInfo?.id, depositTargetAccount, setDepositTargetAccount]);

	const selectedAccount = depositTargetAccount;
	const synopsis = selectedAccount ? getAccountSynopsisByLng(selectedAccount.synopsis) : null;

	return (
		<>
			<Pressable onPress={() => drawerRef.current?.open()}>
				<Card className="rounded-small">
					<CardContent className="py-xl px-xl gap-medium">
						<View className="flex-row items-center justify-between">
							<View className="flex-row items-center gap-xl">
								<View className="flex-row items-center gap-xs">
									<IconifyUserCircle width={24} height={24} className='text-content-1' />
									<Text className="text-paragraph-p2 text-content-1">{selectedAccount?.id}</Text>
								</View>
								<View className="flex-row items-center gap-medium">
									{selectedAccount && !selectedAccount.isSimulate && (
										<Badge color="green">
											<Text><Trans>真实</Trans></Text>
										</Badge>
									)}
									{synopsis && (
										<Badge color="default">
											<Text>{synopsis.abbr}</Text>
										</Badge>
									)}
								</View>
							</View>
							<IconifyNavArrowDown width={16} height={16} className='text-content-4' />
						</View>
						<View>
							<Text className="text-paragraph-p3 text-content-1">
								<Trans>
									余额：
									{BNumber.toFormatNumber(selectedAccount?.money, {
										unit: selectedAccount?.currencyUnit,
										volScale: selectedAccount?.currencyDecimal,
									})}
								</Trans>
							</Text>
						</View>
					</CardContent>
				</Card>
			</Pressable>
			<RealAccountSelectionDrawer
				ref={drawerRef}
				selectedAccountId={selectedAccount?.id}
				onSelect={(account) => setDepositTargetAccount(account)}
			/>
		</>
	);
});
