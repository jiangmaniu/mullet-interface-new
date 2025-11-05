'use client'

import { Trans } from '@lingui/react/macro'

import { useWalletAuthState } from '@/hooks/wallet/use-wallet-auth-state'
import { useWalletLogin } from '@/hooks/wallet/use-wallet-login'
import { Button } from '@mullet/ui/button'

export const WalletConnect = () => {
  const walletLogin = useWalletLogin()
  const { isAuthenticated } = useWalletAuthState()

  if (isAuthenticated) {
    return null
  }

  return (
    <div>
      <Button onClick={walletLogin}>
        <Trans>连接钱包</Trans>
      </Button>
    </div>
  )
}
