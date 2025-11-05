'use client'

import { useWalletAuthState } from '@/hooks/wallet/use-wallet-auth-state'
import { Button } from '@mullet/ui/button'

export const DepositAssets = () => {
  const { isAuthenticated } = useWalletAuthState()

  if (!isAuthenticated) {
    return null
  }

  return (
    <div>
      <div>
        <Button size={'sm'}>存款</Button>
      </div>
    </div>
  )
}
