import { create } from 'zustand';

interface WithdrawState {
	// 选择的代币和链
	selectedTokenSymbol: string;
	selectedChainId: string;

	// 提现金额
	withdrawAmount: string;

	// 提现地址
	withdrawAddress: string;

	// 源账户
	withdrawSourceAccount: User.AccountItem | null;

	// Actions
	setSelectedTokenSymbol: (tokenSymbol: string) => void;
	setSelectedChainId: (chainId: string) => void;
	setWithdrawAmount: (amount: string) => void;
	setWithdrawAddress: (address: string) => void;
	setWithdrawSourceAccount: (account: User.AccountItem | null) => void;

	// 重置状态（离开提现流程时调用）
	reset: () => void;
}

const initialState = {
	selectedTokenSymbol: '',
	selectedChainId: '',
	withdrawAmount: '',
	withdrawAddress: '',
	withdrawSourceAccount: null,
};

export const useWithdrawStore = create<WithdrawState>((set) => ({
	...initialState,

	setSelectedTokenSymbol: (tokenSymbol) => set({ selectedTokenSymbol: tokenSymbol }),
	setSelectedChainId: (chainId) => set({ selectedChainId: chainId }),
	setWithdrawAmount: (amount) => set({ withdrawAmount: amount }),
	setWithdrawAddress: (address) => set({ withdrawAddress: address }),
	setWithdrawSourceAccount: (account) => set({ withdrawSourceAccount: account }),

	reset: () => set(initialState),
}));
