import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { IconifyNavArrowDown, IconifyUserCircle } from '@/components/ui/icons';
import { IconArbitrum } from '@/components/ui/icons/set/arbitrum';
import { IconBitcoin } from '@/components/ui/icons/set/bitcoin';
import { IconEthereum } from '@/components/ui/icons/set/ethereum';
import { IconMastercard } from '@/components/ui/icons/set/mastercard';
import { IconRecord } from '@/components/ui/icons/set/record';
import { IconUSDC1 } from '@/components/ui/icons/set/usdc-1';
import { IconVisa } from '@/components/ui/icons/set/visa';
import { IconMetamaskFull } from '@/components/ui/icons/set/wallet/metamask-full';
import { IconOkxWallet } from '@/components/ui/icons/set/wallet/okx-wallet';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Trans } from '@lingui/react/macro';
import { WalletSolid, FlashSolid, CreditCardSolid } from 'iconoir-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AccountSelectionDrawer, type Account } from './_comps/account-selection-drawer';
import { router } from 'expo-router';

const DEFAULT_ACCOUNT: Account = {
	id: '152365236',
	name: '标准账户',
	balance: '152,563.00',
	currency: 'USDC',
};

export default function DepositScreen() {
	const { textColorContent1, textColorContent4 } = useThemeColors();
	const [selectedAccount, setSelectedAccount] = useState<Account>(DEFAULT_ACCOUNT);
	const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

	return (
		<View className="flex-1">
			<ScreenHeader
				content={<Trans>存款</Trans>}
				right={
					<Pressable>
						<IconRecord width={24} height={24} color={textColorContent1} />
					</Pressable>
				}
			/>
			<View className="flex-1 gap-xl pt-xl">
				<View className="px-5">
					<Pressable onPress={() => setIsAccountDrawerOpen(true)}>
						<Card className="rounded-small">
							<CardContent className="py-xl px-xl flex-row items-center justify-between">
								<View className="flex-row items-center gap-xl">
									<View className="flex-row items-center gap-xs">
										<IconifyUserCircle width={24} height={24} color={textColorContent1} />
										<Text className="text-paragraph-p2 text-content-1">{selectedAccount.id}</Text>
									</View>
									<View className="flex-row items-center gap-medium">
										<Badge color="green"><Text><Trans>真实</Trans></Text></Badge>
										<Badge color="default"><Text>STP</Text></Badge>
									</View>
								</View>
								<IconifyNavArrowDown width={16} height={16} color={textColorContent4} />
							</CardContent>
						</Card>
					</Pressable>
				</View>
				<View className="px-5">
					<Text className="text-paragraph-p2 text-content-4"><Trans>选择适合您的入金方式</Trans></Text>
				</View>
				<View className="px-5 gap-xl">
					<Pressable onPress={() => router.push('/(assets)/deposit/wallet/wallet-asset')}>
						<Card className="rounded-small">
							<CardContent className="py-medium px-xl flex-row items-center justify-between">
								<View className="flex-row items-center gap-medium">
									<WalletSolid width={24} height={24} color={textColorContent1} />
									<View className="gap-xs">
										<Text className="text-paragraph-p2 text-content-1"><Trans>钱包资产入金</Trans></Text>
										<Text className="text-paragraph-p3 text-content-4"><Trans>无限制 · 即时</Trans></Text>
									</View>
								</View>
								<View className="flex-row items-center pr-xs">
									<View className="-mr-1"><IconMetamaskFull width={24} height={24} /></View>
									<View className="-mr-1"><IconOkxWallet width={24} height={24} /></View>
									<IconArbitrum width={24} height={24} />
								</View>
							</CardContent>
						</Card>
					</Pressable>
					<View className="items-center justify-center h-4">
						<View className="w-full h-px bg-brand-default" />
						<View className="absolute bg-secondary px-medium">
							<Text className="text-paragraph-p3 text-content-5"><Trans>或者</Trans></Text>
						</View>
					</View>
					<Pressable onPress={() => router.push('/(assets)/deposit/wallet/crypto')}>
						<Card className="rounded-small">
							<CardContent className="py-medium px-xl flex-row items-center justify-between">
								<View className="flex-row items-center gap-medium">
									<FlashSolid width={24} height={24} color={textColorContent1} />
									<View className="gap-xs">
										<Text className="text-paragraph-p2 text-content-1"><Trans>加密货币入金</Trans></Text>
										<Text className="text-paragraph-p3 text-content-4"><Trans>无限制 · 即时</Trans></Text>
									</View>
								</View>
								<View className="flex-row items-center pr-xs">
									<View className="-mr-1"><IconBitcoin width={24} height={24} /></View>
									<View className="-mr-1"><IconEthereum width={24} height={24} /></View>
									<IconUSDC1 width={24} height={24} />
								</View>
							</CardContent>
						</Card>
					</Pressable>
					<Pressable onPress={() => router.push('/(assets)/deposit/wallet/credit-card')}>
						<Card className="rounded-small">
							<CardContent className="py-medium px-xl flex-row items-center justify-between">
								<View className="flex-row items-center gap-medium">
									<CreditCardSolid width={24} height={24} color={textColorContent1} />
									<View className="gap-xs">
										<Text className="text-paragraph-p2 text-content-1"><Trans>信用卡买币</Trans></Text>
										<Text className="text-paragraph-p3 text-content-4">$50000 · <Trans>5分钟</Trans></Text>
									</View>
								</View>
								<View className="flex-row items-center gap-medium">
									<IconVisa width={24} height={24} />
									<IconMastercard width={24} height={24} />
								</View>
							</CardContent>
						</Card>
					</Pressable>
				</View>
			</View>
			<AccountSelectionDrawer
				visible={isAccountDrawerOpen}
				onClose={() => setIsAccountDrawerOpen(false)}
				onSelect={setSelectedAccount}
				selectedAccountId={selectedAccount.id}
			/>
		</View>
	);
}
