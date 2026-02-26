import React from 'react'
import { View } from 'react-native'
import { Toaster, toast as sonnerToast } from 'sonner-native'
import { Text } from './text'
import { IconSuccess } from './icons/set/success'
import { IconRemind } from './icons/set/remind'
import { cn } from '@/lib/utils'

export { Toaster }

type ToastType = 'success' | 'error' | 'warning' | 'info'

type ExternalToast = Parameters<typeof sonnerToast.custom>[1];

interface ToastConfig {
  type?: ToastType
  message: React.ReactNode
  options?: ExternalToast
  icon?: React.ReactNode
}

const iconMap: Record<string, React.ReactNode> = {
  success: <IconSuccess width={24} height={24} />,
  warning: <IconRemind width={24} height={24} />,
}

const borderMap: Record<string, string> = {
  warning: 'border-status-warning',
}

function renderToast(config: ToastConfig) {
  const { type, message, options, icon } = config
  const toastIcon = icon ?? (type ? iconMap[type] : undefined)
  const borderClass = type
    ? (borderMap[type] ?? 'border-brand-default')
    : 'border-brand-default'

  return sonnerToast.custom(
    <View
      className={cn(
        'bg-secondary border self-center rounded-xl px-3 py-[6px] flex-row items-center gap-medium',
        borderClass,
      )}
    >
      {toastIcon}
      <Text className="text-paragraph-p2 text-content-1">
        {message}
      </Text>
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
export const toast = Object.assign(
  (config: ToastConfig) => renderToast(config),
  {
    success: (message: React.ReactNode, options?: ExternalToast) =>
      renderToast({ type: 'success', message, options }),
    warning: (message: React.ReactNode, options?: ExternalToast) =>
      renderToast({ type: 'warning', message, options }),
    error: (message: React.ReactNode, options?: ExternalToast) =>
      renderToast({ type: 'error', message, options }),
    info: (message: React.ReactNode, options?: ExternalToast) =>
      renderToast({ type: 'info', message, options }),
    dismiss: sonnerToast.dismiss,
  },
)
