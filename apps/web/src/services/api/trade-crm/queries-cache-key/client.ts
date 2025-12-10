import { QueriesKeyConfig } from '@mullet/utils/query'

import { GetClientUserInfoRequestQuery } from '../hooks/client/user-info'

export const ClientKeyConfig = {
  userInfo: (query?: GetClientUserInfoRequestQuery) => [query],
} satisfies QueriesKeyConfig
