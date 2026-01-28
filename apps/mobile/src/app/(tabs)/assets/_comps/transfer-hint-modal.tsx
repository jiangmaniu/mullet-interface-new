import { Button } from '@/components/ui/button';
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal';
import { IconifyWarningCircle, IconRemind } from '@/components/ui/icons';
import { Text } from '@/components/ui/text';
import { t } from '@lingui/macro';
import * as React from 'react';
import { View } from 'react-native';
import { Trans } from '@lingui/react/macro';

interface TransferHintModalProps {
  open: boolean;
  onClose: () => void;
  onCreateAccount: () => void;
}

/**
 * 资金划转提示模态框 (Transfer Hint Modal)
 *
 * 当用户尝试划转资金但账户不足两个时显示。
 */
export function TransferHintModal({
  open,
  onClose,
  onCreateAccount,
}: TransferHintModalProps) {
  return (
    <Modal
      transparent
      visible={open}
      onClose={onClose}
      animationType="fade"
    >
      <ModalHeader>
        <ModalTitle className="text-white text-xl font-bold">{t`划转`}</ModalTitle>
      </ModalHeader>

      <ModalContent>
        {/* Header Section */}

        {/* Content Section */}
        <View className="gap-medium items-center">
          <IconRemind width={32} height={32} />
          {/* Text */}
          <Text className="text-content-1 text-paragraph-p2">
            {t`创建多个账户后可进行资金划转`}
          </Text>
        </View>
      </ModalContent>

      {/* Footer Buttons */}
      <ModalFooter>
        <ModalFooter>
          <Button
            className="flex-1 "
            variant="secondary"
            size="lg"
            onPress={onClose}
          >
            <Text><Trans>取消</Trans></Text>
          </Button>
          <Button
            className="flex-1"
            variant="primary"
            color="primary"
            size="lg"
            onPress={onCreateAccount}
          >
            <Text><Trans>创建账户</Trans></Text>
          </Button>
        </ModalFooter>
      </ModalFooter>
    </Modal>
  );
}
