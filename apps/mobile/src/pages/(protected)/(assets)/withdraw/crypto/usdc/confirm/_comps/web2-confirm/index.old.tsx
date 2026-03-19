import { Trans } from '@lingui/react/macro'
import { router } from 'expo-router'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'

/**
 * Web2 邮箱验证确认按钮
 * 跳转到邮箱验证页面
 */
export function Web2Confirm() {
  const handleConfirm = () => {
    router.push('/(assets)/withdraw/crypto/verify')
  }

  return (
    <Button block size="lg" color="primary" onPress={handleConfirm}>
      <Text>
        <Trans>确定</Trans>
      </Text>
    </Button>
  )
}
