import React from 'react'
import { View } from 'react-native'
import { Toaster, toast as sonnerToast } from 'sonner-native'
import { Text } from './text'
import { IconSuccess } from './icons/set/success'
import { IconRemind } from './icons/set/remind'
import { cn } from '@/lib/utils'

export { Toaster }

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastConfig {
  type?: ToastType
  message: React.ReactNode
  duration?: number
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
  const { type, message, duration, icon } = config
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
    { duration: duration ?? 2000 },
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
    success: (message: React.ReactNode, duration?: number) =>
      renderToast({ type: 'success', message, duration }),
    warning: (message: React.ReactNode, duration?: number) =>
      renderToast({ type: 'warning', message, duration }),
    error: (message: React.ReactNode, duration?: number) =>
      renderToast({ type: 'error', message, duration }),
    info: (message: React.ReactNode, duration?: number) =>
      renderToast({ type: 'info', message, duration }),
    dismiss: sonnerToast.dismiss,
  },
)
