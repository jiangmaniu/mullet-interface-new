import React, { useEffect, useState } from 'react'
import { Wallet } from '@coral-xyz/anchor'
import { Connection, PublicKey, VersionedTransaction, TransactionMessage, Transaction } from '@solana/web3.js'
import { useStandardWallets, useSignTransaction } from '@privy-io/react-auth/solana'
import { useUserConnectedWallet } from './use-wallet-user'

type AnchorCompatibleWallet = {
  publicKey: PublicKey
  signTransaction(tx: Transaction | VersionedTransaction): Promise<Transaction | VersionedTransaction>
  signAllTransactions?(txs: Array<Transaction | VersionedTransaction>): Promise<Array<Transaction | VersionedTransaction>>
}

export function usePrivyAnchorWallet(): Wallet | null {
  const { wallets } = useStandardWallets()
  const { signTransaction: privySignTransaction } = useSignTransaction()
  const [walletAdapter, setWalletAdapter] = useState<AnchorCompatibleWallet | null>(null)

  useEffect(() => {
    if (wallets.length === 0) return

    const selectedWallet = wallets[0] // 你可以用更健壮的逻辑选 wallet

    if (!selectedWallet.address) return

    // 构造 Anchor 钱包 Adapter
    const walletAdapter: AnchorCompatibleWallet = {
      publicKey: new PublicKey(selectedWallet.address),
      signTransaction: async (tx: Transaction) => {
        // 将 tx 序列化或编码成 Privy 接收的格式（Uint8Array）
        const raw = tx.serializeMessage()
        // 用 Privy 的 signTransaction （或通过 features）签名
        const { signedTransaction } = await selectedWallet!.signTransaction({
          transaction: raw
        })
        // 将签名后字节数组反序列化 /注入到 tx.signature
        // 注意：Transaction 里可能需要还原签名并返回一个带签名的 Transaction 实例
        const txWithSig = Transaction.from(signedTransaction)
        return txWithSig
      },
      signAllTransactions: async (txs: Transaction[]) => {
        const signedTxs = await Promise.all(txs.map((tx) => walletAdapter.signTransaction(tx)))
        return signedTxs
      }
    }

    setWalletAdapter(walletAdapter)
  }, [wallets, privySignTransaction])

  return walletAdapter as Wallet
}
