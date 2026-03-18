import { observer } from 'mobx-react-lite';
import { AccountSwitchDrawer } from './account-switch-drawer';
import { useStores } from '@/v1/provider/mobxProvider';
import { useRootStore } from '@/stores';

interface AccountSwitchDrawerProps {
	selectedAccountId: string;
	visible: boolean;
	onClose: () => void;
	onSwitchSuccess?: (account: User.AccountItem) => Promise<void> | void;
}

export const TradeAccountSwitchDrawer = observer(({
	selectedAccountId,
	visible,
	onClose,
	onSwitchSuccess,
}: AccountSwitchDrawerProps) => {
	const { ws, trade } = useStores();

	const handleSwitch = async (account: User.AccountItem) => {
		if (account.id !== selectedAccountId) {
			// 切换账户组清空行情信息，每个账户组都不一样需要重置一遍
			await Promise.resolve(ws.resetData())
		}

		// 切换账户 重新更新查询品种列表
		await Promise.resolve(trade.getSymbolList({ accountId: account.id }))
		await Promise.resolve(trade.setCurrentAccountInfo(account))
		// 同步设置 Zustand activeTradeAccountId（触发订阅自动刷新品种列表）
		useRootStore.getState().user.info.setActiveTradeAccountId(account.id)
		await Promise.resolve(trade.setCurrentLiquidationSelectBgaId('CROSS_MARGIN'))
		await Promise.resolve(onSwitchSuccess?.(account));
	}

	return (
		<>
			<AccountSwitchDrawer
				selectedAccountId={selectedAccountId}
				visible={visible}
				onClose={onClose}
				onSwitch={handleSwitch}
			/>
		</>
	);
})

