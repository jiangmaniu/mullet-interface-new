import { useCallback } from 'react'
import type { Idl } from '@coral-xyz/anchor'
import { toast } from '@/components/ui/toast'
import { ParsedAnchorError, useAnchorErrorHandler } from './use-anchor-error-handler'
import { ParsedSignatureError, useSignatureErrorHandler } from './use-signature-error-handler.ts'

export type SolanaParsedError =
  | ParsedAnchorError
  | ParsedSignatureError
  | {
      type: 'UnknownError'
      message: string
      uiMessage: string
    }

export function useSolanaErrorHandler(idl: Idl) {
  const { handleAnchorError } = useAnchorErrorHandler(idl)
  const { handleSignatureError } = useSignatureErrorHandler()

  const handleSolanaError = useCallback(
    (err: any, { showToast = true }: { showToast?: boolean } = {}): SolanaParsedError => {
      let parsed: SolanaParsedError | null = null

      parsed = handleSignatureError(err)
      if (parsed && parsed.type !== 'UnknownSignatureError') {
        // toast 提示
        if (showToast) toast.error('签名错误', { description: parsed.uiMessage })
        return parsed
      }

      parsed = handleAnchorError(err)
      if (parsed) {
        if (showToast) toast.error('交易错误', { description: parsed.uiMessage })
        return parsed
      }

      // 兜底未知错误
      const unknownError: SolanaParsedError = {
        type: 'UnknownError',
        message: err?.message ?? 'Unknown error',
        uiMessage: '交易失败，请重试'
      }
      if (showToast) toast.error('交易错误', { description: unknownError.uiMessage })
      return unknownError
    },
    [handleAnchorError, handleSignatureError]
  )

  return { handleSolanaError }
}
