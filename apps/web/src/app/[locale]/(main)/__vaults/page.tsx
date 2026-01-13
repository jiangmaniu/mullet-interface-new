import { cn } from '@mullet/ui/lib/utils'

import VaultList from './_comps/list'
// import VaultList from './_comps/list'
import { VaultOverview } from './_comps/vault-overview'

export default function ValutsPage() {
  return (
    <div className={'mx-auto w-full max-w-[1200px]'}>
      <div className={cn(['text-[24px] font-bold text-white', 'py-5'])}>金库</div>

      <div>
        <VaultOverview />
      </div>

      <div className="mt-2.5">
        <VaultList />
      </div>
    </div>
  )
}
