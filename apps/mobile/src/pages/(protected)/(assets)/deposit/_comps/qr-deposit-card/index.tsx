import { IconifyFlashSolid } from '@/components/ui/icons/iconify';
import { Trans } from '@lingui/react/macro';
import { router } from 'expo-router';
import { Image, View } from 'react-native';
import { DepositMethodCard } from '../method-card';
import { useSupportedChains } from '../../_hooks/use-supported-chains';
import { IconSpinner } from '@/components/ui/icons';

export function QrDepositCard() {
	const { data: chains, isLoading } = useSupportedChains();
	const chainIcons = chains?.slice(0, 6) || [];

	return (
		<DepositMethodCard
			icon={<IconifyFlashSolid width={24} height={24} className="text-content-1" />}
			title={<Trans>扫码转入</Trans>}
			subtitle={<Trans>无限制 · 即时</Trans>}
			rightContent={
				<View className="flex-row items-center pr-xs">
					{isLoading ? <IconSpinner width={14} height={14} className='text-content-1' /> : chainIcons.map((chain, index) => (
						<View key={chain.chainId} className={index < chainIcons.length - 1 ? '-mr-1' : ''}>
							{chain.iconUrl ? (
								<Image source={{ uri: chain.iconUrl }} style={{ width: 24, height: 24 }} />
							) : null}
						</View>
					))}
				</View>
			}
			onPress={() => router.push('/(assets)/deposit/qr-deposit')}
		/>
	);
}
