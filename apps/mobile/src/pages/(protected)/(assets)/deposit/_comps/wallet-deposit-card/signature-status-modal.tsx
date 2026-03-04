import { Button } from '@/components/ui/button';
import { IconSpecialCodexLoading } from '@/components/ui/icons/set/special/loading';
import { IconSpecialFail } from '@/components/ui/icons/set/special/fail';
import { Modal, ModalContent } from '@/components/ui/modal';
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

export type SignatureStatus = 'idle' | 'signing' | 'success' | 'failed';

interface SignatureStatusModalProps {
	visible: boolean;
	status: SignatureStatus;
	onClose: () => void;
	onRetry: () => void;
	sendAmount?: string;
	sendToken?: string;
	receiveAmount?: string;
	receiveToken?: string;
}

export function SignatureStatusModal({
	visible,
	status,
	onClose,
	onRetry,
	sendAmount,
	sendToken,
	receiveAmount,
	receiveToken,
}: SignatureStatusModalProps) {
	if (status === 'idle') return null;

	return (
		<Modal visible={visible} onClose={onClose} closeOnBackdropPress={false}>
			<ModalContent>
				<View className="px-2xl py-3xl gap-3xl">
					{(status === 'signing' || status === 'success') && (
						<View className="items-center gap-medium">
							<SpinningLoader />
							<Text className="text-paragraph-p2 text-content-1 text-center">
								<Trans>签名成功，等待链上确认交易</Trans>
							</Text>
						</View>
					)}

					{status === 'failed' && (
						<View className="items-center gap-medium">
							<IconSpecialFail width={32} height={32} />
							<View className="items-center gap-xs">
								<Text className="text-paragraph-p2 text-content-1 text-center">
									<Trans>交易签名失败</Trans>
								</Text>
								<Text className="text-paragraph-p3 text-content-4 text-center">
									<Trans>手动取消/其它未知错误导致钱包签名失败</Trans>
								</Text>
							</View>
						</View>
					)}

					{status === 'failed' && (
						<Button color="primary" size="lg" block onPress={onRetry}>
							<Text><Trans>重新签名</Trans></Text>
						</Button>
					)}
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
