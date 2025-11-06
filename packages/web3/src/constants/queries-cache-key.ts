import { buildQueriesCacheKey } from '@mullet/utils/query'

export const web3QueryQueriesKey = buildQueriesCacheKey(
  {
    sol: {
      balance: {
        ata: (data: { ownerAddress?: string; mintAddress?: string }) => [data],
        pda: (data: { programAddress?: string; seed?: string; mintAddress?: string }) => [data],
      },
      manage: {
        lp: (data: { programAddress?: string; seed?: string }) => [data],
      },
    },
  },
  ['web3-query'] as const,
)
