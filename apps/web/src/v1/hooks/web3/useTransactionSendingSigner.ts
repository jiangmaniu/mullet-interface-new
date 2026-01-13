import { ConnectedStandardSolanaWallet, useStandardSignAndSendTransaction } from '@privy-io/react-auth/solana'
import { address, Address, SignatureBytes, TransactionSendingSigner } from '@solana/kit'
import { useCallback, useMemo } from 'react'

export function useTransactionSendingSignerAction() {
  const { signAndSendTransaction } = useStandardSignAndSendTransaction()

  const transactionSendingSignerAction = useCallback((wallet: ConnectedStandardSolanaWallet): TransactionSendingSigner => {
    return {
      address: address(wallet.address),
      signAndSendTransactions: async (transactions) => {
        const signatures: SignatureBytes[] = []
        for (const tx of transactions) {
          const result = await signAndSendTransaction({
            transaction: new Uint8Array(tx.messageBytes),
            wallet: wallet
          })
          signatures.push(result.signature as SignatureBytes)
        }
        return signatures
      }
    }
  }, [])

  return {
    transactionSendingSignerAction
  }
}

export function useTransactionSendingSigner(wallet?: ConnectedStandardSolanaWallet) {
  const { transactionSendingSignerAction } = useTransactionSendingSignerAction()
  const transactionSendingSigner = useMemo<TransactionSendingSigner | undefined>(() => {
    if (!wallet) {
      return
    }

    return transactionSendingSignerAction(wallet)
  }, [wallet])

  return {
    transactionSendingSigner
  }
}
