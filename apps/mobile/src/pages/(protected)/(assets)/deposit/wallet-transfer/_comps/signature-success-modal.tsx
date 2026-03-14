import { Trans } from '@lingui/react/macro'
import React from 'react'
import { View } from 'react-native'

import { AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { IconSuccess } from '@/components/ui/icons/set/success'
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Text } from '@/components/ui/text'
import { getImgSource } from '@/utils/img'
import { BNumber } from '@mullet/utils/number'

import { DepositTokenInfo } from '../../_apis/use-supported-tokens'
import { WithdrawTokenInfo } from '../../../withdraw/_apis/use-supported-tokens'

export interface SignatureSuccessModalProps {
  visible: boolean
  onClose: () => void
  /** 点击确认按钮回调 */
  onConfirm?: () => void
  /** 确认按钮文案，默认"确定" */
  confirmText?: React.ReactNode
  depositAmount?: string
  receiveAmount?: string
  receiveTokenConfig?: DepositTokenInfo | WithdrawTokenInfo
  sendTokenConfig?: DepositTokenInfo | WithdrawTokenInfo
}

export function SignatureSuccessModal({
  visible,
  onClose,
  onConfirm,
  confirmText,
  depositAmount,
  receiveAmount,
  sendTokenConfig,
  receiveTokenConfig,
}: SignatureSuccessModalProps) {
  return (
    <Modal visible={visible} onClose={onClose} closeOnBackdropPress={false}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            <Trans>状态</Trans>
          </ModalTitle>
        </ModalHeader>

        <View className="px-2xl gap-3xl">
          <View className="gap-medium w-full items-center">
            <IconSuccess width={50} height={50} />
            <Text className="text-paragraph-p2 text-content-1 text-center">
              <Trans>签名成功，等待链上确认交易</Trans>
            </Text>
          </View>

          <View className="gap-medium w-full">
            <View className="w-full flex-row items-center justify-between">
              <Text className="text-paragraph-p2 text-content-4">
                <Trans>您发送</Trans>
              </Text>
              <View className="gap-medium flex-row items-center">
                <AvatarImage source={getImgSource(sendTokenConfig?.iconUrl)} className={'size-6 rounded-full'} />
                <Text className="text-paragraph-p2 text-content-1">
                  {BNumber.toFormatNumber(depositAmount, {
                    unit: sendTokenConfig?.symbol,
                    volScale: sendTokenConfig?.displayDecimals,
                  })}
                </Text>
              </View>
            </View>

            <View className="w-full flex-row items-center justify-between">
              <Text className="text-paragraph-p2 text-content-4">
                <Trans>您收到</Trans>
              </Text>
              <View className="gap-medium flex-row items-center">
                <AvatarImage source={getImgSource(receiveTokenConfig?.iconUrl)} className={'size-6 rounded-full'} />
                <Text className="text-paragraph-p2 text-content-1">
                  {BNumber.toFormatNumber(receiveAmount, {
                    unit: receiveTokenConfig?.symbol,
                    volScale: receiveTokenConfig?.displayDecimals,
                  })}
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-paragraph-p3 text-content-5">
            <Trans>此次签名仅作为当前交易请求，签名完成交易后此次签名失效，请您仔细核对签名信息</Trans>
          </Text>
        </View>

        <ModalFooter>
          <Button color="primary" size="lg" block onPress={onConfirm ?? onClose}>
            <Text className="text-button-2 text-content-foreground">{confirmText ?? <Trans>确定</Trans>}</Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
