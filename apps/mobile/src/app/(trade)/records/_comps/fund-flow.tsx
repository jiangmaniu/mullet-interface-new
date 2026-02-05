import { View } from 'react-native'
import { Trans } from '@lingui/react/macro'
import { Text } from '@/components/ui/text'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface FundFlowItem {
  id: string
  type: string
  amount: string
  isIncome: boolean
  time: string
  balance: string
  beforeChange: string
  transactionSignature: string
}

// Mock data
const mockFundFlows: FundFlowItem[] = [
  {
    id: '1',
    type: '入金',
    amount: '0.10',
    isIncome: true,
    time: '2026年1月15日 12:00:00',
    balance: '0.10 USDC',
    beforeChange: '0.10 USDC',
    transactionSignature: '------',
  },
  {
    id: '2',
    type: '出金',
    amount: '0.10',
    isIncome: false,
    time: '2026年1月15日 12:00:00',
    balance: '0.10 USDC',
    beforeChange: '0.10 USDC',
    transactionSignature: '------',
  },
  {
    id: '3',
    type: '手续费',
    amount: '0.10',
    isIncome: true,
    time: '2026年1月15日 12:00:00',
    balance: '0.10 USDC',
    beforeChange: '0.10 USDC',
    transactionSignature: '------',
  },
]

function FundFlowCard({ item }: { item: FundFlowItem }) {
  return (
    <Card className="bg-background-secondary border border-brand-default mb-3">
      <CardContent className="p-3">
        {/* Two sections with gap-2 */}
        <View className="gap-2">
          {/* First Section: Details with gap-2 */}
          <View className="gap-2">
            {/* Time and Type Badge */}
            <View className="flex-row items-center justify-between">
              <Text className="text-paragraph-p3 text-content-4">{item.time}</Text>
              <Badge color="default">
                <Text className="text-paragraph-p3">{item.type}</Text>
              </Badge>
            </View>

            {/* Amount */}
            <View className="flex-row items-center justify-between">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>金额</Trans>
              </Text>
              <Text
                className={`text-paragraph-p3 ${
                  item.isIncome ? 'text-market-rise' : 'text-market-fall'
                }`}
              >
                {item.isIncome ? '' : '-'}{item.amount} USDC
              </Text>
            </View>

            {/* Balance */}
            <View className="flex-row items-center justify-between">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>余额</Trans>
              </Text>
              <Text className="text-paragraph-p3 text-content-1">{item.balance}</Text>
            </View>

            {/* Before Change */}
            <View className="flex-row items-center justify-between">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>变动前</Trans>
              </Text>
              <Text className="text-paragraph-p3 text-content-1">{item.beforeChange}</Text>
            </View>
          </View>

          {/* Second Section: Transaction Signature */}
          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>交易签名</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">{item.transactionSignature}</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  )
}

export function FundFlow() {
  return (
    <View className="p-xl">
      {mockFundFlows.map((item) => (
        <FundFlowCard key={item.id} item={item} />
      ))}
    </View>
  )
}
