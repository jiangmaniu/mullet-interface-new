import { cn } from '@mullet/ui/lib/utils'

import VaultList from './_comps/list'
import { VaultOverview } from './_comps/vault-overview'

export default function ValutPage() {
  return (
    <div className={'mx-auto w-full max-w-[1200px]'}>
      <div
        className={cn([
          'tracking-0 font-variation-settings:opsz-auto font-feature-settings:kern-on text-[24px] leading-normal font-bold text-white',
          'py-5',
        ])}
      >
        金库
      </div>

      <div>
        <VaultOverview />
      </div>

      <div className="mt-2.5">
        <VaultList />
      </div>
    </div>
  )
}
