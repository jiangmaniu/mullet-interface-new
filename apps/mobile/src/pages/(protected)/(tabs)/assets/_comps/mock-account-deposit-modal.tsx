import { View } from "react-native";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerDescription } from "@/components/ui/drawer";
import { Text } from "@/components/ui/text";
import { IconUSDC1 } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Trans } from "@lingui/react/macro";

interface MockAccountDepositModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm?: () => void;
}

export function MockAccountDepositModal({ open, onClose, onConfirm }: MockAccountDepositModalProps) {

	return (
		<Drawer open={open} onOpenChange={onClose}>
			<DrawerContent>
				<DrawerHeader className="px-5 pt-xl">
					<DrawerTitle><Trans>模拟账户存款</Trans></DrawerTitle>
					<DrawerDescription>
						<Trans>每日可存款10000.00 USDC</Trans>
					</DrawerDescription>
				</DrawerHeader>

				<View className="items-center gap-medium">
					<IconUSDC1 width={40} height={40} />
					<Text className="text-title-h3 text-content-1">10000.00 USDC</Text>
				</View>

				<DrawerFooter className="px-5 pb-3xl">
					<Button color='primary' size="lg" block onPress={onConfirm || onClose}>
						<Text><Trans>确定存款</Trans></Text>
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

export default MockAccountDepositModal;
