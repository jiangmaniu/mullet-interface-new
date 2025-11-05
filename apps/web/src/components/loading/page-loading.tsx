import Image from 'next/image'

import { BorderBeam } from '@mullet/ui/borderBeam'
import { cn } from '@mullet/ui/lib/utils'

export const PageLoading = ({ size = 64 }: { size?: number }) => {
  return (
    <div className="flex-center flex h-full min-h-screen w-full flex-1">
      <div className="relative flex items-center justify-center rounded-full bg-[#1e2329] p-1">
        <Image src={'/icons/logo/mullet-short.svg'} width={size} height={size} className={cn()} alt="" />
        <BorderBeam duration={4} borderWidth={4} colorFrom="#1e2329" colorTo="#fcd535" />
      </div>
    </div>
  )
}
