import { Trans } from '@lingui/react/macro'
import { View } from 'react-native'

import { Button } from '@/components/ui/button'
import { IconSpecialFail, IconSpecialSuccess } from '@/components/ui/icons'
import { Modal, ModalContent } from '@/components/ui/modal'
import { Text } from '@/components/ui/text'

interface WithdrawStatusModalProps {
  visible: boolean
  status: 'success' | 'failed'
  onClose: () => void
}

export function WithdrawStatusModal({ visible, status, onClose }: WithdrawStatusModalProps) {
  const isSuccess = status === 'success'

  return (
    <Modal visible={visible} onClose={onClose}>
      <ModalContent className="gap-xl py-4xl px-3xl items-center">
        {isSuccess ? (
          <IconSpecialSuccess width={48} height={48} className="text-status-success" />
        ) : (
          <IconSpecialFail width={48} height={48} className="text-status-danger" />
        )}

        <View className="gap-medium items-center">
          <Text className="text-paragraph-p1 text-content-1">
            {isSuccess ? <Trans>取现提交成功</Trans> : <Trans>取现提交失败</Trans>}
          </Text>
          <Text className="text-paragraph-p3 text-content-4 text-center">
            {isSuccess ? <Trans>等待链上交易确认</Trans> : <Trans>请稍后重试</Trans>}
          </Text>
        </View>

        <Button block size="lg" color="primary" onPress={onClose}>
          <Text>
            <Trans>确定</Trans>
          </Text>
        </Button>
      </ModalContent>
    </Modal>
  )
}
