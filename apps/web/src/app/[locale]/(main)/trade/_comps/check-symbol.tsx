import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

import { PageLoading } from '@/components/loading/page-loading'
import { useKeepRouter } from '@/hooks/common/use-keep-router'

export const CheckSymbol = ({ children }: { children: React.ReactNode }) => {
  const { symbol } = useParams<{ symbol: string }>()
  const { replaceKeepQuery } = useKeepRouter()

  const { data: symbolData, isLoading } = useQuery({
    queryKey: ['symbol', symbol],
    queryFn: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              symbol: 'SOL-USD',
            },
          })
        }, 5000)
      })
    },
    enabled: !!symbol,
  })

  if (isLoading) {
    return <PageLoading />
  }

  if (!symbol || !symbolData) {
    return replaceKeepQuery(`./${'btcusdt'}`)
  }

  return <>{children}</>
}
