import { View } from 'react-native'
import { Trans } from '@lingui/react/macro'
import { AreaChart, ChartData } from '@/components/trading-view'
import { Text } from '@/components/ui/text'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useThemeColors } from '@/hooks/use-theme-colors'
import React from 'react'

interface AssetRowProps {
  symbol: string
  name: string
  price: string
  change: number
  chartData?: ChartData[] 
}

function AssetRow({ symbol, name, price, change, chartData = [] }: AssetRowProps) {
    const isPositive = change >= 0
  
    const { colorMarketRise, colorMarketFall } = useThemeColors()
    
  return (
    <View 
      className="flex-row items-center p-xl gap-xl"
    >
      {/* Left: Icon & Name */}
      <View className="flex-row items-center gap-medium flex-1">
         <Avatar className="size-6 flex-shrink-0">
            <AvatarFallback className="bg-brand-default">
                <Text className="text-content-1">{symbol[0]}</Text>
            </AvatarFallback>
         </Avatar>
         <View>
             <Text className="text-paragraph-p2 text-content-1">{symbol}</Text>
             <Text className="text-paragraph-p3 text-content-4">{name}</Text>
         </View>
      </View>

    <View className='flex-row flex-shrink-0 gap-xl w-[180px]'>  
      {/* Center: Mini Chart */}
      <View className="w-[60px] h-8 items-center justify-center overflow-hidden">
         <AreaChart
            data={chartData}
            lineColor={isPositive ? colorMarketRise : colorMarketFall}
          />
      </View>

      {/* Right: Price & Change */}
      <View className="flex-1 items-end">
        <Text className="text-paragraph-p1 text-content-1">{price}</Text>
        <Text className={cn('text-paragraph-p2', isPositive ? 'text-market-rise' : 'text-market-fall')}>
          {isPositive ? '+' : ''}{change.toFixed(2)}%
        </Text>
      </View>
    </View>
  </View>
  )
}

export function AssetListView() {
  const generateMockData = (count: number, startValue: number) => {
    const data = []
    let time = 1642425322
    let value = startValue
    for (let i = 0; i < count; i++) {
      data.push({ time, value })
      time += 86400
      value += (Math.random() - 0.5) * 5 
    }
    return data
  }

  return (
    <View>
      <View className="flex-row items-center justify-between py-medium px-xl">
		 <Text className="text-paragraph-p2 text-content-5 flex-1"><Trans>品类</Trans></Text>
        <View className='flex-row gap-xl flex-shrink-0'>
          <Text className="text-paragraph-p2 text-content-5 w-[90px]"><Trans>走势</Trans></Text>
          <Text className="text-paragraph-p2 text-content-5 w-[90px] text-right"><Trans>价格/涨跌幅</Trans></Text>
        </View>
      </View>
      <AssetRow symbol="SOL-USDC" name="Solana" price="148.00" change={1.45} chartData={generateMockData(20, 140)} />
      <AssetRow symbol="XAU-USDC" name="现货黄金" price="148.00" change={-1.45} chartData={generateMockData(20, 148)} />
      <AssetRow symbol="SOL-USDC" name="Solana" price="148.00" change={1.45} chartData={generateMockData(20, 140)} />
      <AssetRow symbol="XAU-USDC" name="现货黄金" price="148.00" change={-1.45} chartData={generateMockData(20, 148)} />
      <AssetRow symbol="SOL-USDC" name="Solana" price="148.00" change={1.45} chartData={generateMockData(20, 140)} />
      <AssetRow symbol="XAU-USDC" name="现货黄金" price="148.00" change={-1.45} chartData={generateMockData(20, 148)} />
      <AssetRow symbol="SOL-USDC" name="Solana" price="148.00" change={1.45} chartData={generateMockData(20, 140)} />
      <AssetRow symbol="XAU-USDC" name="现货黄金" price="148.00" change={-1.45} chartData={generateMockData(20, 148)} />
      <AssetRow symbol="SOL-USDC" name="Solana" price="148.00" change={1.45} chartData={generateMockData(20, 140)} />
      <AssetRow symbol="XAU-USDC" name="现货黄金" price="148.00" change={-1.45} chartData={generateMockData(20, 148)} />
      <AssetRow symbol="SOL-USDC" name="Solana" price="148.00" change={1.45} chartData={generateMockData(20, 140)} />
      <AssetRow symbol="XAU-USDC" name="现货黄金" price="148.00" change={-1.45} chartData={generateMockData(20, 148)} />
    </View>
  )
}
