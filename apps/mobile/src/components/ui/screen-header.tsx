import { NavArrowLeft } from 'iconoir-react-native'
import React from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { IconButton } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { Text } from './text'

export interface ScreenHeaderProps {
  content?: string | React.ReactNode
  left?: React.ReactNode
  right?: React.ReactNode
  showBackButton?: boolean
  onBack?: () => void
  className?: string
  center?: boolean
}

export function ScreenHeader({
  content,
  left,
  right,
  showBackButton = true,
  onBack,
  center,
  className,
}: ScreenHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (router.canGoBack()) {
      router.back()
    } else {
      router.dismissAll()
    }
  }

  const renderLeft = () => {
    if (left) return left
    if (showBackButton && router.canGoBack()) {
      return (
        <IconButton variant="icon" className="-ml-2 h-10 w-10 rounded-full" onPress={handleBack}>
          <NavArrowLeft width={24} height={24} className="text-foreground" />
        </IconButton>
      )
    }
    return null
  }

  const hasLeft = !!left || (showBackButton && router.canGoBack())

  return (
    <SafeAreaView edges={['top']}>
      <View className={cn('px-xl relative h-[44px] flex-row items-center justify-between py-1.5', className)}>
        <View className="z-10 items-start justify-center">{renderLeft()}</View>

        {content && (
          <View
            className={cn(
              'px-xl pointer-events-none absolute top-0 right-0 bottom-0 left-0 justify-center',
              (hasLeft || center) && 'items-center',
            )}
          >
            <Text className={cn('text-content-1 text-important-1')}>{content}</Text>
          </View>
        )}

        <View className="z-10 items-end justify-center">{right}</View>
      </View>
    </SafeAreaView>
  )
}
