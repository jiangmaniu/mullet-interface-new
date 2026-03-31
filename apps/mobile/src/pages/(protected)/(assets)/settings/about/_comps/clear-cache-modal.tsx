import { Trans } from '@lingui/react/macro'
import { useCallback, useState } from 'react'
import { View } from 'react-native'

import { Button } from '@/components/ui/button'
import { IconifyTrash } from '@/components/ui/icons'
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Text } from '@/components/ui/text'

interface ClearCacheModalProps {
  visible: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ClearCacheModal({ visible, onClose, onConfirm }: ClearCacheModalProps) {
  const [confirmLoading, setConfirmLoading] = useState(false)

  const handleConfirm = useCallback(async () => {
    setConfirmLoading(true)
    try {
      await Promise.resolve(onConfirm?.())
    } finally {
      setConfirmLoading(false)
    }
  }, [onConfirm])

  return (
    <Modal visible={visible} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            <Trans>清除缓存</Trans>
          </ModalTitle>
        </ModalHeader>
        <View className="gap-medium px-2xl items-center">
          <IconifyTrash width={26} height={28} className="text-white" />
          <Text className="text-paragraph-p2 text-content-1 text-center">
            <Trans>确定要清除缓存吗？</Trans>
          </Text>
        </View>
        <ModalFooter>
          <Button variant="solid" size="lg" className="flex-1" onPress={onClose}>
            <Text>
              <Trans>取消</Trans>
            </Text>
          </Button>
          <Button
            variant="solid"
            color="primary"
            size="lg"
            className="flex-1"
            onPress={handleConfirm}
            loading={confirmLoading}
          >
            <Text>
              <Trans>确定</Trans>
            </Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
