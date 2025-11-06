import { calculateVaultAvailableBalance } from '@mullet/helpers/calculation'

import { useVaultDetail } from './use-vault-detail'

export const useVaultAvailableBalance = () => {
  const { vaultDetail } = useVaultDetail()

  const availableBalance = calculateVaultAvailableBalance({
    balance: vaultDetail?.followAccount?.money,
  })

  return availableBalance?.toString()
}
