import { FollowSharesWrapper, useGetPoolAccountDetailApiOptions } from '@/services/api/trade-core/hooks/follow-shares/shares-detail'
import { useQuery } from '@tanstack/react-query'
import { useParams } from '@umijs/max'

export type VaultAccountDetail = FollowSharesWrapper

export function useVaultAccountDetail() {
  const { vaultId } = useParams<{ vaultId: string }>()
  // const mainAccount = useMainAccount()

  const { getPoolAccountDetailApiOptions } = useGetPoolAccountDetailApiOptions({
    followSharesId: Number(vaultId)
  })
  const queryResult = useQuery({
    ...getPoolAccountDetailApiOptions,
    select: (data) => {
      if (data) {
        return {
          ...data
          // isOwner: mainAccount?.id.toString() === data?.mainAccountId?.toString()
        }
      }

      return data
    }
  })

  return { vaultAccountDetail: queryResult.data, queryResult }
}
