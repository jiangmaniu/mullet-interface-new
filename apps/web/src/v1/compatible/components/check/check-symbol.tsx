'use client'

import { observer } from 'mobx-react-lite'
import { notFound, redirect, useParams } from 'next/navigation'

import { useActiveTradeSymbolInfo } from '@/app/[locale]/(main)/trade/[symbol]/_hooks/use-active-symbol-info'
import { TradeSymbolPageParams } from '@/app/[locale]/(main)/trade/[symbol]/layout'
import { PageLoading } from '@/components/loading/page-loading'
import { useKeepRouter } from '@/hooks/common/use-keep-router'
import { useStores } from '@/v1/provider/mobxProvider'

import { useInitialState } from '../../hooks/use-initial-state'

export const CheckSymbol = observer(({ children }: { children: React.ReactNode }) => {
  const { symbol } = useParams<TradeSymbolPageParams>()
  const { createHref } = useKeepRouter()

  const {
    initialStateQueryResult: { isLoading },
  } = useInitialState()

  // const { trade } = useStores()

  // const { activeTradeSymbolInfo, firstTradeSymbolInfo, isLoading } = useActiveTradeSymbolInfo()

  // const firstSymbol = firstTradeSymbolInfo?.symbol

  if (isLoading) {
    return (
      <PageLoading
      // loadingText={<Trans>正在加载交易对...</Trans>}
      />
    )
  }

  // if (!firstTradeSymbolInfo) {
  //   return notFound()
  // }

  // if (!symbol) {
  //   return redirect(createHref(`./${firstSymbol}`))
  // } else if (!activeTradeSymbolInfo) {
  //   return redirect(createHref(`#/${firstSymbol}`))
  // }

  return <>{children}</>
})
