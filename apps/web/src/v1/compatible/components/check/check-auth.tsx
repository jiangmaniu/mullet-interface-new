'use client'

import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import router from 'next/router'

import { PageLoading } from '@/components/loading/page-loading'
import { STORAGE_GET_TOKEN } from '@/v1/utils/storage'
import { Button } from '@mullet/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@mullet/ui/empty'
import { Iconify } from '@mullet/ui/icons'

import { useWalletAuthState } from '../../hooks/use-wallet-auth-state'
import { useWalletLogin } from '../../hooks/use-wallet-login'
import { WalletConnect } from './wallet-connect'

export const CheckLoginAuth = observer(({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLogin } = useWalletAuthState()

  const {
    accountLogin,
    loginAccountMutationResult: { error },
  } = useWalletLogin()

  // const initIsNotLogin = useRef(isAuthenticated && !isLogin)
  const isLoggingInRef = useRef(false)

  useEffect(() => {
    if (isLoggingInRef.current || isLogin) {
      return
    }

    isLoggingInRef.current = true
    accountLogin().finally(() => {
      isLoggingInRef.current = false
    })
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
          {error && (
            <div className="mb-6 w-full rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-900/20">
              <div className="mb-1 text-sm font-medium text-red-600 dark:text-red-400">
                <Trans>登录失败</Trans>
              </div>
              <div className="text-xs text-red-500 dark:text-red-300">{error.message ?? <Trans>登录失败</Trans>}</div>
            </div>
          )}
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
})
