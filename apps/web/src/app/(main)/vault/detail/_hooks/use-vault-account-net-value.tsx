import { calculateVaultAccountNetValue } from '@/helpers/calculation-formula/vault'
import { FollowSharesWrapper } from '@/services/api/trade-core/hooks/follow-shares/shares-detail'
import { useVaultDetail } from './use-vault-detail'
import { useVaultSharePrice } from './use-vault-share-price'

export type VaultAccountDetail = FollowSharesWrapper

export function useVaultAccountNetValue() {
  const { vaultDetail } = useVaultDetail()
  const sharePrice = useVaultSharePrice()
  const netValue = calculateVaultAccountNetValue({
    sharePrice,
    share: vaultDetail?.accountFollowShares?.followShares
  })

  return netValue?.toString()
}
