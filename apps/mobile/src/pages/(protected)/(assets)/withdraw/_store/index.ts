import { create } from 'zustand'

interface WithdrawState {
  // 选择的代币和链
  selectedTokenSymbol: string
  selectedChainId: string

  // 提现金额
  withdrawAmount: string

  // 提现地址
  fromWalletAddress?: string // 交易账户的钱包地址（付款方）
  toWalletAddress: string // 用户输入的目标地址（收款方）

  // 选中的账户ID
  selectedAccountId: string | undefined

  // Actions
  setSelectedTokenSymbol: (tokenSymbol: string) => void
  setSelectedChainId: (chainId: string) => void
  setWithdrawAmount: (amount: string) => void
  setFromWalletAddress: (address: string) => void
  setToWalletAddress: (address: string) => void
  setSelectedAccountId: (accountId: string | undefined) => void

  // 重置状态（离开提现流程时调用）
  reset: () => void
}

const initialState = {
  selectedTokenSymbol: '',
  selectedChainId: '',
  withdrawAmount: '',
  fromWalletAddress: undefined,
  toWalletAddress: '',
  selectedAccountId: undefined,
}

export const useWithdrawStore = create<WithdrawState>((set) => ({
  ...initialState,

  setSelectedTokenSymbol: (tokenSymbol) => set({ selectedTokenSymbol: tokenSymbol }),
  setSelectedChainId: (chainId) => set({ selectedChainId: chainId }),
  setWithdrawAmount: (amount) => set({ withdrawAmount: amount }),
  setFromWalletAddress: (address) => set({ fromWalletAddress: address }),
  setToWalletAddress: (address) => set({ toWalletAddress: address }),
  setSelectedAccountId: (accountId) => set({ selectedAccountId: accountId }),

  reset: () => set(() => ({ ...initialState })),
}))
