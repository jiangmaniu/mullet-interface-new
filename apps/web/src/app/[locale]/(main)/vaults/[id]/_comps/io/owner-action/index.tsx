// import { useModel } from '@umijs/max'
import { useState } from 'react'

import { SecondaryConfirmationGlobalModalProps } from '@/components/providers/global/nice-modal-provider/global-modal'
import { useNiceModal } from '@/components/providers/global/nice-modal-provider/hooks'
import { GLOBAL_MODAL_ID } from '@/components/providers/global/nice-modal-provider/register'
// import { useStores } from '@/context/mobxProvider'
import { usePoolCloseVaultApiMutation } from '@/services/api/trade-core/hooks/follow-manage/pool-vault-close'
import { Button } from '@mullet/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@mullet/ui/dropdownMenu'
import { IconChevronDown } from '@mullet/ui/icons'
import { cn } from '@mullet/ui/lib/utils'
import { toast } from '@mullet/ui/toast'

import { useVaultDetail } from '../../../_hooks/use-vault-detail'
import { DistributeModal } from './distribute-modal'

export const VaultOwnerAction = () => {
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className={cn('min-h-max min-w-max gap-2 border-[#3B3D52] px-[10px] py-[5px] leading-[18px]')}
            variant="outline"
          >
            <span>创建者操作</span>
            <IconChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[156px]" sideOffset={8} align="end">
          <VaultTrade />
          <WithdrawAndClosePosition />
          <DropdownMenuItem onClick={() => setIsDistributeModalOpen(true)}>分发</DropdownMenuItem>
          <CloseVault />
        </DropdownMenuContent>
      </DropdownMenu>
      <DistributeModal open={isDistributeModalOpen} onOpenChange={setIsDistributeModalOpen} />
    </>
  )
}

function VaultTrade() {
  // const { trade, ws } = useStores()
  // const { initialState } = useModel('@@initialState')

  // const currentUser = initialState?.currentUser
  // const accountList = currentUser?.accountList || []
  const accountList = [] as any
  const { vaultDetail } = useVaultDetail()

  const toVaultTradeAccount = () => {
    const vaultAccount = accountList.find(
      (item: any) => item.pdaTokenAddress.toString() === vaultDetail?.followAccount?.pdaTokenAddress?.toString(),
    )
    if (vaultAccount) {
      // ws.close()
      // trade.setCurrentAccountInfo(vaultAccount)
      // trade.jumpTrade()
      // // 切换账户重置
      // trade.setCurrentLiquidationSelectBgaId('CROSS_MARGIN')
    }
  }

  return <DropdownMenuItem onClick={toVaultTradeAccount}>金库交易</DropdownMenuItem>
}

function WithdrawAndClosePosition() {
  const { vaultDetail } = useVaultDetail()
  const confirmModal = useNiceModal<SecondaryConfirmationGlobalModalProps>(GLOBAL_MODAL_ID.SecondaryConfirmation)

  const handleSwitchRedeemCloseOrder = () => {
    if (vaultDetail) {
      confirmModal.show({
        title: vaultDetail?.redeemCloseOrder ? '禁用取款平仓' : '启用取款平仓',
        message: vaultDetail?.redeemCloseOrder
          ? `确定要禁用取款平仓吗？禁用后，在取款时不会自动平仓。`
          : `确定要启用取款平仓吗？启用后，在取款时会自动平仓。`,
        confirm: {
          label: '确定',
          cb: () => {
            toast.info('尽请期待')
          },
        },
        cancel: {
          label: '取消',
          cb: () => {},
        },
      })
    }
  }

  return (
    <DropdownMenuItem onClick={handleSwitchRedeemCloseOrder}>
      {vaultDetail?.redeemCloseOrder ? '禁用取款平仓' : '启用取款平仓'}
    </DropdownMenuItem>
  )
}

const CloseVault = () => {
  const { vaultDetail } = useVaultDetail()
  const isCloseVault = !!vaultDetail && vaultDetail?.status === 'CLOSE'
  const { mutateAsync: closeVault } = usePoolCloseVaultApiMutation()
  const confirmModal = useNiceModal<SecondaryConfirmationGlobalModalProps>(GLOBAL_MODAL_ID.SecondaryConfirmation)

  const handleCloseVault = () => {
    if (vaultDetail) {
      confirmModal.show({
        title: '关闭仓库',
        message: '您确认要关闭金库？此操作将会结束金库订单并按比例分发所有资金，并且无法再启用此金库。',
        confirm: {
          label: '确定',
          cb: async () => {
            await closeVault(
              {
                followManageId: vaultDetail.id,
              },
              {
                onSuccess: () => {
                  toast.success('关闭成功')
                },
              },
            )
          },
        },
        cancel: {
          label: '取消',
          cb: () => {},
        },
      })
    }
  }

  return (
    <DropdownMenuItem disabled={isCloseVault} onClick={handleCloseVault}>
      关闭仓库
    </DropdownMenuItem>
  )
}
