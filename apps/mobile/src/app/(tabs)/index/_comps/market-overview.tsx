import { ScrollView, View } from 'react-native'
import { AreaChart, ChartData } from '@/components/trading-view'
import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useThemeColors } from '@/hooks/use-theme-colors'
import React from 'react'

interface MarketCardProps {
  symbol: string
  price: string
  change: number
  data: ChartData[]
}

function MarketCard({ symbol, price, change, data }: MarketCardProps) {
  const isPositive = change >= 0
  const { colorStatusSuccess, colorStatusDanger } = useThemeColors()
  const changeColor = (isPositive ? colorStatusSuccess : colorStatusDanger) as string

  return (
    <Card className="w-[153px] border border-brand-default rounded-medium bg-navigation p-0">
      <CardContent className='gap-medium'>
        <View className="flex-row items-center">
           <Avatar className="size-[18px] mr-2 bg-primary">
              <AvatarFallback className="bg-transparent">
                  <Text className="!text-paragraph-p3 text-content-1">{symbol[0]}</Text>
              </AvatarFallback>
            </Avatar>
            <Text className="font-medium text-sm text-content-1">{symbol}</Text>
        </View>
        
        <View>
          <Text className="font-medium text-sm text-content-1">{price}</Text>
          <Text style={{ color: changeColor }} className="text-paragraph-p3">
            {isPositive ? '+' : ''}{change.toFixed(2)}%
          </Text>
        </View>

        {/* Mini Chart */}
        <View className="h-[60px] w-full overflow-hidden" pointerEvents="none">
          <AreaChart
            data={data}
            lineColor={changeColor}
            lineWidth={1}
            topColor={`${changeColor}99`} // ~60% opacity
            bottomColor={`${changeColor}00`} // 0% opacity
          />
        </View>
      </CardContent>
    </Card>
  )
}

export function MarketOverview() {
  // 生成模拟数据
  const generateMockData = (count: number, startValue: number) => {
    const data = []
    let time = 1642425322
    let value = startValue
    for (let i = 0; i < count; i++) {
      data.push({ time, value })
      time += 86400
      value += (Math.random() - 0.5) * 5 // 随机波动
    }
    return data
  }

  const mockData1 = React.useMemo(() => generateMockData(50, 40), [])
  
  const mockData2 = mockData1.map(d => ({ ...d, value: d.value * 1.2 }));
  const mockData3 = mockData1.map(d => ({ ...d, value: d.value * 0.8 }));

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ padding: 12, gap: 12 }}
    >
      <MarketCard 
        symbol="SOL-USDC" 
        price="142.00" 
        change={1.56} 
        data={mockData1}
      />
      <MarketCard 
        symbol="BTC-USDC" 
        price="91,988.00" 
        change={-1.56} 
        data={mockData2}
      />
        <MarketCard 
        symbol="ETH-USDC" 
        price="3,200.00" 
        change={-0.85} 
        data={mockData3}
      />
    </ScrollView>
  )
}
