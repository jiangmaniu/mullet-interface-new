import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { IconUSDC1 } from '@/components/ui/icons/set/usdc-1';
import { IconUsdcSol } from '@/components/ui/icons/set/usdc-sol';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

interface WalletAsset {
	id: string;
	symbol: string;
	name: string;
	balance: string;
	balanceUsd: string;
	icon: React.ReactNode;
	status: 'available' | 'insufficient';
	statusLabel?: string;
}

const MOCK_ASSETS: WalletAsset[] = [
	{ id: 'sol', symbol: 'SOL', name: 'SOLANA', balance: '153,568.00 USDC', balanceUsd: '$153,568.00', icon: <IconUsdcSol width={24} height={24} />, status: 'available' },
	{ id: 'usdc-1', symbol: 'USDC', name: 'USDC', balance: '153,568.00 USDC', balanceUsd: '$153,568.00', icon: <IconUSDC1 width={24} height={24} />, status: 'available' },
	{ id: 'usdc-2', symbol: 'USDC', name: 'USDC', balance: '153,568.00 USDC', balanceUsd: '$153,568.00', icon: <IconUSDC1 width={24} height={24} />, status: 'available', statusLabel: '无法使用' },
	{ id: 'usdc-3', symbol: 'USDC', name: 'USDC', balance: '0.00 USDC', balanceUsd: '$0.00', icon: <IconUSDC1 width={24} height={24} />, status: 'insufficient', statusLabel: '余额不足' },
];

export default function WalletTransferScreen() {
	return (
		<View className="flex-1 gap-xl">
			<ScreenHeader content={<Trans>钱包转入</Trans>} />
			<View className="flex-1 gap-xl">
				<View className="px-5">
					<Text className="text-paragraph-p2 text-content-4">
						<Trans>余额：</Trans>≈0.00 USD
					</Text>
				</View>
				<View className="px-5 gap-xl">
					{MOCK_ASSETS.map((asset) => (
						<AssetRow key={asset.id} asset={asset} />
					))}
				</View>
			</View>
		</View>
	);
}

function AssetRow({ asset }: { asset: WalletAsset }) {
	const disabled = asset.status === 'insufficient' || asset.statusLabel === '无法使用';

	const handlePress = () => {
		if (asset.symbol === 'USDC') {
			router.push('/(assets)/deposit/wallet-transfer/usdc');
		} else {
			router.push('/(assets)/deposit/wallet-transfer/swap');
		}
	};

	return (
		<Pressable disabled={disabled} onPress={handlePress}>
			<Card className="rounded-small" style={disabled ? { opacity: 0.5 } : undefined}>
				<CardContent className="py-medium px-xl flex-row items-center justify-between">
					<View className="flex-row items-center gap-medium">
						{asset.icon}
						<View className="gap-xs">
							<Text className="text-paragraph-p2 text-content-1">{asset.name}</Text>
							<Text className="text-paragraph-p3 text-content-4">{asset.balance}</Text>
						</View>
					</View>
					<View className="flex-row items-center gap-small">
						{asset.statusLabel && (
							<Badge color="default">
								<Text>{asset.statusLabel}</Text>
							</Badge>
						)}
						<Text className="text-paragraph-p2 text-content-1">{asset.balanceUsd}</Text>
					</View>
				</CardContent>
			</Card>
		</Pressable>
	);
}
