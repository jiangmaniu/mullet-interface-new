'use client'

import { error } from 'console'
import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'

import { Button } from '@mullet/ui/button'

import { useWalletAuthState } from '../../hooks/use-wallet-auth-state'
import { useWalletLogin } from '../../hooks/use-wallet-login'

export const WalletConnect = observer(() => {
  const {
    connectAndlogin,
    loginAccountMutationResult: { isPending, error },
  } = useWalletLogin()

  const { isAuthenticated } = useWalletAuthState()
  if (isAuthenticated) {
    return null
  }

  return (
    <div>
      {/* loading: {String(isPending)} */}
      <Button block size={'lg'} color={'primary'} variant={'primary'} loading={isPending} onClick={connectAndlogin}>
        {!isAuthenticated ? (
          <Trans>连接钱包</Trans>
        ) : isPending ? (
          <Trans>正在登录</Trans>
        ) : !!error ? (
          <Trans>重新登录</Trans>
        ) : (
          <Trans>已登录</Trans>
        )}
      </Button>
    </div>
  )
})
