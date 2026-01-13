'use client'

import { show } from '@ebay/nice-modal-react'

import { Button } from '@mullet/ui/button'
import { cn } from '@mullet/ui/lib/utils'

import { CreateVaultModal } from './create-vault-modal'

export function VaultOverview() {
  const CreateVaultModalId = 'NiceModal_CreateVault'

  return (
    <div
      className={cn(['flex justify-between rounded-[10px] bg-[#0A0C27] px-[30px] py-[35px]', 'w-full max-w-[1200px]'])}
    >
      <div className="flex flex-col gap-1.5">
        <div className={cn(['text-[24px] font-bold text-white', ''])}>$18,229,265.84</div>
        <div className={cn(['text-[14px] text-[#9FA0B0]', ''])}>总锁定价值</div>
      </div>

      <div>
        <Button onClick={() => show(CreateVaultModalId)}>创建金库</Button>
        <CreateVaultModal id={CreateVaultModalId} />
      </div>
    </div>
  )
}
