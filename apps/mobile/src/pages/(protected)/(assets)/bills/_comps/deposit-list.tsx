import { Card, CardContent } from "@/components/ui/card";
import { Trans } from "@lingui/react/macro";
import { observer } from "mobx-react-lite"
import React from "react";
import { ScrollView, View } from "react-native";
import { AccountTypeBadge, BillsCardRow, BillsCardStatusBadge, MetaMaskIcon } from "./card-row";
import { DepositRecord } from "..";
import { Text } from "@/components/ui/text";

const MOCK_DEPOSITS: DepositRecord[] = [
  {
    id: '1',
    amount: '0.10',
    currency: 'USDC',
    status: 'success',
    toAccount: '4563155256',
    toAccountType: 'STP',
    fromAddress: '0x862D...B22A',
    fromAddressLabel: 'MetaMask',
    orderNumber: '844564126145498456',
    time: '2026-01-01 12:00:00',
  },
  {
    id: '2',
    amount: '0.10',
    currency: 'USDC',
    status: 'failed',
    toAccount: '4563155256',
    toAccountType: 'STP',
    fromAddress: '0x862D...B22A',
    fromAddressLabel: 'MetaMask',
    orderNumber: '844564126145498456',
    time: '2026-01-01 12:00:00',
  },
];

export const DepositList = observer(({ accountSelector }: { accountSelector: React.ReactNode }) => {
  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
      <View className="gap-xl px-xl pt-xl">
        {accountSelector}
        {MOCK_DEPOSITS.map((record) => (
          <DepositCard key={record.id} record={record} />
        ))}
      </View>
    </ScrollView>
  )
})

// Deposit Card Component
function DepositCard({ record }: { record: DepositRecord }) {
  return (
    <Card>
      <CardContent className="gap-xs">
        <BillsCardRow
          label={<Trans>入金金额</Trans>}
          value={`${record.amount} ${record.currency}`}
        />
        <BillsCardRow
          label={<Trans>入金状态</Trans>}
          valueComponent={<BillsCardStatusBadge status={record.status} />}
        />
        <BillsCardRow
          label={<Trans>收款账户</Trans>}
          valueComponent={
            <View className="flex-row items-center gap-xs">
              <AccountTypeBadge type={record.toAccountType} />
              <Text className="text-paragraph-p3 text-content-1">{record.toAccount}</Text>
            </View>
          }
        />
        <BillsCardRow
          label={<Trans>转入地址</Trans>}
          valueComponent={
            <View className="flex-row items-center gap-xs">
              <MetaMaskIcon width={18} height={18} />
              <Text className="text-paragraph-p3 text-content-1">
                {record.fromAddressLabel}({record.fromAddress})
              </Text>
            </View>
          }
        />
        <BillsCardRow label={<Trans>单号</Trans>} value={record.orderNumber} />
        <BillsCardRow label={<Trans>时间</Trans>} value={record.time} />
      </CardContent>
    </Card>
  );
}
