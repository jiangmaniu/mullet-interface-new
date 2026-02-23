import { Card, CardContent } from '@/components/ui/card';
import { IconUsdcSol } from '@/components/ui/icons/set/usdc-sol';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import { Image, View } from 'react-native';

interface CreditCardDepositStatusModalProps {
	visible: boolean;
	onClose: () => void;
	channelName: string;
	channelIcon: string;
	currencyName: string;
	currencyIcon?: React.ReactNode;
	tokenName: string;
	tokenIcon?: React.ReactNode;
}

export function CreditCardDepositStatusModal({
	visible,
	onClose,
	channelName,
	channelIcon,
	currencyName,
	currencyIcon,
	tokenName,
	tokenIcon,
}: CreditCardDepositStatusModalProps) {
	return (
		<Modal visible={visible} onClose={onClose} closeOnBackdropPress>
			<ModalContent className='gap-0'>
				<ModalHeader>
					<ModalTitle>
						<Trans>入金状态</Trans>
					</ModalTitle>
				</ModalHeader>

				<View className="px-2xl pb-2xl">
					{/* Channel icon + text */}
					<View className="items-center gap-medium py-3xl">
						<Image
							source={{ uri: channelIcon }}
							className="size-8 rounded-full"
						/>
						<View className="items-center gap-xs">
							<Text className="text-paragraph-p2 text-content-1 text-center">
								<Trans>使用{channelName}完成交易</Trans>
							</Text>
							<Text className="text-paragraph-p3 text-content-4 text-center">
								<Trans>您可以关闭此窗口</Trans>
							</Text>
						</View>
					</View>

					{/* Transaction details */}
					<Card>
						<CardContent className="px-xl py-medium gap-xs">
							<DetailRow
								label={<Trans>您使用</Trans>}
								right={
									<View className="flex-row items-center gap-medium">
										{currencyIcon}
										<Text className="text-paragraph-p3 text-content-1">
											{currencyName}
										</Text>
									</View>
								}
							/>
							<DetailRow
								label={<Trans>您购买</Trans>}
								right={
									<View className="flex-row items-center gap-medium">
										{tokenIcon || <IconUsdcSol width={14} height={14} />}
										<Text className="text-paragraph-p3 text-content-1">
											{tokenName}
										</Text>
									</View>
								}
							/>
							<DetailRow
								label={<Trans>您获得</Trans>}
								right={
									<View className="flex-row items-center gap-medium">
										{tokenIcon || <IconUsdcSol width={14} height={14} />}
										<Text className="text-paragraph-p3 text-content-1">
											{tokenName}
										</Text>
									</View>
								}
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
	right,
}: {
	label: React.ReactNode;
	right: React.ReactNode;
}) {
	return (
		<View className="flex-row items-center justify-between">
			<Text className="text-paragraph-p3 text-content-4">{label}</Text>
			{right}
		</View>
	);
}
