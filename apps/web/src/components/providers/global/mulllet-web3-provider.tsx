import { useWallets } from '@privy-io/react-auth/solana'
import { PropsWithChildren, useCallback } from 'react'

import { ChainId, getChainConfig } from '@mullet/web3/config'
import { MulletWeb3Provider as NextMulletWeb3Provider } from '@mullet/web3/provider'
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'

export function MulletWeb3Provider({ children }: PropsWithChildren) {
  const { wallets } = useWallets()
  const activeWallet = wallets[0]

  const getWalletAdapter = useCallback(() => {
    if (!activeWallet) return
    const walletAdapter = {
      publicKey: new PublicKey(activeWallet.address),

      signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
        if (tx instanceof VersionedTransaction) {
          // v16 或其他 versioned transaction
          const txBytes = tx.serialize()
          const signedOutput = await activeWallet.signTransaction({ transaction: txBytes })
          const signedTxBytes: Uint8Array = signedOutput.signedTransaction
          return VersionedTransaction.deserialize(signedTxBytes) as T
        } else if (tx instanceof Transaction) {
          // legacy transaction
          // 注意：Privy 是否支持直接签 legacy Transaction，需要确认
          const txBytes = tx.serialize({ requireAllSignatures: false, verifySignatures: false })
          const signedOutput = await activeWallet.signTransaction({ transaction: txBytes })
          const signedTxBytes: Uint8Array = signedOutput.signedTransaction
          return Transaction.from(signedTxBytes) as T
        }
        throw new Error('Unsupported transaction type')
      },

      signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
        const signedTxs = await Promise.all(txs.map((tx) => walletAdapter.signTransaction(tx)))
        return signedTxs
      },
    }

    return walletAdapter
  }, [activeWallet])

  const walletAdapter = getWalletAdapter()

  const chainConfig = getChainConfig(ChainId.SOL_DEVNET)

  const config = {
    rpcUrls: chainConfig.rpcUrls.default.http,
    walletAdapter: walletAdapter,
  }

  return <NextMulletWeb3Provider config={config}>{children}</NextMulletWeb3Provider>
}
