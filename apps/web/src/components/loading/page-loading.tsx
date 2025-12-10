import { ReactNode } from 'react'
import Image from 'next/image'

import { BorderBeam } from '@mullet/ui/borderBeam'
import { cn } from '@mullet/ui/lib/utils'

interface PageLoadingProps {
  size?: number
  className?: string
  show?: boolean
  duration?: number
  loadingText?: ReactNode
}

export const PageLoading = ({ size = 64, loadingText, className, show = true, duration = 500 }: PageLoadingProps) => {
  return (
    <div
      className={cn(
        'flex-center flex h-full w-full flex-1 transition-opacity ease-in-out',
        show ? 'opacity-100' : 'pointer-events-none opacity-0',
        className,
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      <div className="flex flex-col gap-3">
        <div className="relative mx-auto flex items-center justify-center rounded-full bg-[#1e2329] p-1">
          <Image src={'/icons/logo/mullet-tag.svg'} width={size} height={size} className={cn()} alt="" />
          <BorderBeam duration={4} borderWidth={4} colorFrom="#1e2329" colorTo="#fcd535" />
        </div>

        {loadingText && <div className="text-center text-xl text-white">{loadingText}</div>}
      </div>
    </div>
  )
}
