import { useCallback, useMemo } from 'react'
import { useLpTokenManage } from '../web3-query/use-lp-manage'
import { useATATokenBalance } from '../web3-query/use-ata-balance'
import { PoolSeed } from '@/libs/web3/constans/enum'
import { usePDATokenBalance } from '../web3-query/use-pda-balance'
import { calculateLpPoolPrice } from '@/libs/web3/helpers/calculation-formula'
import { vaultAccountAddress, poolProgramAddress } from '@/libs/web3/constans/address'
import { getQueryClient } from '@/components/providers/react-query-provider/get-query-client'
import { web3QueryQueriesKey } from '@/libs/web3/constans/queries-eache-key'

export const useLpPoolPrice = (usdcAddress: string) => {
  const { data: vaultUsdcBalance } = useATATokenBalance({
    ownerAddress: vaultAccountAddress,
    mintAddress: usdcAddress
  })

  const { data: liquidityPoolBalance } = usePDATokenBalance({
    programAddress: poolProgramAddress,
    seed: PoolSeed.USDC,
    mintAddress: usdcAddress
  })

  const { data: lpTokenManage } = useLpTokenManage({
    programAddress: poolProgramAddress,
    seed: PoolSeed.LPManage
  })

  const lpPrice = useMemo(() => {
    return calculateLpPoolPrice({
      totalMinted: lpTokenManage?.totalMinted,
      totalBurned: lpTokenManage?.totalBurned,
      vaultAmount: vaultUsdcBalance,
      liquidityPoolAmount: liquidityPoolBalance
    })
  }, [lpTokenManage, liquidityPoolBalance, vaultUsdcBalance])

  const updatePrice = useCallback(() => {
    const queryClient = getQueryClient()
    queryClient.invalidateQueries({
      queryKey: web3QueryQueriesKey.sol.manage.lp.toKeyWithArgs({
        programAddress: poolProgramAddress,
        seed: PoolSeed.LPManage
      })
    })

    queryClient.invalidateQueries({
      queryKey: web3QueryQueriesKey.sol.balance.ata.toKeyWithArgs({
        ownerAddress: vaultAccountAddress,
        mintAddress: usdcAddress
      })
    })

    queryClient.invalidateQueries({
      queryKey: web3QueryQueriesKey.sol.balance.pda.toKeyWithArgs({
        programAddress: poolProgramAddress,
        seed: PoolSeed.USDC,
        mintAddress: usdcAddress
      })
    })
  }, [])

  return { price: lpPrice?.toString(), updatePrice }
}
