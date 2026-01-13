import { useStores } from '@/context/mobxProvider'
import useAccountChange from './useAccountChange'
import usePrivyInfo from './usePrivyInfo'
import useTransfer from './useSoLTransfer'

// 监听邮箱方式登录的情况下 privy 嵌入钱包地址余额变化，转账到PDA账户地址上
export default function usePrivyEmbeddedWalletChangeTransferToPdaAddr() {
  const { activeSolanaWallet, address } = usePrivyInfo()
  const { onTransfer } = useTransfer()
  const { trade } = useStores()
  const pdaTokenAddress = trade.currentAccountInfo?.pdaTokenAddress

  // 检查是否是嵌入式 Privy 钱包
  // 如果没有 standardWallet，说明是 Privy 嵌入式钱包
  // 如果有 standardWallet（Phantom, OKX 等），说明是外部钱包
  const isEmbeddedWallet = !activeSolanaWallet || !(activeSolanaWallet as any).standardWallet

  // 监听嵌入钱包余额变化，转账到PDA账户地址上
  useAccountChange({
    address,
    onUpdateCallback: (updatedAccountInfo) => {
      if (updatedAccountInfo.balance > 0 && isEmbeddedWallet && pdaTokenAddress) {
        console.log('监听嵌入钱包余额变化，转账到PDA账户地址上')
        onTransfer({
          toAddress: pdaTokenAddress,
          amount: updatedAccountInfo.balance
        })
      }
    }
  })

  return {}
}
