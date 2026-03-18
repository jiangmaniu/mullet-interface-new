import { Trans } from '@lingui/react/macro'
import { ScrollView, View } from 'react-native'

import { Button } from '@/components/ui/button'
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Text } from '@/components/ui/text'

import { IconifyDownloadCircle } from '../ui/icons'

interface UpgradeModalProps {
  visible: boolean
  onClose?: () => void
  onConfirm: () => void
  isForceUpdate?: boolean
  latestVersion?: string
  updateContent?: string | null
}

export function UpgradeModal({
  visible,
  onClose,
  onConfirm,
  isForceUpdate = false,
  updateContent,
  latestVersion,
}: UpgradeModalProps) {
  return (
    <Modal visible={visible} onClose={onClose} closeOnBackdropPress={false}>
      <ModalContent className="w-[300px]">
        <ModalHeader showClose={!isForceUpdate}>
          <ModalTitle>
            <Trans>更新版本</Trans>
          </ModalTitle>
        </ModalHeader>

        {/* 更新内容区域 */}
        <View className="px-2xl gap-3xl">
          <View className="gap-medium items-center justify-center">
            <IconifyDownloadCircle width={32} height={32} className="text-content-1" />
            <Text className="text-paragraph-p2 text-content-1 text-center">
              {<Trans>发现新版本 v{latestVersion}</Trans>}
            </Text>
          </View>

          {/* 更新日志 */}
          {updateContent && (
            <View className="gap-medium">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>更新内容</Trans>
              </Text>
              <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator={false}>
                <View className="gap-xs">
                  {updateContent.split('\n').map((line, i) => (
                    <View key={i} className="flex-row">
                      <Text className="text-paragraph-p3 text-content-2">
                        {i + 1}. {line.replace(/^(\d+\.|•)\s*/, '')}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        <ModalFooter>
          {!isForceUpdate && (
            <Button variant="solid" color="default" size="lg" className="flex-1" onPress={onClose}>
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>稍后再说</Trans>
              </Text>
            </Button>
          )}

          {/* 按钮 */}
          <Button variant="solid" color="primary" size="lg" className="flex-1" onPress={onConfirm}>
            <Text className="text-paragraph-p2 font-medium">
              <Trans>立即更新</Trans>
            </Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
