import { useMutation } from '@tanstack/react-query'

import { depositRequest } from '@/v1/utils/deposit-request'

interface ConfirmOtpResponse {
  verifyCode: string
  expiresIn: number
  message: string
}

interface ConfirmOtpParams {
  otpId: string
  code: string
}

/**
 * 验证 OTP 码
 */
export function useConfirmOtp() {
  return useMutation({
    mutationFn: async ({ otpId, code }: ConfirmOtpParams) => {
      const response = await depositRequest<ConfirmOtpResponse>('/api/verify/confirm-otp', {
        method: 'POST',
        data: {
          otpId,
          code,
        },
      })
      return response.data
    },
  })
}
