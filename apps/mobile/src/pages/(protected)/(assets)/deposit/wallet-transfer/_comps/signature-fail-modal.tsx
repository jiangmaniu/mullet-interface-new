import { Trans } from '@lingui/react/macro'
import React from 'react'
import { View } from 'react-native'

import { Button } from '@/components/ui/button'
import { IconSpecialFail } from '@/components/ui/icons/set/special/fail'
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Text } from '@/components/ui/text'

export interface SignatureFailModalProps {
  visible: boolean
  onClose: () => void
  onRetry: () => void
  showRetryButton?: boolean // 是否显示重新签名按钮，默认 true
  loading?: boolean // 重新签名按钮 loading 状态
}

export function SignatureFailModal({
  visible,
  onClose,
  onRetry,
  showRetryButton = true,
  loading = false,
}: SignatureFailModalProps) {
  return (
    <Modal visible={visible} onClose={onClose} closeOnBackdropPress={false}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            <Trans>状态</Trans>
          </ModalTitle>
        </ModalHeader>

        <View className="px-2xl gap-large w-full items-center">
          <IconSpecialFail width={50} height={50} />
          <Text className="text-paragraph-p2 text-content-1 text-center">
            <Trans>交易签名失败</Trans>
          </Text>
          <Text className="text-paragraph-p3 text-status-warning text-center">
            <Trans>手动取消/其它未知错误导致钱包签名失败</Trans>
          </Text>
        </View>

        <ModalFooter>
          {showRetryButton ? (
            <Button color="primary" size="lg" block onPress={onRetry} disabled={loading} loading={loading}>
              <Text className="text-button-2 text-content-foreground">
                {loading ? <Trans>等待签名</Trans> : <Trans>重新签名</Trans>}
              </Text>
            </Button>
          ) : (
            <Button color="primary" size="lg" block onPress={onClose}>
              <Text className="text-button-2 text-content-foreground">
                <Trans>确定</Trans>
              </Text>
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
