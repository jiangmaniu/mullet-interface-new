import { Button } from '@/components/ui/button';
import { Modal, ModalContent } from '@/components/ui/modal';
import { IconifyCheckCircle, IconifyCloseCircle } from '@/components/ui/icons/iconify';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import { View } from 'react-native';

interface WithdrawStatusModalProps {
	visible: boolean;
	status: 'success' | 'failed';
	onClose: () => void;
}

export function WithdrawStatusModal({ visible, status, onClose }: WithdrawStatusModalProps) {
	const isSuccess = status === 'success';

	return (
		<Modal visible={visible} onClose={onClose}>
			<ModalContent className="gap-xl items-center py-4xl px-3xl">
				{isSuccess ? (
					<IconifyCheckCircle width={48} height={48} className="text-status-success" />
				) : (
					<IconifyCloseCircle width={48} height={48} className="text-status-danger" />
				)}

				<View className="gap-medium items-center">
					<Text className="text-paragraph-p1 text-content-1">
						{isSuccess ? (
							<Trans>取现提交成功</Trans>
						) : (
							<Trans>取现提交失败</Trans>
						)}
					</Text>
					<Text className="text-paragraph-p3 text-content-4 text-center">
						{isSuccess ? (
							<Trans>等待链上交易确认</Trans>
						) : (
							<Trans>请稍后重试</Trans>
						)}
					</Text>
				</View>

				<Button block size="lg" color="primary" onPress={onClose}>
					<Text>
						<Trans>确定</Trans>
					</Text>
				</Button>
			</ModalContent>
		</Modal>
	);
}
