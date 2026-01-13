'use client'

import { Trans } from '@lingui/react/macro'
import { useQuery } from '@tanstack/react-query'
import { notFound, redirect, useParams } from 'next/navigation'

import { PageLoading } from '@/components/loading/page-loading'
import { useKeepRouter } from '@/hooks/common/use-keep-router'

import { useActiveTradeSymbolInfo } from '../../_hooks/use-active-symbol-info'
import { TradeSymbolPageParams } from '../../layout'

export const CheckSymbol = ({ children }: { children: React.ReactNode }) => {
  const { symbol } = useParams<TradeSymbolPageParams>()
  const { createHref } = useKeepRouter()

  const { activeTradeSymbolInfo, firstTradeSymbolInfo, isLoading } = useActiveTradeSymbolInfo()

  const firstSymbol = firstTradeSymbolInfo?.symbol

  if (isLoading) {
    return (
      <PageLoading
      // loadingText={<Trans>正在加载交易对...</Trans>}
      />
    )
  }

  if (!firstTradeSymbolInfo) {
    return notFound()
  }

  if (!symbol) {
    return redirect(createHref(`./${firstSymbol}`))
  } else if (!activeTradeSymbolInfo) {
    return redirect(createHref(`#/${firstSymbol}`))
  }

  return <>{children}</>
}
