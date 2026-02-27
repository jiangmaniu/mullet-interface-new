import { Button, IconButton } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { IconGroup5, IconifyNavArrowRight, IconifyPlusCircle } from '@/components/ui/icons';
import { IconRecord } from '@/components/ui/icons/set/record';
import { NumberInput, NumberInputSourceType } from '@/components/ui/number-input';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { toast } from '@/components/ui/toast';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { transferAccount } from '@/v1/services/tradeCore/account';
import { useStores } from '@/v1/provider/mobxProvider';
import { BNumber } from '@mullet/utils/number';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DrawerTitle } from '@/components/ui/drawer';
import { AccountSelectionDrawer } from './_comps/account-selection-drawer';
import { z } from 'zod';

export default function TransferScreen() {
	const { textColorContent1 } = useThemeColors();
	const router = useRouter();
	const { accountId } = useLocalSearchParams<{ accountId?: string }>();
	const { user } = useStores();

	const [fromAccount, setFromAccount] = useState<User.AccountItem>();
	const [toAccount, setToAccount] = useState<User.AccountItem>();
	const [submitLoading, setSubmitLoading] = useState(false);

	const [isFromDrawerOpen, setIsFromDrawerOpen] = useState(false);
	const [isToDrawerOpen, setIsToDrawerOpen] = useState(false);

	const formSchema = useMemo(() => z.object({
		amount: z
			.string()
			.refine(
				(val) => {
					if (!val || !fromAccount?.money) return true
					return BNumber.from(val).lte(BNumber.from(fromAccount.money))
				},
				{ message: t`金额不可大于可用余额` },
			)
			.refine(
				(val) => {
					if (!val) return true
					return BNumber.from(val).gte(0)
				},
				{ message: t`金额不能小于0` },
			),
	}), [fromAccount?.money])

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { amount: '' },
		mode: 'onChange',
	})

	const amount = form.watch('amount')

	// 从路由参数初始化 fromAccount
	useEffect(() => {
		if (accountId) {
			const account = user.currentUser.accountList?.find(a => a.id === accountId);
			if (account) setFromAccount(account);
		}
	}, [accountId, user.currentUser.accountList]);

	const handleSwap = () => {
		setFromAccount(toAccount);
		setToAccount(fromAccount);
		form.setValue('amount', '', { shouldValidate: true })
	};

	const handleMax = () => {
		if (!fromAccount) {
			toast.error(<Trans>请先选择要转出的账户</Trans>)
			return
		}

		if (fromAccount.money) {
			form.setValue('amount', fromAccount.money.toString(), { shouldValidate: true })
		}
	};

	const isSubmitDisabled = !fromAccount || !toAccount || !amount || submitLoading

	const handleSubmit = form.handleSubmit(async (data) => {
		if (!fromAccount || !toAccount) return

		setSubmitLoading(true)
		try {
			const res = await transferAccount({
				fromAccountId: fromAccount.id,
				toAccountId: toAccount.id,
				money: parseFloat(data.amount)
			})

			if (res.success) {
				await user.fetchUserInfo(true)
				toast.success(<Trans>转账成功</Trans>)
				form.reset({ amount: '' })
			}
		} finally {
			setSubmitLoading(false)
		}
	})

	return (
		<View className="flex-1">
			<ScreenHeader
				content={<Trans>划转</Trans>}
				right={
					<Pressable onPress={() => router.push({ pathname: '/(protected)/(assets)/bills', params: { tab: 'transfer', accountId: fromAccount?.id } })}>
						<IconRecord width={24} height={24} color={textColorContent1} />
					</Pressable>
				}
			/>

			<View className="flex-1 px-xl">
				{/* 账户选择区域 */}
				<View className="relative mt-4">
					<AccountSelector
						label={<Trans>从</Trans>}
						account={fromAccount}
						onPress={() => setIsFromDrawerOpen(true)}
					/>

					<View className="absolute left-1/2 top-1/2 -translate-1/2 z-10">
						<IconButton variant='icon' className='size-6' onPress={handleSwap}>
							<IconGroup5 width={24} height={24} />
						</IconButton>
					</View>

					<View className="mt-2">
						<AccountSelector
							label={<Trans>到</Trans>}
							account={toAccount}
							onPress={() => setIsToDrawerOpen(true)}
						/>
					</View>
				</View>

				{/* 金额输入 */}
				{fromAccount && (
					<View className="mt-6 gap-medium">
						<Form {...form}>
							<FormField
								control={form.control}
								name="amount"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<NumberInput
												max={fromAccount?.money}
												decimalScale={fromAccount?.currencyDecimal}
												placeholder="请输入金额"
												value={field.value}
												onValueChange={({ value }, { source }) => {
													if (source === NumberInputSourceType.EVENT) {
														field.onChange(value)
													}
												}}
												keyboardType="numeric"
												size='md'
												RightContent={
													<View className="flex-row items-center gap-xs ml-2">
														<Text className="text-paragraph-p2 text-content-1">{fromAccount.currencyUnit}</Text>
														<Pressable onPress={handleMax}>
															<Text className="text-paragraph-p2 text-brand-primary"><Trans>最大</Trans></Text>
														</Pressable>
													</View>
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</Form>

						<View className="w-full flex-row justify-between items-center gap-1">
							<Text className="text-paragraph-p3 text-content-4"><Trans>可用余额</Trans></Text>
							<View className="flex-row items-center gap-xs">
								<Text className="text-paragraph-p3 text-content-1">
									{BNumber.toFormatNumber(fromAccount?.money, { unit: fromAccount?.currencyUnit, volScale: fromAccount?.currencyDecimal })}
								</Text>
								<IconButton color='primary'>
									<IconifyPlusCircle width={14} height={14} />
								</IconButton>
							</View>
						</View>
					</View>
				)}
			</View>

			{/* 底部按钮 */}
			<SafeAreaView edges={['bottom']}>
				<View className="px-5 py-3xl">
					<Button
						size="lg"
						color='primary'
						disabled={isSubmitDisabled}
						loading={submitLoading}
						onPress={handleSubmit}
					>
						<Text><Trans>确定</Trans></Text>
					</Button>
				</View>
			</SafeAreaView>

			<AccountSelectionDrawer
				visible={isFromDrawerOpen}
				onClose={() => setIsFromDrawerOpen(false)}
				onSelect={(account: User.AccountItem) => {
					if (account.id === toAccount?.id) {
						setToAccount(undefined);
					}
					setFromAccount(account);
				}}
				selectedAccountId={fromAccount?.id}
				title={<DrawerTitle><Trans>从</Trans></DrawerTitle>}
			/>

			<AccountSelectionDrawer
				visible={isToDrawerOpen}
				onClose={() => setIsToDrawerOpen(false)}
				onSelect={(account: User.AccountItem) => {
					if (account.id === fromAccount?.id) {
						setFromAccount(undefined);
					}
					setToAccount(account);
				}}
				selectedAccountId={toAccount?.id}
				title={<DrawerTitle><Trans>到</Trans></DrawerTitle>}
			/>
		</View >
	);
}

function AccountSelector({
	label,
	account,
	onPress
}: {
	label: React.ReactNode,
	account?: User.AccountItem,
	onPress: () => void
}) {
	return (
		<Pressable onPress={onPress} >
			<Card className="bg-special border-0 rounded-small">
				<CardContent className="p-xl flex-row items-center justify-between">
					<View className="flex-1 gap-1">
						<Text className="text-paragraph-p3 text-content-1">{label}</Text>
						<Text className="text-paragraph-p2 text-content-1" numberOfLines={1}>{account?.id}</Text>
					</View>
					<IconifyNavArrowRight width={18} height={18} className='text-brand-secondary-3' />
				</CardContent>
			</Card>
		</Pressable>
	);
}
