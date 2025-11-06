import { getQueryClient } from '@/components/providers/global/react-query-provider/get-query-client'
import { useCallback, useMemo } from 'react'

import { calculateLpPoolPrice } from '@mullet/helpers/calculation'
import { ChainId, getProgramConfigBySymbol, ProgramSymbol } from '@mullet/web3/config'
import { web3QueryQueriesKey } from '@mullet/web3/constants'
import { useATATokenBalance, useLpTokenManage, usePDATokenBalance } from '@mullet/web3/hooks'
import { ProgramSeed } from '@mullet/web3/program'

export const useLpPoolPrice = (usdcAddress: string) => {
  const lpProgramConfig = getProgramConfigBySymbol(ChainId.SOL_DEVNET, ProgramSymbol.LP)
  const vaultProgramConfig = getProgramConfigBySymbol(ChainId.SOL_DEVNET, ProgramSymbol.VAULT)

  const { data: vaultUsdcBalance } = useATATokenBalance({
    ownerAddress: vaultProgramConfig.address,
    mintAddress: usdcAddress,
  })

  const { data: liquidityPoolBalance } = usePDATokenBalance({
    programAddress: lpProgramConfig.address,
    seed: ProgramSeed.USDC,
    mintAddress: usdcAddress,
  })

  const { data: lpTokenManage } = useLpTokenManage({
    programAddress: lpProgramConfig.address,
    seed: ProgramSeed.LPManage,
  })

  const lpPrice = useMemo(() => {
    return calculateLpPoolPrice({
      totalMinted: lpTokenManage?.totalMinted,
      totalBurned: lpTokenManage?.totalBurned,
      vaultAmount: vaultUsdcBalance,
      liquidityPoolAmount: liquidityPoolBalance,
    })
  }, [lpTokenManage, liquidityPoolBalance, vaultUsdcBalance])

  const updatePrice = useCallback(() => {
    const queryClient = getQueryClient()
    queryClient.invalidateQueries({
      queryKey: web3QueryQueriesKey.sol.manage.lp.toKeyWithArgs({
        programAddress: lpProgramConfig.address,
        seed: ProgramSeed.LPManage,
      }),
    })

    queryClient.invalidateQueries({
      queryKey: web3QueryQueriesKey.sol.balance.ata.toKeyWithArgs({
        ownerAddress: vaultProgramConfig.address,
        mintAddress: usdcAddress,
      }),
    })

    queryClient.invalidateQueries({
      queryKey: web3QueryQueriesKey.sol.balance.pda.toKeyWithArgs({
        programAddress: lpProgramConfig.address,
        seed: ProgramSeed.USDC,
        mintAddress: usdcAddress,
      }),
    })
  }, [])

  return { price: lpPrice?.toString(), updatePrice }
}
