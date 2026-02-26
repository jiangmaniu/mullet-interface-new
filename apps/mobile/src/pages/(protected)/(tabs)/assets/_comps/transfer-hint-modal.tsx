import { Button } from '@/components/ui/button';
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalRef,
  ModalTitle,
} from '@/components/ui/modal';
import { IconRemind } from '@/components/ui/icons';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';
import { Trans } from '@lingui/react/macro';
import { useToggle } from 'ahooks';
import { useImperativeHandle } from 'react';

interface TransferHintModalProps {
  onCreateAccount: () => void;
  ref: React.RefObject<ModalRef | null>;
}

/**
 * 资金划转提示模态框 (Transfer Hint Modal)
 *
 * 当用户尝试划转资金但账户不足两个时显示。
 */
export function TransferHintModal({
  onCreateAccount,
  ref
}: TransferHintModalProps) {
  const [open, { toggle, setRight: setOpen, setLeft: setClose }] = useToggle(false)

  useImperativeHandle(ref, () => ({
    open: setOpen,
    close: setClose,
    toggle: toggle,
  }))

  return (
    <Modal
      transparent
      visible={open}
      onClose={setClose}
      animationType="fade"
    >
      <ModalContent>
        <ModalHeader>
          <ModalTitle><Trans>划转</Trans></ModalTitle>
        </ModalHeader>
        {/* Header Section */}

        {/* Content Section */}
        <View className="gap-medium items-center">
          <IconRemind width={32} height={32} />
          {/* Text */}
          <Text className="text-content-1 text-paragraph-p2">
            <Trans>创建多个账户后可进行资金划转</Trans>
          </Text>
        </View>

        {/* Footer Buttons */}
        <ModalFooter>
          <Button
            className="flex-1"
            variant="outline"
            size="lg"
            onPress={setClose}
          >
            <Text><Trans>取消</Trans></Text>
          </Button>
          <Button
            className="flex-1"
            variant="solid"
            color="primary"
            size="lg"
            onPress={onCreateAccount}
          >
            <Text><Trans>创建账户</Trans></Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default TransferHintModal;
