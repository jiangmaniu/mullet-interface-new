import { QueriesKeyConfig } from '@mullet/utils/query'

import { GetTradeSymbolListRequestQuery } from '../hooks/account/symbol'

export const accountKeyConfig = {
  tradeSymbolList: (query?: GetTradeSymbolListRequestQuery) => [query],
} satisfies QueriesKeyConfig
