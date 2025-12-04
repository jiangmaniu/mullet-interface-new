'use client'

import { useQuery } from '@tanstack/react-query'
import { redirect, useParams } from 'next/navigation'

import { PageLoading } from '@/components/loading/page-loading'

import { CheckLoginAuth } from '../../_comps/check/check-auth'
import { CheckSymbol } from './_comps/check-symbol'

export default function TradeLayout({ children }: { children: React.ReactNode }) {
  return (
    <CheckLoginAuth>
      <CheckSymbol>{children}</CheckSymbol>
    </CheckLoginAuth>
  )
}
