import { observer } from 'mobx-react-lite'

import { useRootStore } from '@/stores'

import { AccountSwitchDrawer } from './account-switch-drawer'

interface AccountSwitchDrawerProps {
  selectedAccountId: string
  visible: boolean
  onClose: () => void
  onSwitchSuccess?: (account: User.AccountItem) => Promise<void> | void
}

export const TradeAccountSwitchDrawer = observer(
  ({ selectedAccountId, visible, onClose, onSwitchSuccess }: AccountSwitchDrawerProps) => {
    const handleSwitch = async (account: User.AccountItem) => {
      if (account.id !== selectedAccountId) {
        // 同步设置 Zustand activeTradeAccountId（触发订阅自动刷新品种列表）
        await useRootStore.getState().user.info.setActiveTradeAccountId(account.id)
      }

      await Promise.resolve(onSwitchSuccess?.(account))
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
    )
  },
)
