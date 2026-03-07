import { create } from 'zustand'

interface DepositState {
  // 选择的代币和链
  selectedTokenSymbol: string
  selectedChainId: string

  // 选中的账户ID
  selectedAccountId: string | number | null

  // 存款地址
  depositWalletAddress: string | null

  // Actions
  setSelectedTokenSymbol: (tokenSymbol: string) => void
  setSelectedChainId: (chainId: string) => void
  setSelectedAccountId: (accountId: string | number | null) => void
  setDepositWalletAddress: (address: string | null) => void

  // 重置状态（离开存款流程时调用）
  reset: () => void
}

const initialState = {
  selectedTokenSymbol: '',
  selectedChainId: '',
  selectedAccountId: null,
  depositWalletAddress: null,
}

export const useDepositStore = create<DepositState>((set) => ({
  ...initialState,

  setSelectedTokenSymbol: (tokenSymbol) => set({ selectedTokenSymbol: tokenSymbol }),
  setSelectedChainId: (chainId) => set({ selectedChainId: chainId }),
  setSelectedAccountId: (accountId) => set({ selectedAccountId: accountId }),
  setDepositWalletAddress: (address) => set({ depositWalletAddress: address }),

  reset: () => set(() => ({ ...initialState })),
}))
