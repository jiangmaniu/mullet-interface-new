import { buildQueriesCacheKey } from '@mullet/utils/query'

import { GetClientUserInfoRequestQuery } from '../hooks/client/user-info'
import { ClientKeyConfig } from './client'

export const tradeCrmApiQueriesKey = buildQueriesCacheKey(
  {
    client: ClientKeyConfig,
  },
  ['tradeCrmApi'] as const,
)
