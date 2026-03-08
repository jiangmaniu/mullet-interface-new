import { create } from 'zustand'

interface DepositState {
  // 选择的代币和链
  selectedTokenSymbol: string
  selectedChainId: string

  // 选中的账户ID
  selectedAccountId: string | null

  // 充值地址
  fromWalletAddress: string | null // 用户的 Web3 钱包地址
  toWalletAddress: string | null // 平台的充值地址

  // 充值金额
  depositAmount: string

  // Actions
  setSelectedTokenSymbol: (tokenSymbol: string) => void
  setSelectedChainId: (chainId: string) => void
  setSelectedAccountId: (accountId: string | null) => void
  setFromWalletAddress: (address: string | null) => void
  setToWalletAddress: (address: string | null) => void
  setDepositAmount: (amount: string) => void

  // 重置状态（离开存款流程时调用）
  reset: () => void
}

const initialState = {
  selectedTokenSymbol: '',
  selectedChainId: '',
  selectedAccountId: null,
  fromWalletAddress: null,
  toWalletAddress: null,
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
