import { Trans } from '@lingui/react/macro'
import { View } from 'react-native'

import { Button } from '@/components/ui/button'
import { IconSpecialSuccess } from '@/components/ui/icons'
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Text } from '@/components/ui/text'
import { BNumber } from '@mullet/utils/number'
import { formatAddress } from '@mullet/utils/web3'

import { WithdrawTokenInfo } from '../../pages/(protected)/(assets)/withdraw/_apis/use-supported-tokens'

interface WithdrawSuccessModalProps {
  visible: boolean
  onClose: () => void
  address: string
  amount: string
  tokenConfig?: WithdrawTokenInfo
}

export function WithdrawSuccessModal({ visible, onClose, address, amount, tokenConfig }: WithdrawSuccessModalProps) {
  return (
    <Modal visible={visible} onClose={onClose} closeOnBackdropPress={false}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            <Trans>状态</Trans>
          </ModalTitle>
        </ModalHeader>

        <View className="gap-3xl px-2xl">
          {/* 图标和状态文本 */}
          <View className="gap-medium items-center">
            <IconSpecialSuccess width={50} height={50} className="text-status-success" />

            <View className="gap-xs w-full items-center">
              <Text className="text-paragraph-p2 text-content-1 text-center">
                <Trans>取现提交成功，等待链上交易确认</Trans>
              </Text>
            </View>
          </View>

          {/* 转账详情 */}

          <View className="gap-xs items-center justify-center">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>向{formatAddress(address)}转入</Trans>
            </Text>
            <Text className="text-paragraph-p2 text-content-1">
              {BNumber.toFormatNumber(amount, {
                unit: tokenConfig?.symbol,
                volScale: tokenConfig?.displayDecimals,
              })}
            </Text>
          </View>

          {/* 提示信息 */}
          <Text className="text-paragraph-p3 text-content-5 w-full">
            <Trans>等待链上交易确认后Mullet以站内消息通知您，请您注意关注站内消息</Trans>
          </Text>
        </View>

        <ModalFooter>
          {/* 确定按钮 */}
          <Button block size="lg" color="primary" onPress={onClose}>
            <Text>
              <Trans>确定</Trans>
            </Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
