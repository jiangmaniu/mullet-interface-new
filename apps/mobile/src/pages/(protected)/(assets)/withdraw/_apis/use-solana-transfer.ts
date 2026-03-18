import { useMutation } from '@tanstack/react-query'

import { depositRequest } from '@/v1/utils/deposit-request'

interface SolanaTransferResponse {
  success: boolean
  txHash: string
  explorerUrl: string
}

interface SolanaTransferBaseParams {
  tradeAccountId: string
  toAddress: string
  token: string
  amount: string
}

type SolanaTransferParams = SolanaTransferBaseParams &
  (
    | { verifyCode: string; walletSignature?: never; withdrawMessage?: never }
    | { verifyCode?: never; walletSignature: string; withdrawMessage: string }
  )

/**
 * Solana 链上转账
 */
export function useSolanaWithdraw() {
  return useMutation({
    mutationFn: async ({
      tradeAccountId,
      toAddress,
      token,
      amount,
      verifyCode,
      walletSignature,
      withdrawMessage,
    }: SolanaTransferParams) => {
      const data = {
        tradeAccountId,
        toAddress,
        token,
        amount,
        ...(withdrawMessage ? { withdrawMessage } : {}),
        ...(verifyCode ? { verifyCode } : {}),
        ...(walletSignature ? { walletSignature } : {}),
      }

      const response = await depositRequest<SolanaTransferResponse>('/api/solana-wallet/transfer', {
        method: 'POST',
        data,
      })
      return response.data
    },
  })
}
