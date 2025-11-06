import { QueriesKeyConfig } from '@mullet/utils/query'

import { GetPoolDetailRequestQuery } from '../hooks/follow-manage/pool-detail'
import { GetPoolPageListRequestQuery } from '../hooks/follow-manage/pool-list'
import { GetTWRRecordListRequestQuery } from '../hooks/follow-manage/twr-record-list'
import { GetVaultPageListRequestQuery } from '../hooks/follow-manage/vault-page-list'
import { FollowManage } from '../instance/_gen'

export const followManageKeyConfig = {
  poolList: (query?: GetPoolPageListRequestQuery) => [query],
  poolDetail: (query: GetPoolDetailRequestQuery) => [query],
  twrRecordList: (query: GetTWRRecordListRequestQuery) => [query],
  vaultPageList: (query?: GetVaultPageListRequestQuery) => [query],
  // sharesRecordList: (query: GetSharesRecordListRequestQuery) => [query],

  poolVaultCreate: undefined,
  poolVaultDivvy: undefined,
  poolVaultClose: undefined,
} satisfies QueriesKeyConfig
