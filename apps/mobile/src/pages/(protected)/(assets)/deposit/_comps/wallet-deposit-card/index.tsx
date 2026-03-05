import { Text } from '@/components/ui/text';
import { IconifyWalletSolid } from '@/components/ui/icons/iconify';
import { IconMetamaskFull } from '@/components/ui/icons/set/wallet/metamask-full';
import { IconOkxWallet } from '@/components/ui/icons/set/wallet/okx-wallet';
import { IconArbitrum } from '@/components/ui/icons/set/arbitrum';
import { formatAddress } from '@mullet/utils/format';
import { Trans } from '@lingui/react/macro';
import { router } from 'expo-router';
import { Image, View } from 'react-native';
import { useEffect, useState } from 'react';
import { DepositMethodCard } from '../method-card';
import { ConnectWalletDrawer } from './connect-wallet-drawer';
import { useAccount, useWalletInfo } from '@/lib/appkit';
import { useDepositStore } from '../../_store';
import { LoginType, useLoginAuthStore } from '@/stores/login-auth';

export function WalletDepositCard() {
	const [isConnectWalletOpen, setIsConnectWalletOpen] = useState(false);

	// 从 store 读取状态
	const depositWalletAddress = useDepositStore((s) => s.depositWalletAddress);
	const setDepositWalletAddress = useDepositStore((s) => s.setDepositWalletAddress);
	const loginType = useLoginAuthStore((s) => s.loginType);

	// 监听全局钱包状态
	const { isConnected: isGlobalWalletConnected, address: globalWalletAddress } = useAccount();
	const { walletInfo } = useWalletInfo();

	const isWalletConnected = !!depositWalletAddress;

	// Web3 登录：同步全局钱包到入金钱包；Web2 为 null，需在 ConnectWalletDrawer 中连接
	useEffect(() => {
		if (loginType === LoginType.Web3 || (loginType === null && isGlobalWalletConnected)) {
			if (isGlobalWalletConnected && globalWalletAddress) {
				setDepositWalletAddress(globalWalletAddress);
			}
		} else if (loginType === LoginType.Web2) {
			setDepositWalletAddress(null);
		}
	}, [loginType, isGlobalWalletConnected, globalWalletAddress, setDepositWalletAddress]);

	const walletMethodIcon =
		isWalletConnected && walletInfo?.icon ? (
			<Image source={{ uri: walletInfo.icon }} style={{ width: 24, height: 24, borderRadius: 4 }} />
		) : (
			<IconifyWalletSolid width={24} height={24} className="text-content-1" />
		);

	const handlePress = () => {
		if (isWalletConnected) {
			router.push('/(assets)/deposit/wallet-transfer');
		} else {
			setIsConnectWalletOpen(true);
		}
	};

	const handleConnected = () => {
		setIsConnectWalletOpen(false);
		// 连接成功后，更新 store 并跳转
		if (globalWalletAddress) {
			setDepositWalletAddress(globalWalletAddress);
		}
		router.push('/(assets)/deposit/wallet-transfer');
	};

	return (
		<>
			<DepositMethodCard
				icon={walletMethodIcon}
				title={
					isWalletConnected ? (
						<Text className="text-paragraph-p2 text-content-1">{depositWalletAddress ? formatAddress(depositWalletAddress) : '-'}</Text>
					) : (
						<Trans>直连钱包转入</Trans>
					)
				}
				subtitle={
					isWalletConnected ? (
						<Text className="text-paragraph-p3 text-content-4">
							<Trans>余额：≈0.00 USD</Trans>
						</Text>
					) : (
						<Trans>最低$5 · 即时</Trans>
					)
				}
				rightContent={
					isWalletConnected ? null : (
						<View className="flex-row items-center pr-xs">
							<View className="-mr-1"><IconMetamaskFull width={24} height={24} /></View>
							<View className="-mr-1"><IconOkxWallet width={24} height={24} /></View>
							<IconArbitrum width={24} height={24} />
						</View>
					)
				}
				onPress={handlePress}
			/>
			<ConnectWalletDrawer
				visible={isConnectWalletOpen}
				onClose={() => setIsConnectWalletOpen(false)}
				onConnected={handleConnected}
			/>
		</>
	);
}
