import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Drawer, DrawerClose, DrawerContent } from '@/components/ui/drawer';
import { IconSpecialCodexLoading } from '@/components/ui/icons/set/special/loading';
import { IconSpecialFail } from '@/components/ui/icons/set/special/fail';
import { IconSpecialSuccess } from '@/components/ui/icons/set/special/success';
import { Text } from '@/components/ui/text';
import { useAccount, useAppKit } from '@/lib/appkit';
import { Trans } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from 'react-native-reanimated';
import { IconifyNavArrowLeft } from '@/components/ui/icons';
import { usePathname } from 'expo-router';
import { useLoginAuthStore } from '@/stores/login-auth';

type ConnectWalletState = 'idle' | 'connecting' | 'signing' | 'signature_failed';

interface ConnectWalletDrawerProps {
	visible: boolean;
	onClose: () => void;
	onConnected: () => void;
}

export function ConnectWalletDrawer({ visible, onClose, onConnected }: ConnectWalletDrawerProps) {
	const [state, setState] = useState<ConnectWalletState>('idle');
	const { open } = useAppKit();
	const { isConnected, address } = useAccount();
	const pathname = usePathname();
	const { setRedirectTo } = useLoginAuthStore();

	// 当抽屉打开时，自动触发钱包连接
	useEffect(() => {
		if (visible && !isConnected) {
			// 保存当前路径，钱包返回后会跳转回来
			setRedirectTo(pathname);
			setState('connecting');
			open();
		}
	}, [visible, isConnected, open, pathname, setRedirectTo]);

	// 监听连接状态变化
	useEffect(() => {
		if (!visible) return;

		if (isConnected && address) {
			// 连接成功后进入签名状态
			setState('signing');
			// TODO: 这里应该调用后端签名接口
			// 暂时模拟签名成功
			setTimeout(() => {
				onConnected();
			}, 1000);
		}
	}, [visible, isConnected, address, onConnected]);

	const handleRetry = () => {
		setState('connecting');
		open();
	};

	const getStep1Status = () => {
		switch (state) {
			case 'idle':
				return 'pending';
			case 'connecting':
				return 'loading';
			case 'signing':
			case 'signature_failed':
				return 'success';
			default:
				return 'pending';
		}
	};

	const getStep2Status = () => {
		switch (state) {
			case 'idle':
			case 'connecting':
				return 'pending';
			case 'signing':
				return 'loading';
			case 'signature_failed':
				return 'error';
			default:
				return 'pending';
		}
	};

	const getStep2Title = () => {
		if (state === 'signature_failed') {
			return <Trans>签名失败</Trans>;
		}
		return <Trans>签名请求</Trans>;
	};

	const getStep2Description = () => {
		if (state === 'signature_failed') {
			return <Trans>手动取消/其它未知错误导致钱包签名失败</Trans>;
		}
		return <Trans>这是一次身份验证用于安全登录，不会产生交易</Trans>;
	};

	return (
		<Drawer open={visible} onOpenChange={onClose}>
			<DrawerContent className="px-5 pb-3xl gap-xl">
				<View className="pt-3xl flex-row justify-between items-center">
					<IconifyNavArrowLeft width={24} height={24} className="text-content-4" />
					<Text className="text-paragraph-p1 text-content-1"><Trans>连接钱包</Trans></Text>
					<DrawerClose />
				</View>

				<Text className="text-paragraph-p3 text-content-4">
					<Trans>您将收到2个签名请求。签名是免费的，不会触发任何交易。</Trans>
				</Text>

				<View className="gap-3xl">

					<Card>
						<CardContent className="px-xl py-xl gap-xl">
							<StepRow
								stepNumber={1}
								status={getStep1Status()}
								title={<Trans>连接钱包</Trans>}
								description={<Trans>仅作确认您是此钱包的所有权</Trans>}
							/>
							<StepRow
								stepNumber={2}
								status={getStep2Status()}
								title={getStep2Title()}
								description={getStep2Description()}
							/>
						</CardContent>
					</Card>

					{state === 'signature_failed' && (
						<Button color="primary" size="lg" block onPress={handleRetry}>
							<Text><Trans>重新连接</Trans></Text>
						</Button>
					)}
				</View>
			</DrawerContent>
		</Drawer>
	);
}

type StepStatus = 'pending' | 'loading' | 'success' | 'error';

function StepRow({
	stepNumber,
	status,
	title,
	description,
}: {
	stepNumber: number;
	status: StepStatus;
	title: React.ReactNode;
	description: React.ReactNode;
}) {
	return (
		<View className="flex-row items-start gap-medium">
			<StepIndicator stepNumber={stepNumber} status={status} />
			<View className="flex-1 gap-xs">
				<Text className="text-paragraph-p2 text-content-1">{title}</Text>
				<Text className="text-paragraph-p3 text-content-4">{description}</Text>
			</View>
		</View>
	);
}

function StepIndicator({ stepNumber, status }: { stepNumber: number; status: StepStatus }) {
	if (status === 'loading') {
		return <SpinningLoader />;
	}

	if (status === 'success') {
		return <IconSpecialSuccess width={20} height={20} />;
	}

	if (status === 'error') {
		return <IconSpecialFail width={20} height={20} />;
	}

	return (
		<View className="w-5 h-5 rounded-full bg-brand-default items-center justify-center">
			<Text className="text-paragraph-p3 text-content-4">{stepNumber}</Text>
		</View>
	);
}

function SpinningLoader() {
	const rotation = useSharedValue(0);

	useEffect(() => {
		rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1, false);
	}, [rotation]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotation.value}deg` }],
	}));

	return (
		<Animated.View style={animatedStyle}>
			<IconSpecialCodexLoading width={16} height={16} className="text-brand-support" />
		</Animated.View>
	);
}
