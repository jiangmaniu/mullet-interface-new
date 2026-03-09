import { useMutation } from '@tanstack/react-query'

import { depositRequest } from '@/v1/utils/deposit-request'

interface SolanaTransferResponse {
  transactionId: string
  status: 'pending' | 'completed' | 'failed'
  message: string
}

interface SolanaTransferBaseParams {
  tradeAccountId: string
  toAddress: string
  token: string
  amount: string
}

type SolanaTransferParams = SolanaTransferBaseParams &
  ({ verifyCode: string; walletSignature?: never } | { verifyCode?: never; walletSignature: string })

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
    }: SolanaTransferParams) => {
      const response = await depositRequest<SolanaTransferResponse>('/api/solana-wallet/transfer', {
        method: 'POST',
        data: {
          tradeAccountId,
          toAddress,
          token,
          amount,
          ...(verifyCode ? { verifyCode } : {}),
          ...(walletSignature ? { walletSignature } : {}),
        },
      })
      return response.data
    },
  })
}
