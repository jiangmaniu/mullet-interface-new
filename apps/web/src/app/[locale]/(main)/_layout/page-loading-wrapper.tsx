'use client'

import { PageLoading } from '@/components/loading/page-loading'
import { useWalletInitState } from '@/hooks/wallet/use-wallet-init-state'

export const PageLoadingWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isReady } = useWalletInitState()

  const isLoading = !isReady
  if (isLoading) {
    return <PageLoading className="min-h-screen" />
  }

  return children
}
