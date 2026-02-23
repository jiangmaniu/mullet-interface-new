import { Card, CardContent } from '@/components/ui/card';
import { IconSpecialSuccess } from '@/components/ui/icons/set/special/success';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import { View } from 'react-native';

const MOCK_ADDRESS = '0xd42eaasdsd45asd642527365';
const MOCK_HASH = '0xd42eaasdsd45asd642527365';

interface WithdrawStatusModalProps {
	visible: boolean;
	onClose: () => void;
	amount: string;
	token: string;
}

export function WithdrawStatusModal({
	visible,
	onClose,
	amount,
	token,
}: WithdrawStatusModalProps) {
	return (
		<Modal visible={visible} onClose={onClose} closeOnBackdropPress>
			<ModalContent className="gap-0">
				<ModalHeader>
					<ModalTitle>
						<Trans>取现状态</Trans>
					</ModalTitle>
				</ModalHeader>

				<View className="px-2xl pb-2xl">
					{/* Success icon + text */}
					<View className="items-center gap-medium py-3xl">
						<IconSpecialSuccess width={32} height={32} />
						<View className="items-center gap-xs">
							<Text className="text-paragraph-p2 text-content-1">
								<Trans>取现成功</Trans>
							</Text>
							<Text className="text-paragraph-p3 text-content-4">
								<Trans>您的资产已成功取现</Trans>
							</Text>
						</View>
					</View>

					{/* Details */}
					<Card>
						<CardContent className="px-xl py-medium gap-xs">
							<DetailRow
								label={<Trans>取现数量</Trans>}
								value={`${amount}${token}`}
							/>
							<DetailRow
								label={<Trans>取现地址</Trans>}
								value={MOCK_ADDRESS}
							/>
							<DetailRow
								label={<Trans>取现哈希</Trans>}
								value={MOCK_HASH}
							/>
						</CardContent>
					</Card>
				</View>
			</ModalContent>
		</Modal>
	);
}

function DetailRow({
	label,
	value,
}: {
	label: React.ReactNode;
	value: string;
}) {
	return (
		<View className="flex-row items-start gap-3xl">
			<Text className="text-paragraph-p3 text-content-4">{label}</Text>
			<Text className="text-paragraph-p3 text-content-1 flex-1 text-right">
				{value}
			</Text>
		</View>
	);
}
