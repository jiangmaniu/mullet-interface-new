import { useMutation } from '@tanstack/react-query'

import { depositRequest } from '@/utils/deposit-request'

interface SendOtpResponse {
  otpId: string
  expiresIn: number
  message: string
  code?: string // 仅 development 模式返回
}

interface SendOtpParams {
  userId: string
  email?: string
}

/**
 * 发送 OTP 验证码
 */
export function useSendOtp() {
  return useMutation({
    mutationFn: async ({ userId, email }: SendOtpParams) => {
      const response = await depositRequest<SendOtpResponse>('/api/verify/send-otp', {
        method: 'POST',
        data: {
          userId,
          purpose: 'withdrawal',
          email,
        },
      })
      return response.data
    },
  })
}
