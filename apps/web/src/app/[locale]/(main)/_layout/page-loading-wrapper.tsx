'use client'

import { PageLoading } from '@/components/loading/page-loading'
import { useWalletInitState } from '@/hooks/wallet/use-wallet-init-state'
import { useInitApp } from '@/v1/compatible/hooks/use-init-app'

export const PageLoadingWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isReady } = useWalletInitState()
  const { isLoading: isInitAppLoading } = useInitApp()

  const isLoading = !isReady || isInitAppLoading
  if (isLoading) {
    return <PageLoading className="min-h-screen" />
  }

  return children
}
