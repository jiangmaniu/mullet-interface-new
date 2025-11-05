import { QueriesKeyConfig } from "@/components/providers/react-query-provider/helper";
import { GetPoolAccountDetailRequestQuery } from "../hooks/follow-shares/shares-detail";

export const followSharesKeyConfig = {
  poolAccountDetail: (query: GetPoolAccountDetailRequestQuery) => [query],

  purchaseShares: undefined,
  redeemShares: undefined,
} satisfies QueriesKeyConfig
