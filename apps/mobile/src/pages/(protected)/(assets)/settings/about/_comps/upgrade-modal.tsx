import { View } from 'react-native'
import { Trans } from '@lingui/react/macro'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { IconifyDownloadCircle } from '@/components/ui/icons'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '@/components/ui/modal'

interface UpgradeModalProps {
  visible: boolean
  onClose: () => void
  onConfirm: () => void
}

export function UpgradeModal({
  visible,
  onClose,
  onConfirm,
}: UpgradeModalProps) {

  return (
    <Modal visible={visible} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle><Trans>更新版本</Trans></ModalTitle>
        </ModalHeader>
        <View className="items-center gap-medium px-2xl">
          <IconifyDownloadCircle width={32} height={32} className='text-white' />
          <Text className="text-paragraph-p2 text-content-1 text-center">
            <Trans>更新App，体验最新版本</Trans>
          </Text>
        </View>
        <ModalFooter>
          <Button variant="solid" size="lg" className="flex-1 px-0" onPress={onClose}>
            <Text><Trans>取消</Trans></Text>
          </Button>
          <Button variant="solid" color="primary" size="lg" className="flex-1 px-0" onPress={onConfirm}>
            <Text><Trans>确定更新</Trans></Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
