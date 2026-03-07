import React, { createContext, useContext, useLayoutEffect, useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from '@/components/ui/screen-header';
import { CollapsibleTab, CollapsibleTabScene, CollapsibleScrollView, CollapsibleStickyNavBar, CollapsibleStickyContent, CollapsibleStickyHeader } from '@/components/ui/collapsible-tab';
import { Trans } from '@lingui/react/macro';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconifyUserCircle } from '@/components/ui/icons';
import { t } from '@lingui/core/macro';
import { AddAccount } from '@/v1/services/tradeCore/account';
import { useBoolean } from 'ahooks';
import { useStores } from '@/v1/provider/mobxProvider';
import { toast } from '@/components/ui/toast';
import { observer } from 'mobx-react-lite';
import { getAccountSynopsisByLng } from '@/v1/utils/business';
import { useLocalSearchParams, router } from 'expo-router';
import { AccountGroup } from '@/v1/services/tradeCore/accountGroup/typings';

interface AccountGroupCardProps {
	accountGroup: AccountGroup.AccountGroupItem;
}

function AccountGroupCard({ accountGroup }: AccountGroupCardProps) {
	const { selectedAccountGroup, setSelectedAccountGroup } = useCrateAccountScreenContext();
	const isMock = accountGroup?.isSimulate
	const isSelected = selectedAccountGroup?.id === accountGroup.id
	const synopsis = getAccountSynopsisByLng(accountGroup.synopsis)

	return (
		<Pressable onPress={() => setSelectedAccountGroup(accountGroup)}>
			<Card className={isSelected ? 'border-brand-primary' : ''}>
				<CardContent className='gap-xs p-xl'>
					{/* Header */}
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center justify-center gap-xs flex-1">
							<IconifyUserCircle width={20} height={20} className='text-content-1' />
							<Text className="text-paragraph-p1 text-content-1 flex-1" numberOfLines={1}>{synopsis?.name || accountGroup?.groupName}</Text>
						</View>

						<View className="flex-row items-center gap-xs">
							{
								synopsis.tag && (
									<Badge color={isMock ? 'secondary' : 'green'}>
										<Text>{synopsis.tag}</Text>
									</Badge>
								)
							}
							{synopsis.abbr && <Badge color='default'>
								<Text>{synopsis.abbr}</Text>
							</Badge>}
						</View>
					</View>

					{(synopsis?.remark || accountGroup.remark) &&
						<View>
							<Text className="text-paragraph-p3 text-content-3">
								{
									synopsis?.remark || accountGroup.remark
								}
							</Text>
						</View>
					}


					{/* Details */}
					<View className="gap-xs mt-2">
						{synopsis?.list?.map((item, index) => {
							return <View className="flex-row justify-between items-center h-6" key={index}>
								<Text className="text-paragraph-p3 text-content-4">{item.title}</Text>
								<Text className="text-paragraph-p3 text-content-1">{item.content}</Text>
							</View>
						})}

					</View>
				</CardContent>
			</Card>
		</Pressable>
	);
}

// --- Main Screen ---



const CrateAccountScreenContext = createContext<{
	selectedAccountGroup: AccountGroup.AccountGroupItem | null;
	setSelectedAccountGroup: (accountGroup: AccountGroup.AccountGroupItem | null) => void;
}>({} as any);

function useCrateAccountScreenContext() {

	return useContext(CrateAccountScreenContext);
}

