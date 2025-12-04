'use client'

import Image from 'next/image'

import GlobalBgSvg from '@/assets/bg/global.png'

export default function GlobalBg() {
  return (
    <div className={`bg-secondary fixed inset-0 -z-40 flex items-start justify-center`}>
      <Image alt="bg" className="" src={GlobalBgSvg} />
    </div>
  )
}
