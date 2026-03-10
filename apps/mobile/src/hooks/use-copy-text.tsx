import { useCallback } from 'react'
import * as Clipboard from 'expo-clipboard'
import { t } from '@lingui/core/macro'
import { toast } from '@/components/ui/toast'

interface UseCopyTextOptions {
  /** 复制成功后的提示信息 */
  successMessage?: string
  /** 复制失败后的提示信息 */
  errorMessage?: string
  /** 复制成功后的回调 */
  onSuccess?: () => void
  /** 复制失败后的回调 */
  onError?: (error: Error) => void
}

/**
 * 复制文本到剪贴板的 Hook
 * @param options 配置选项
 * @returns 复制函数
 */
export function useCopyText(options?: UseCopyTextOptions) {
  const { successMessage, errorMessage, onSuccess, onError } = options || {}

  const copyText = useCallback(
    async (text: string) => {
      if (!text) {
        return
      }

      try {
        await Clipboard.setStringAsync(text)
        toast.success(successMessage || t`复制成功`)
        onSuccess?.()
      } catch (error) {
        toast.error(errorMessage || t`复制失败`)
        onError?.(error as Error)
      }
    },
    [successMessage, errorMessage, onSuccess, onError]
  )

  return copyText
}
