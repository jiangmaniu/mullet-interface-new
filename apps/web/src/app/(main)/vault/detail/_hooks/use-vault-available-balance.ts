import { calculateVaultAvailableBalance } from "@/helpers/calculation-formula/vault"
import { useVaultDetail } from "./use-vault-detail"

export const useVaultAvailableBalance = () => {
  const { vaultDetail } = useVaultDetail()

  const availableBalance = calculateVaultAvailableBalance({
    balance: vaultDetail?.followAccount?.money,
  })

  return availableBalance?.toString()
}
