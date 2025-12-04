import { buildQueriesCacheKey } from '@mullet/utils/query'

import { accountKeyConfig } from './account'
import { followManageKeyConfig } from './follow-manage'
import { followSharesKeyConfig } from './follow-shares'

export const tradeCoreApiQueriesKey = buildQueriesCacheKey(
  {
    followManage: followManageKeyConfig,
    account: accountKeyConfig,
    followShares: followSharesKeyConfig,
  },
  ['tradeCoreApi'] as const,
)
