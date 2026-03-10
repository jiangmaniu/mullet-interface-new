import { Trans } from '@lingui/react/macro'
import * as React from 'react'
import { Pressable, View } from 'react-native'

import { Button } from '@/components/ui/button'
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

const TooltipContext = React.createContext<{
  visible: boolean
  setVisible: (v: boolean) => void
  title?: React.ReactNode
}>({ visible: false, setVisible: () => {} })

function Tooltip({ children, title }: { children: React.ReactNode; title?: React.ReactNode }) {
  const [visible, setVisible] = React.useState(false)
  return <TooltipContext.Provider value={{ visible, setVisible, title }}>{children}</TooltipContext.Provider>
}
Tooltip.displayName = 'Tooltip'

function TooltipTrigger({
  children,
  className,
  hasUnderline = true,
  ...props
}: { children: React.ReactNode; className?: string; hasUnderline?: boolean } & React.ComponentProps<typeof Text>) {
  const { setVisible } = React.useContext(TooltipContext)

  // 阻止事件冒泡，避免触发外层的 Pressable
  const handlePress = (e: any) => {
    e?.stopPropagation?.()
    setVisible(true)
  }

  return (
    <Pressable onPress={handlePress}>
      <Text
        className={cn('text-paragraph-p3 text-content-4', hasUnderline && 'underline decoration-dotted', className)}
        {...props}
      >
        {children}
      </Text>
    </Pressable>
  )
}
TooltipTrigger.displayName = 'TooltipTrigger'

function TooltipContent({ children, className }: { children?: React.ReactNode; className?: string }) {
  const { visible, setVisible, title } = React.useContext(TooltipContext)
  return (
    <Modal visible={visible} onClose={() => setVisible(false)}>
      <ModalContent className={cn(className)}>
        {title && (
          <ModalHeader showClose={false}>
            <ModalTitle>{title}</ModalTitle>
          </ModalHeader>
        )}

        <View className={cn('px-2xl', !title && 'pt-2xl')}>
          <Text className="text-content-4 text-paragraph-p3 text-center">{children}</Text>
        </View>

        <ModalFooter>
          <Button block size="sm" color="primary" onPress={() => setVisible(false)}>
            <Text>
              <Trans>好的</Trans>
            </Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
TooltipContent.displayName = 'TooltipContent'

export { Tooltip, TooltipTrigger, TooltipContent }
