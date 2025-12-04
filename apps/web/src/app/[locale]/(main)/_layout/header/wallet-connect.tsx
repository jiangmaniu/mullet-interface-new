'use client'

import { Trans } from '@lingui/react/macro'

import { useWalletAuthState } from '@/hooks/wallet/use-wallet-auth-state'
import { useWalletLogin } from '@/hooks/wallet/use-wallet-login'
import { Button } from '@mullet/ui/button'

export const WalletConnect = () => {
  const {
    connectAndlogin,
    loginAccountMutationResult: { isPending },
  } = useWalletLogin()

  const { isAuthenticated } = useWalletAuthState()
  if (isAuthenticated) {
    return null
  }

  return (
    <div>
      loading: {String(isPending)}
      <Button block size={'lg'} color={'primary'} variant={'primary'} loading={isPending} onClick={connectAndlogin}>
        {!isAuthenticated ? <Trans>连接钱包</Trans> : isPending ? <Trans>正在登录</Trans> : '已登录'}
      </Button>
    </div>
  )
}
