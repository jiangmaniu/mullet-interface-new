import { Card, CardContent } from '@/components/ui/card';
import { IconSpecialCodexLoading } from '@/components/ui/icons/set/special/loading';
import { IconSpecialSuccess } from '@/components/ui/icons/set/special/success';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from 'react-native-reanimated';

export type DepositStatus = 'idle' | 'processing' | 'success';

const MOCK_TX_HASH = '3212...rowt';
const MOCK_TX_TIME = '1月15日 12:00:00';

interface DepositStatusModalProps {
	visible: boolean;
	status: DepositStatus;
	onClose: () => void;
}

export function DepositStatusModal({ visible, status, onClose }: DepositStatusModalProps) {
	return (
		<Modal visible={visible} onClose={onClose} closeOnBackdropPress={false}>
			<ModalContent>
				<ModalHeader>
					<ModalTitle><Trans>入金状态</Trans></ModalTitle>
				</ModalHeader>

				<View className="px-2xl pb-2xl gap-3xl">
					{/* 状态图标 + 文字 */}
					<View className="items-center gap-medium">
						{status === 'processing' ? (
							<SpinningLoader />
						) : (
							<IconSpecialSuccess width={32} height={32} />
						)}
						<View className="items-center gap-xs">
							<Text className="text-paragraph-p2 text-content-1">
								{status === 'processing' ? (
									<Trans>存款已接收并正在处理中...</Trans>
								) : (
									<Trans>存款成功</Trans>
								)}
							</Text>
							<Text className="text-paragraph-p3 text-content-4">
								{status === 'processing' ? (
									<Trans>您的存款将很快到账</Trans>
								) : (
									<Trans>您的存款已存入账户</Trans>
								)}
							</Text>
						</View>
					</View>

					{/* 交易详情 */}
					<Card>
						<CardContent className='px-xl py-medium gap-xs'>
							<DetailRow label={<Trans>存款交易</Trans>} value={MOCK_TX_HASH} />
							{status === 'success' && (
								<DetailRow label={<Trans>完成交易</Trans>} value={MOCK_TX_HASH} />
							)}
							<DetailRow label={<Trans>订单已提交</Trans>} value={MOCK_TX_TIME} />
							{status === 'success' && (
								<DetailRow label={<Trans>订单已成交</Trans>} value={MOCK_TX_TIME} />
							)}
						</CardContent>
					</Card>
				</View>
			</ModalContent>
		</Modal>
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
			<IconSpecialCodexLoading width={32} height={32} className="text-brand-support" />
		</Animated.View>
	);
}

function DetailRow({ label, value }: { label: React.ReactNode; value: string }) {
	return (
		<View className="flex-row items-center justify-between">
			<Text className="text-paragraph-p3 text-content-4">{label}</Text>
			<Text className="text-paragraph-p3 text-content-1">{value}</Text>
		</View>
	);
}
