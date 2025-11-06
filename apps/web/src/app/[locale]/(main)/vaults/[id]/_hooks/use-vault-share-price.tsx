import { calculateVaultSharePrice } from '@mullet/helpers/calculation'

import { useVaultDetail } from './use-vault-detail'

export const useVaultSharePrice = () => {
  const { vaultDetail } = useVaultDetail()

  const price = calculateVaultSharePrice({
    balance: vaultDetail?.followAccount?.money,
    share: vaultDetail?.totalShares,
    pnl: 0,
  })

  return price?.toString()
}
