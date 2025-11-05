import { buildQueriesCacheKey } from '@mullet/utils/query'

import { FollowManage } from '../instance/gen'
import { followManageKeyConfig } from './follow-manage'
import { followSharesKeyConfig } from './follow-shares'

export const tradeCoreApiQueriesKey = buildQueriesCacheKey(
  {
    followManage: followManageKeyConfig,
    followShares: followSharesKeyConfig,
  },
  ['tradeCoreApi'] as const,
)
