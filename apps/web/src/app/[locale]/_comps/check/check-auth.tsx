'use client'

import { Trans } from '@lingui/react/macro'
import { useEffect, useRef } from 'react'
import router from 'next/router'

import { PageLoading } from '@/components/loading/page-loading'
import { useWalletAuthState } from '@/hooks/wallet/use-wallet-auth-state'
import { useWalletLogin } from '@/hooks/wallet/use-wallet-login'
import { Button } from '@mullet/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@mullet/ui/empty'
import { Iconify } from '@mullet/ui/icons'

import { WalletConnect } from '../../(main)/_layout/header/wallet-connect'

export const CheckLoginAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLogin } = useWalletAuthState()
  const { accountLogin } = useWalletLogin()

  const initIsNotLogin = useRef(isAuthenticated && !isLogin)
  const isLoggingInRef = useRef(false)

  useEffect(() => {
    if (initIsNotLogin.current) {
      if (isLoggingInRef.current) {
        return
      }

      isLoggingInRef.current = true
      accountLogin().finally(() => {
        isLoggingInRef.current = false
      })
    }
  }, [])

  if (!isAuthenticated) {
    return (
      <Empty className="h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Iconify icon={'iconoir:wallet'} className="size-6" />
          </EmptyMedia>
          <EmptyTitle>
            <Trans>用户未登录</Trans>
          </EmptyTitle>
          <EmptyDescription>
            <Trans>连接你的 SOL 钱包并登录即可开启交易</Trans>
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <WalletConnect />
        </EmptyContent>
      </Empty>
    )
  }

  if (!isLogin) {
    return (
      <PageLoading
      // loadingText={<Trans>登录中...</Trans>}
      />
    )
  }

  return <>{children}</>
}
