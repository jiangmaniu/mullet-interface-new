import { QueriesKeyConfig } from "@/components/providers/react-query-provider/helper";
import { FollowManage } from "../instance/gen";
import { GetTWRRecordListRequestQuery } from "../hooks/follow-manage/twr-record-list";
import { GetPoolDetailRequestQuery } from "../hooks/follow-manage/pool-detail";
import { GetPoolPageListRequestQuery } from "../hooks/follow-manage/pool-list";
import { GetSharesRecordListRequestQuery } from "../hooks/follow-manage/shares-record-list";
import { GetVaultPageListRequestQuery } from "../hooks/follow-manage/vault-page-list";

export const followManageKeyConfig = {
  poolList: (query?: GetPoolPageListRequestQuery) => [query],
  vaultPageList: (query?: GetVaultPageListRequestQuery) => [query],
  poolDetail: (query: GetPoolDetailRequestQuery) => [query],
  twrRecordList: (query: GetTWRRecordListRequestQuery) => [query],
  sharesRecordList: (query: GetSharesRecordListRequestQuery) => [query],

  poolVaultCreate: undefined,
  poolVaultDivvy: undefined,
  poolVaultClose: undefined,
} satisfies QueriesKeyConfig
