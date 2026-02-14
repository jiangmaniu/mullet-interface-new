import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { IconUSDC1 } from '@/components/ui/icons/set/usdc-1';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

interface Asset {
	symbol: string;
	balance: string;
	valueUsd: string;
	status?: 'available' | 'unavailable' | 'insufficient';
	statusLabel?: string;
}

const MOCK_ASSETS: Asset[] = [
	{ symbol: 'USDC', balance: '153,568.00 USDC', valueUsd: '$153,568.00', status: 'available' },
	{ symbol: 'USDC', balance: '153,568.00 USDC', valueUsd: '$153,568.00', status: 'unavailable', statusLabel: '不适用' },
	{ symbol: 'USDC', balance: '0.00 USDC', valueUsd: '$0.00', status: 'insufficient', statusLabel: '余额不足' },
];

export default function SelectAssetScreen() {
	return (
		<View className="flex-1 gap-xl">
			<ScreenHeader content={<Trans>选择资产</Trans>} />
			<View className="flex-1 gap-xl">
				<View className="px-5">
					<Text className="text-paragraph-p2 text-content-4">
						<Trans>选择需要兑换的资产</Trans>
					</Text>
				</View>
				<View className="px-5 gap-xl">
					{MOCK_ASSETS.map((asset, index) => (
						<AssetRow key={index} asset={asset} />
					))}
				</View>
			</View>
		</View>
	);
}

function AssetRow({ asset }: { asset: Asset }) {
	const disabled = asset.status !== 'available';

	const handlePress = () => {
		router.push('/(assets)/deposit/wallet/wallet-asset/recharge');
	}

	return (
		<Pressable disabled={disabled} onPress={handlePress}>
			<Card className="rounded-small" style={disabled ? { opacity: 0.5 } : undefined}>
				<CardContent className="py-medium px-xl flex-row items-center justify-between">
					<View className="flex-row items-center gap-medium">
						<IconUSDC1 width={24} height={24} />
						<View className="gap-xs">
							<Text className="text-paragraph-p2 text-content-1">{asset.symbol}</Text>
							<Text className="text-paragraph-p3 text-content-4">{asset.balance}</Text>
						</View>
					</View>
					<View className="flex-row items-center gap-small">
						{asset.statusLabel && (
							<Badge color="default">
								<Text>{asset.statusLabel}</Text>
							</Badge>
						)}
						<Text className="text-paragraph-p2 text-content-1">{asset.valueUsd}</Text>
					</View>
				</CardContent>
			</Card>
		</Pressable>
	);
}
