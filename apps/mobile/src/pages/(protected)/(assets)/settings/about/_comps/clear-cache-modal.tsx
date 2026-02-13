import { View } from 'react-native'
import { Trans } from '@lingui/react/macro'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { IconifyTrash } from '@/components/ui/icons'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '@/components/ui/modal'

interface ClearCacheModalProps {
  visible: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ClearCacheModal({
  visible,
  onClose,
  onConfirm,
}: ClearCacheModalProps) {
  return (
    <Modal visible={visible} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle><Trans>清除缓存</Trans></ModalTitle>
        </ModalHeader>
        <View className="items-center gap-medium px-2xl">
          <IconifyTrash width={26} height={28} className="text-white" />
          <Text className="text-paragraph-p2 text-content-1 text-center">
            <Trans>确定要清除缓存吗？</Trans>
          </Text>
        </View>
        <ModalFooter>
          <Button variant="solid" size="lg" className="flex-1" onPress={onClose}>
            <Text><Trans>取消</Trans></Text>
          </Button>
          <Button variant="solid" color="primary" size="lg" className="flex-1" onPress={onConfirm}>
            <Text><Trans>确定</Trans></Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
