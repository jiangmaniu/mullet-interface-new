import { useState, useCallback, useRef, useEffect } from 'react';
import { View } from 'react-native';
import { Modal } from '@/components/ui/modal';
import { Spinning } from '@/components/ui/spinning';
import { AccountSelectDrawer, type Account } from './account-select-drawer';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';

// Drawer 关闭动画时长（与 drawer.tsx 中 closeDuration 保持一致）
const DRAWER_CLOSE_DURATION = 400;

interface AccountSwitchDrawerProps {
	visible: boolean;
	onClose: () => void;
	selectedAccountId?: string;
	onSwitch: (account: Account) => Promise<void> | void;
}

export function AccountSwitchDrawer({
	visible,
	onClose,
	selectedAccountId,
	onSwitch,
}: AccountSwitchDrawerProps) {
	const [loading, setLoading] = useState(false);
	const pendingAccountRef = useRef<Account | null>(null);

	const handleSelect = useCallback((account: Account) => {
		// 仅存储待切换账户，AccountSelectDrawer 内部会调用 onClose 关闭 Drawer
		pendingAccountRef.current = account;
	}, []);

	// 监听 Drawer 关闭：visible 变为 false 且有待切换账户时，等动画结束后显示 loading
	useEffect(() => {
		if (!visible && pendingAccountRef.current) {
			const timer = setTimeout(async () => {
				const account = pendingAccountRef.current;
				if (!account) return;
				pendingAccountRef.current = null;

				setLoading(true);
				try {
					// TODO: 替换为真实 API 调用后可移除 delay
					await Promise.all([
						onSwitch(account),
						new Promise(resolve => setTimeout(resolve, 1500)),
					]);
				} finally {
					setLoading(false);
				}
			}, DRAWER_CLOSE_DURATION);
			return () => clearTimeout(timer);
		}
	}, [visible, onSwitch]);

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

export type { Account };
