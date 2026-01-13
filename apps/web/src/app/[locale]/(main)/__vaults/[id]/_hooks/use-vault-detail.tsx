// import { useMainAccount } from '@/hooks/user/use-main-account'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

import {
  PoolManageWrapper,
  useGetPoolDetailApiOptions,
} from '@/services/api/trade-core/hooks/follow-manage/pool-detail'

export type VaultDetail = PoolManageWrapper & { isOwner: boolean }

export function useVaultDetail() {
  const { vaultId } = useParams<{ vaultId: string }>()
  // const mainAccount = useMainAccount()
  const mainAccount = {} as any

  const { getPoolDetailApiOptions } = useGetPoolDetailApiOptions({
    followManageId: Number(vaultId),
    tradeAccountId: mainAccount?.id,
  })
  const queryResult = useQuery({
    ...getPoolDetailApiOptions,
    select: (data) => {
      if (data) {
        return {
          ...data,
          isOwner: mainAccount?.id.toString() === data?.mainAccountId?.toString(),
        }
      }

      return data
    },
  })

  return { vaultDetail: queryResult.data, queryResult }
}
