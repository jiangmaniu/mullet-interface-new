import { buildQueriesCacheKey } from "@/components/providers/react-query-provider/helper"
import { followManageKeyConfig } from "./follow-manage"
import { followSharesKeyConfig } from "./follow-shares"
import { FollowManage } from "../instance/gen"

export const tradeCoreApiQueriesKey = buildQueriesCacheKey({
  followManage: followManageKeyConfig,
  followShares: followSharesKeyConfig,
}, ['tradeCoreApi'] as const)

const a = tradeCoreApiQueriesKey.followManage.poolList.toKeyWithArgs({ current: 1 })
