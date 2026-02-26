import { useState } from 'react';
import { View } from 'react-native';
import { Modal } from '@/components/ui/modal';
import { Spinning } from '@/components/ui/spinning';
import { AccountSelectDrawer } from './account-select-drawer';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';

interface AccountSwitchDrawerProps {
	visible: boolean;
	onClose: () => void;
	selectedAccountId?: string;
	onSwitch: (account: User.AccountItem) => Promise<void> | void;
}

export function AccountSwitchDrawer({
	visible,
	onClose,
	selectedAccountId,
	onSwitch,
}: AccountSwitchDrawerProps) {
	const [loading, setLoading] = useState(false);

	const handleSelect = async (account: User.AccountItem) => {
		setLoading(true);
		try {
			await Promise.all([
				onSwitch(account),
			]);
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<AccountSelectDrawer
				visible={visible}
				onClose={onClose}
				selectedAccountId={selectedAccountId}
				onSelect={handleSelect}
			/>

			<Modal visible={loading} closeOnBackdropPress={false} className='bg-special'>
				<View className="items-center justify-center gap-xl">
					<Spinning width={40} height={40} />
					<Text className='text-content-1 text-paragraph-p2'><Trans>正在切换账户，请稍后...</Trans> </Text>
				</View>
			</Modal>
		</>
	);
}

