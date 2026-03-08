import { create } from 'zustand'

interface DepositState {
  // 选择的代币和链
  selectedTokenSymbol: string
  selectedChainId: string

  // 选中的账户ID
  selectedAccountId?: string

  // 充值地址
  fromWalletAddress?: string // 用户的 Web3 钱包地址
  toWalletAddress?: string // 平台的充值地址

  // 充值金额
  depositAmount: string

  // Actions
  setSelectedTokenSymbol: (tokenSymbol: string) => void
  setSelectedChainId: (chainId: string) => void
  setSelectedAccountId: (accountId: string) => void
  setFromWalletAddress: (address: string) => void
  setToWalletAddress: (address: string) => void
  setDepositAmount: (amount: string) => void

  // 重置状态（离开存款流程时调用）
  reset: () => void
}

const initialState = {
  selectedTokenSymbol: '',
  selectedChainId: '',
  selectedAccountId: undefined,
  fromWalletAddress: undefined,
  toWalletAddress: undefined,
  depositAmount: '',
}

export const useDepositStore = create<DepositState>((set) => ({
  ...initialState,

  setSelectedTokenSymbol: (tokenSymbol) => set({ selectedTokenSymbol: tokenSymbol }),
  setSelectedChainId: (chainId) => set({ selectedChainId: chainId }),
  setSelectedAccountId: (accountId) => set({ selectedAccountId: accountId }),
  setFromWalletAddress: (address) => set({ fromWalletAddress: address }),
  setToWalletAddress: (address) => set({ toWalletAddress: address }),
  setDepositAmount: (amount) => set({ depositAmount: amount }),

  reset: () => set(() => ({ ...initialState })),
}))
