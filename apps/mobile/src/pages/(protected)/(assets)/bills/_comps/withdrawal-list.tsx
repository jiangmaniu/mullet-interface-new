import { Card, CardContent } from "@/components/ui/card";
import { Trans } from "@lingui/react/macro";
import { observer } from "mobx-react-lite"
import React from "react";
import { ScrollView, View } from "react-native";
import { BillsCardRow, MetaMaskIcon } from "./card-row";
import { DepositRecord, WithdrawalRecord } from "..";
import { Text } from "@/components/ui/text";


// Mock data
const MOCK_WITHDRAWALS: WithdrawalRecord[] = [
  {
    id: '1',
    amount: '0.10',
    currency: 'USDC',
    status: 'success',
    fromAccount: '4563155256',
    fromAccountType: 'STP',
    toAddress: '0x862D...B22A',
    toAddressLabel: 'MetaMask',
    orderNumber: '844564126145498456',
    time: '2026-01-01 12:00:00',
  },
  {
    id: '2',
    amount: '0.10',
    currency: 'USDC',
    status: 'failed',
    fromAccount: '4563155256',
    fromAccountType: 'STP',
    toAddress: '0x862D...B22A',
    toAddressLabel: 'MetaMask',
    orderNumber: '844564126145498456',
    time: '2026-01-01 12:00:00',
  },
  {
    id: '3',
    amount: '0.10',
    currency: 'USDC',
    status: 'success',
    fromAccount: '4563155256',
    fromAccountType: 'STP',
    toAddress: '0x862D...B22A',
    toAddressLabel: 'MetaMask',
    orderNumber: '844564126145498456',
    time: '2026-01-01 12:00:00',
  },
];

export const WithdrawalList = observer(({ accountSelector }: { accountSelector: React.ReactNode }) => {
  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
      <View className="gap-xl px-xl pt-xl">
        {accountSelector}
        {MOCK_WITHDRAWALS.map((record) => (
          <WithdrawalCard key={record.id} record={record} />
        ))}
      </View>
    </ScrollView>
  )
})

// Withdrawal Card Component
function WithdrawalCard({ record }: { record: WithdrawalRecord }) {
  return (
    <Card>
      <CardContent className="gap-xs">
        <BillsCardRow
          label={<Trans>出金金额</Trans>}
          value={`${record.amount} ${record.currency}`}
        />
        <BillsCardRow
          label={<Trans>出金状态</Trans>}
        // valueComponent={<StatusBadge status={record.status} />}
        />
        <BillsCardRow
          label={<Trans>转出账户</Trans>}
          valueComponent={
            <View className="flex-row items-center gap-xs">
              {/* <AccountTypeBadge type={record.fromAccountType} /> */}
              <Text className="text-paragraph-p3 text-content-1">{record.fromAccount}</Text>
            </View>
          }
        />
        <BillsCardRow
          label={<Trans>收款地址</Trans>}
          valueComponent={
            <View className="flex-row items-center gap-xs">
              <MetaMaskIcon width={18} height={18} />
              <Text className="text-paragraph-p3 text-content-1">
                {record.toAddressLabel}({record.toAddress})
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

