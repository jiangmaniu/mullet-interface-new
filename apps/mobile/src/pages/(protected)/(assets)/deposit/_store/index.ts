import { create } from 'zustand';

interface DepositState {
	// 选择的代币和链
	selectedTokenSymbol: string;
	selectedChainId: string;

	// 目标账户
	depositTargetAccount: User.AccountItem | null;
	tradeAccountId: string; // 交易账户 ID

	// 存款地址
	depositWalletAddress: string | null;

	// Actions
	setSelectedTokenSymbol: (tokenSymbol: string) => void;
	setSelectedChainId: (chainId: string) => void;
	setDepositTargetAccount: (account: User.AccountItem | null) => void;
	setTradeAccountId: (id: string) => void;
	setDepositWalletAddress: (address: string | null) => void;

	// 重置状态（离开存款流程时调用）
	reset: () => void;
}

const initialState = {
	selectedTokenSymbol: '',
	selectedChainId: '',
	depositTargetAccount: null,
	tradeAccountId: '',
	depositWalletAddress: null,
};

export const useDepositStore = create<DepositState>((set) => ({
	...initialState,

	setSelectedTokenSymbol: (tokenSymbol) => set({ selectedTokenSymbol: tokenSymbol }),
	setSelectedChainId: (chainId) => set({ selectedChainId: chainId }),
	setDepositTargetAccount: (account) => set({ depositTargetAccount: account }),
	setTradeAccountId: (id) => set({ tradeAccountId: id }),
	setDepositWalletAddress: (address) => set({ depositWalletAddress: address }),

	reset: () => set(initialState),
}));
