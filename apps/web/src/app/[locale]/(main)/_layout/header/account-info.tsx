'use client'

import { useWalletAuthState } from '@/hooks/wallet/use-wallet-auth-state'
import { useWalletLogout } from '@/hooks/wallet/use-wallet-login'
import { logout } from '@/services/api/user'
import { Button } from '@mullet/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@mullet/ui/dropdown-menu'
import { IconChevronDown, IconDisconnect, IconWallet } from '@mullet/ui/icons'
import { cn } from '@mullet/ui/lib/utils'

export const AccountInfo = () => {
  const { isAuthenticated } = useWalletAuthState()
  const walletLogout = useWalletLogout()
  if (!isAuthenticated) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn('min-h-max min-w-max gap-2.5 border-[#3B3D52] px-2.5 py-2 leading-[18px]')}
          variant="outline"
        >
          <IconWallet className="size-4" />
          <span>创建者操作</span>
          <IconChevronDown className="action-icon size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]" sideOffset={8} align="end">
        <DropdownMenuItem onClick={() => walletLogout()}>
          <IconDisconnect className="size-4" /> 断开连接
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
