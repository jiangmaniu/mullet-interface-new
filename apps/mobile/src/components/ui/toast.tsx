import React from 'react'
import { View } from 'react-native'
import { toast as sonnerToast, Toaster } from 'sonner-native'

import { cn } from '@/lib/utils'

import { AnnouncementToast } from './announcement-toast'
import { IconSpecialFail } from './icons'
import { IconRemind } from './icons/set/remind'
import { IconSuccess } from './icons/set/success'
import { Text } from './text'

export { Toaster }

type ToastType = 'success' | 'error' | 'warning' | 'info'

type ExternalToast = Parameters<typeof sonnerToast.custom>[1]

interface ToastConfig {
  type?: ToastType
  message: React.ReactNode
  options?: ExternalToast
  icon?: React.ReactNode
}

const iconMap: Record<string, React.ReactNode> = {
  success: <IconSuccess width={24} height={24} />,
  warning: <IconRemind width={24} height={24} />,
  error: <IconSpecialFail width={24} height={24} />,
}

const borderMap: Record<string, string> = {
  warning: 'border-status-warning',
  success: 'border-status-success',
  error: 'border-status-danger',
}

function renderToast(config: ToastConfig) {
  const { type, message, options, icon } = config
  const toastIcon = icon ?? (type ? iconMap[type] : undefined)
  const borderClass = type ? (borderMap[type] ?? 'border-brand-default') : 'border-brand-default'

  return sonnerToast.custom(
    <View
      className={cn(
        'bg-secondary gap-medium flex-row items-center self-center rounded-xl border px-3 py-[6px]',
        borderClass,
      )}
      style={{ maxWidth: '80%' }}
    >
      {toastIcon}
      <Text className="text-paragraph-p2 text-content-1 flex-shrink">{message}</Text>
    </View>,
    { ...options, duration: options?.duration ?? 2000 },
  )
}

// toast({ type: 'success', message: '...' })
// toast.success('...')
// toast.warning('...')
// toast.error('...')
// toast.info('...')
// toast.dismiss(id)
export const toast = Object.assign((config: ToastConfig) => renderToast(config), {
  success: (message: React.ReactNode, options?: ExternalToast) => renderToast({ type: 'success', message, options }),
  warning: (message: React.ReactNode, options?: ExternalToast) => renderToast({ type: 'warning', message, options }),
  error: (message: React.ReactNode, options?: ExternalToast) => renderToast({ type: 'error', message, options }),
  info: (message: React.ReactNode, options?: ExternalToast) => renderToast({ type: 'info', message, options }),
  // 公告通知，支持滑动关闭和点击跳转通知列表
  announcement: (params: { id: number; title: string; content: string }, options?: ExternalToast) => {
    let resolvedId: string | number = ''
    const toastId = sonnerToast.custom(
      <AnnouncementToast title={params.title} content={params.content} toastId={resolvedId} />,
      { ...options, duration: options?.duration ?? 5000, position: 'top-center' },
    )
    resolvedId = toastId
    return toastId
  },
  dismiss: sonnerToast.dismiss,
})
