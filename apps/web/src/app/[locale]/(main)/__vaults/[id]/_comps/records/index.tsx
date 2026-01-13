import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { VaultBalanceRecords } from './balance-records'
import { VaultDepositorRecords } from './depositor-records'
import { VaultDepositsAndWithdrawalsRecords } from './deposits-and-withdrawals-records'
import { VaultPositionRecords } from './position-records'
import { VaultTransactionHistoryRecords } from './transaction-history-redords'

export default function VaultDetailRecords() {
  enum TabEnum {
    Balances,
    Positions,
    TransactionHistory,
    FundingFeeHistory,
    DepositsAndWithdrawals,
    Depositor
  }
  const [tab, setTab] = useState<TabEnum>(TabEnum.Balances)

  // const options = [
  //   {
  //     label: 'Balances',
  //     value: TabEnum.Balances,
  //     content: <VaultBalanceRecords />
  //   },
  //   {
  //     label: 'Position',
  //     value: TabEnum.Positions,
  //     content: <VaultPositionRecords />
  //   },
  //   {
  //     label: 'Transaction History',
  //     value: TabEnum.TransactionHistory,
  //     content: <VaultTransactionHistoryRecords />
  //   },
  //   {
  //     label: 'Funding Fee History',
  //     value: TabEnum.FundingFeeHistory,
  //     content: <VaultFundingFeeHistoryRecords />
  //   },
  //   {
  //     label: 'Deposits And Withdrawals',
  //     value: TabEnum.DepositsAndWithdrawals,
  //     content: <VaultDepositsAndWithdrawalsRecords />
  //   },
  //   {
  //     label: 'Depositor',
  //     value: TabEnum.Depositor,
  //     content: <VaultDepositorRecords />
  //   }
  // ]

  const options = [
    {
      // label: 'Balances',
      label: '余额',
      value: TabEnum.Balances,
      // content: <div>Balance</div>,
      content: <VaultBalanceRecords />
    },
    {
      // label: 'Position',
      label: '仓位',
      value: TabEnum.Positions,
      // content: <div>Position</div>
      content: <VaultPositionRecords />
    },
    {
      // label: 'Transaction History',
      label: '交易历史',
      value: TabEnum.TransactionHistory,
      // content: <div>Transaction History</div>
      content: <VaultTransactionHistoryRecords />
    },
    // {
    //   // label: 'Funding Fee History',
    //   label: '资金费率历史',
    //   value: TabEnum.FundingFeeHistory,
    //   // content: <div>Funding Fee History</div>
    //   content: <VaultFundingFeeHistoryRecords />
    // },
    {
      // label: 'Deposits And Withdrawals',
      label: '存款和取款',
      value: TabEnum.DepositsAndWithdrawals,
      // content: <div>Deposits And Withdrawals</div>
      content: <VaultDepositsAndWithdrawalsRecords />
    },
    {
      // label: 'Depositor',
      label: '存款人',
      value: TabEnum.Depositor,
      // content: <div>Depositor</div>
      content: <VaultDepositorRecords />
    }
  ]

  return (
    <div className={'rounded-[10px] h-full bg-[#0A0C27]'}>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {options.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-2.5 min-h-[250px]">
          {options.map((item) => (
            <TabsContent key={item.value} value={item.value}>
              {item.content}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
}
