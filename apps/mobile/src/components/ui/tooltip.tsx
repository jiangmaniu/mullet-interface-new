import { Button } from '@/components/ui/button';
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Trans } from '@lingui/react/macro';
import * as React from 'react';
import { Pressable, View } from 'react-native';

const TooltipContext = React.createContext<{
  visible: boolean;
  setVisible: (v: boolean) => void;
  title?: React.ReactNode;
}>({ visible: false, setVisible: () => { } });

function Tooltip({ children, title }: { children: React.ReactNode; title?: React.ReactNode }) {
  const [visible, setVisible] = React.useState(false);
  return (
    <TooltipContext.Provider value={{ visible, setVisible, title }}>
      {children}
    </TooltipContext.Provider>
  );
}

function TooltipTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { setVisible } = React.useContext(TooltipContext);
  return (
    <Pressable onPress={() => setVisible(true)}>
      <Text
        className={cn('text-paragraph-p3 text-content-4 underline decoration-dotted', className)}
      >
        {children}
      </Text>
    </Pressable>
  );
}

function TooltipContent({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { visible, setVisible, title } = React.useContext(TooltipContext);
  return (
    <Modal visible={visible} onClose={() => setVisible(false)}>
      <ModalContent className={cn(className)}>
        {title && (
          <ModalHeader showClose={false}>
            <ModalTitle>{title}</ModalTitle>
          </ModalHeader>
        )}

        <View className="px-2xl">
          <Text className="text-content-4 text-paragraph-p3">{children}</Text>
        </View>

        <ModalFooter>
          <Button block size="sm" color="primary" onPress={() => setVisible(false)}>
            <Text><Trans>好的</Trans></Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent };
