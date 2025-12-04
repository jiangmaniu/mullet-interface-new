import { buildQueriesCacheKey } from '@mullet/utils/query'

import { oauthKeyConfig } from './oauth'

export const bladeAuthApiQueriesKey = buildQueriesCacheKey(
  {
    oauth: oauthKeyConfig,
  },
  ['bladeAuthApi'] as const,
)
