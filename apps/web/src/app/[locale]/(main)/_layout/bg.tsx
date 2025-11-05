'use client'

import GlobalBgSvg from '@/assets/bg/global.svg'

export default function GlobalBg() {
  return (
    <div className={`fixed inset-0 -z-40 flex items-end bg-[#0E123A]`}>
      <GlobalBgSvg alt="bg" className="h-full w-full object-cover" />
    </div>
  )
}
