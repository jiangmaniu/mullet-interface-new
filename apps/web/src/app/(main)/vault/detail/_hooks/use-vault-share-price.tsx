import { calculateVaultSharePrice } from '@/helpers/calculation-formula/vault'
import { useVaultDetail } from './use-vault-detail'

export const useVaultSharePrice = () => {
  const { vaultDetail } = useVaultDetail()

  const availableBalance = calculateVaultSharePrice({
    balance: vaultDetail?.followAccount?.money,
    share: vaultDetail?.totalShares,
    pnl: 0
  })

  return availableBalance?.toString()
}
