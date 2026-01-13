import { useCallback, useMemo } from 'react'
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import useConnection from './useConnection'
import lpSwapIdl from '@/libs/web3/idl/mxlp_swap.json'

import { MxlpSwap } from '@/libs/web3/types/mxlp_swap'
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import type { Idl, Wallet } from '@coral-xyz/anchor'
import { useStandardWallets, useSignTransaction } from '@privy-io/react-auth/solana'

export type LpSwapProgram = Program<MxlpSwap>

export function useAnchorProgram<T extends Idl>(idl: any, connection?: Connection) {
  const { connection: connectionFallback } = useConnection()
  const activeConnection = connection ?? connectionFallback
  const wallets = useStandardWallets()
  const activeWallet = wallets.wallets[0]
  const { signTransaction: signTransactionPrivy } = useSignTransaction()

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
      }
    }

    return walletAdapter
  }, [activeWallet, signTransactionPrivy])

  const program = useMemo(() => {
    const program = new Program<T>(idl, {
      connection: activeConnection
    })
    return program
  }, [activeConnection])

  const getSignProgram = useCallback(() => {
    const walletAdapter = getWalletAdapter()
    if (!walletAdapter) {
      throw new Error('No wallet found')
    }

    const provider = new AnchorProvider(activeConnection, walletAdapter, {})

    const program = new Program<T>(idl, provider)
    return program
  }, [activeConnection, getWalletAdapter, idl])

  return { getSignProgram, program }
}

export function useLpSwapProgram(connection?: Connection) {
  return useAnchorProgram<MxlpSwap>(lpSwapIdl, connection)
}
