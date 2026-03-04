import { Badge } from '@/components/ui/badge';
import { IconifyCreditCardSolid } from '@/components/ui/icons/iconify';
import { IconBitcoin } from '@/components/ui/icons/set/bitcoin';
import { IconEthereum } from '@/components/ui/icons/set/ethereum';
import { IconMastercard } from '@/components/ui/icons/set/mastercard';
import { IconUSDC1 } from '@/components/ui/icons/set/usdc-1';
import { IconVisa } from '@/components/ui/icons/set/visa';
import { IconRecord } from '@/components/ui/icons/set/record';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import { useStores } from '@/v1/provider/mobxProvider';
import { router, useLocalSearchParams } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { DepositMethodCard } from '../deposit/_comps/method-card';
import { WithdrawAccountSelector } from './_comps/withdraw-account-selector';
import { useWithdrawStore } from './_store';

const WithdrawScreen = observer(function WithdrawScreen() {
	const { user, trade } = useStores();
	const withdrawSourceAccount = useWithdrawStore((s) => s.withdrawSourceAccount);
	const setWithdrawSourceAccount = useWithdrawStore((s) => s.setWithdrawSourceAccount);
	const reset = useWithdrawStore((s) => s.reset);
	const accountList = useMemo(() => user.realAccountList ?? [], [user.realAccountList]);
	const { accountId } = useLocalSearchParams<{ accountId?: string }>();

	// 离开提现模块时重置状态
	useEffect(() => {
		return () => reset();
	}, [reset]);

	useEffect(() => {
		if (accountList.length === 0 || withdrawSourceAccount) return;
		const account = accountId
			? accountList.find((a) => a.id === accountId) ?? accountList[0]
			: accountList.find((a) => a.id === trade.currentAccountInfo?.id) ?? accountList[0];
		if (account) setWithdrawSourceAccount(account);
	}, [accountId, accountList, trade.currentAccountInfo?.id, withdrawSourceAccount, setWithdrawSourceAccount]);

	return (
		<View className="flex-1">
			<ScreenHeader
				content={<Trans>取现</Trans>}
				right={
					<Pressable>
						<IconRecord width={24} height={24} className="text-content-1" />
					</Pressable>
				}
			/>
			<View className="flex-1 gap-xl pt-xl">
				<View className="px-5 mb-xl">
					<WithdrawAccountSelector />
				</View>
				<View className="px-5">
					<Text className="text-paragraph-p2 text-content-4">
						<Trans>选择适合您的出金方式</Trans>
					</Text>
				</View>
				<View className="px-5 gap-xl">
					<DepositMethodCard
						icon={<IconBitcoin width={24} height={24} className="text-content-1" />}
						title={<Trans>加密货币取现</Trans>}
						subtitle={<Trans>无限制 · 即时</Trans>}
						rightContent={
							<View className="flex-row items-center pr-xs">
								<View className="-mr-1"><IconUSDC1 width={24} height={24} /></View>
								<View className="-mr-1"><IconBitcoin width={24} height={24} /></View>
								<IconEthereum width={24} height={24} />
							</View>
						}
						onPress={() => router.push('/(assets)/withdraw/crypto')}
					/>
					<DepositMethodCard
						icon={<IconifyCreditCardSolid width={24} height={24} className="text-content-1" />}
						title={
							<View className="flex-row items-center gap-medium">
								<Text className="text-paragraph-p2 text-content-1"><Trans>银行卡</Trans></Text>
								<Badge color="default"><Text><Trans>即将推出</Trans></Text></Badge>
							</View>
						}
						subtitle={<Trans>最低$1000 · 5分钟</Trans>}
						rightContent={
							<View className="flex-row items-center gap-medium">
								<IconVisa width={24} height={24} />
								<IconMastercard width={24} height={24} />
							</View>
						}
						onPress={() => { }}
						disabled
					/>
				</View>
			</View>
		</View>
	);
});

export default WithdrawScreen;