export default function CrateAccountScreen() {
	const { tab } = useLocalSearchParams<{ tab?: string }>();
	const [selectedAccountGroup, setSelectedAccountGroup] = useState<AccountGroup.AccountGroupItem | null>(null);

	const renderHeader = React.useCallback(() => {
		return (
			<CollapsibleStickyHeader className="bg-secondary">
				<CollapsibleStickyNavBar>
					<ScreenHeader
						content={<Trans>创建账户</Trans>}
					/>
				</CollapsibleStickyNavBar>

				<CollapsibleStickyContent className="p-xl">
					<Text className="text-paragraph-p4 text-content-4">
						<Trans>
							您最多可以创建10个账户，允许您独立管理每个账户的资产，并灵活分配杠杆率和保证金使用情况。资金可以在帐户之间快速转移，以实现高效的资金配置和方便的交易统计追踪。
						</Trans>
					</Text>
				</CollapsibleStickyContent>
			</CollapsibleStickyHeader>
		);
	}, []);

	const [isLoading, { setTrue: setIsLoadingTrue, setFalse: setIsLoadingFalse }] = useBoolean(false);
	const { user } = useStores();

	const handleCreateAccount = async () => {
		if (!selectedAccountGroup) return;

		try {
			setIsLoadingTrue()

			const synopsis = getAccountSynopsisByLng(selectedAccountGroup.synopsis)

			const name = synopsis?.name || selectedAccountGroup.groupName

			const result = await AddAccount({ accountGroupId: selectedAccountGroup.id, clientId: user.currentUser?.user_id, name: name })
			if (result?.success) {
				const userInfo = await user.fetchUserInfo(true);
				console.log(userInfo)

				toast.success(t`创建账户成功`, {
					onAutoClose: () => {
						switchCreatedAccount()
					}
				});
			}

		} finally {
			setIsLoadingFalse()
		}
	}

	const switchCreatedAccount = () => {
		const tab = selectedAccountGroup?.isSimulate ? 'mock' : 'real'
		router.replace({ pathname: '/assets', params: { tab } })
	}

	return (
		<CrateAccountScreenContext.Provider value={{ selectedAccountGroup, setSelectedAccountGroup }}>
			<View className="flex-1 bg-secondary relative">
				<CollapsibleTab
					renderHeader={renderHeader}
					initialTabName={tab === 'mock' ? 'mock' : 'real'}
					size='md'
					variant='underline'
					scrollEnabled={false} // Disable scroll to make tabs fill width (flex-1)
				// onIndexChange={() => setSelectedAccount(null)}
				>
					<CollapsibleTabScene name="real" label={t`真实账户`}>
						<CollapsibleScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
							<View className='gap-medium p-xl'>
								<RealAccountGroupList />
							</View>
						</CollapsibleScrollView>
					</CollapsibleTabScene>

					<CollapsibleTabScene name="mock" label={t`模拟账户`}>
						<CollapsibleScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
							<View className='gap-medium p-xl'>
								<SimulateAccountGroupList />
							</View>
						</CollapsibleScrollView>
					</CollapsibleTabScene>
				</CollapsibleTab>

				{/* Fixed Bottom Button */}
				<View className="absolute bottom-0 left-0 right-0 bg-secondary px-xl pb-3xl">
					<Button
						size="lg"
						color='primary'
						disabled={!selectedAccountGroup}
						onPress={handleCreateAccount}
						loading={isLoading}
					>
						<Text><Trans>创建账户</Trans></Text>
					</Button>
				</View>
			</View>
		</CrateAccountScreenContext.Provider>
	);
}

const RealAccountGroupList = observer(() => {
	const { trade } = useStores();

	const accountGroupList = trade.accountGroupList.filter(AccountGroup => !AccountGroup.isSimulate)
	const isLoading = !!trade.accountGroupListLoading && accountGroupList.length === 0

	useLayoutEffect(() => {
		if (!trade.accountGroupList || trade.accountGroupList.length === 0) {
			trade.getAccountGroupList()
		}
	}, [trade.accountGroupList])

	if (isLoading) {
		return (
			<View className="py-3xl items-center">
				<ActivityIndicator />
			</View>
		)
	}

	return (
		<>
			{
				accountGroupList.map(accountGroup => (
					<AccountGroupCard
						key={accountGroup.id}
						accountGroup={accountGroup}
					/>
				))
			}
		</>
	)
})


const SimulateAccountGroupList = observer(() => {
	const { trade } = useStores();

	const accountGroupList = trade.accountGroupList.filter(AccountGroup => AccountGroup.isSimulate)
	const isLoading = !!trade.accountGroupListLoading && accountGroupList.length === 0

	useLayoutEffect(() => {
		if (!trade.accountGroupList || trade.accountGroupList.length === 0) {
			trade.getAccountGroupList()
		}
	}, [trade.accountGroupList])

	if (isLoading) {
		return (
			<View className="py-3xl items-center">
				<ActivityIndicator />
			</View>
		)
	}

	return (
		<>
			{
				accountGroupList.map(accountGroup => (
					<AccountGroupCard
						key={accountGroup.id}
						accountGroup={accountGroup}
					/>
				))
			}
		</>
	)
})
