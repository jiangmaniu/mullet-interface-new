'use client'

import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'

import { cn } from '@mullet/ui/lib/utils'

export const MainLayoutHeaderNav = () => {
  const activeSegment = useSelectedLayoutSegment()
  return (
    <div className="flex gap-0">
      {[
        {
          path: '/trade',
          label: '交易',
          activeSegment: 'trade',
        },
        {
          path: '/lp',
          label: <div>MTLP</div>,
          activeSegment: 'lp',
        },
        {
          path: '/vaults',
          label: '金库',
          activeSegment: 'vaults',
        },
        {
          path: '/points',
          label: '积分',
          activeSegment: 'points',
        },
      ].map((item, key) => {
        const isActiveNav = activeSegment === item.activeSegment
        return (
          <Link
            key={key}
            href={item.path}
            className={cn('rounded-[8px] border border-transparent px-4 py-2.5 text-[14px] leading-[16px]', {
              'border-[#3B3D52] text-white': isActiveNav,
              'text-[#9FA0B0] hover:text-white': !isActiveNav,
            })}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
