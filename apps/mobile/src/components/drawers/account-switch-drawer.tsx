import { Trans } from '@lingui/react/macro'
import { useState } from 'react'
import { View } from 'react-native'

import { Modal } from '@/components/ui/modal'
import { Spinning } from '@/components/ui/spinning'
import { Text } from '@/components/ui/text'

import { loading, LoadingContent } from '../ui/loading'
import { AccountSelectDrawer } from './account-select-drawer'

interface AccountSwitchDrawerProps {
  visible: boolean
  onClose: () => void
  selectedAccountId?: string
  onSwitch: (account: User.AccountItem) => Promise<void> | void
}

export function AccountSwitchDrawer({ visible, onClose, selectedAccountId, onSwitch }: AccountSwitchDrawerProps) {
  const handleSelect = async (account: User.AccountItem) => {
    loading.show({
      children: (
        <LoadingContent>
          <Trans>正在切换...</Trans>
        </LoadingContent>
      ),
    })
    try {
      await Promise.all([onSwitch(account)])
    } finally {
      loading.hide()
    }
  }

  return (
    <AccountSelectDrawer
      visible={visible}
      onClose={onClose}
      selectedAccountId={selectedAccountId}
      onSelect={handleSelect}
    />
  )
}
