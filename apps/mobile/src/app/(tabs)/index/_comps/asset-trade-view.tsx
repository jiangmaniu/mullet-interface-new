import { View } from 'react-native'
import { Trans } from '@lingui/react/macro'
import { Text } from '@/components/ui/text'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface AssetTradeRowProps {
  symbol: string
  name: string
  buyPrice: string
  sellPrice: string
  highPrice: string
  lowPrice: string
}

function AssetTradeRow({ symbol, name, buyPrice, sellPrice, highPrice, lowPrice }: AssetTradeRowProps) {
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
        {/* Middle: Buy Button */}
        <View className="gap-xs flex-1">
          <View className="bg-market-rise/15 border border-market-rise rounded-small flex-col items-center justify-center h-[24px]">
            <Text className="text-paragraph-p2 text-market-rise">{buyPrice}</Text>
          </View>
            <Text className="text-paragraph-p3 text-content-4">最高 {highPrice}</Text>
        </View>

        {/* Right: Sell Button */}
        <View className="gap-xs flex-1">
          <View className="bg-market-fall/15 border border-market-fall rounded-small flex-col items-center justify-center h-[24px]">
            <Text className="text-paragraph-p2 text-market-fall">{sellPrice}</Text>
          </View>
          <Text className="text-content-4 text-paragraph-p3 text-right">最低 {lowPrice}</Text>
        </View>
      </View>

    </View>
  )
}

export function AssetTradeView() {
  return (
    <View>
      <View className="flex-row items-center justify-between py-medium px-xl">
        <Text className="text-paragraph-p2 text-content-5 flex-1"><Trans>品类</Trans></Text>
        <View className='flex-row gap-xl flex-shrink-0'>
          <Text className="text-paragraph-p2 text-content-5 w-[90px]"><Trans>买价</Trans></Text>
          <Text className="text-paragraph-p2 text-content-5 w-[90px] text-right"><Trans>卖价</Trans></Text>
        </View>
      </View>
      <AssetTradeRow symbol="SOL-USDC" name="Solana" buyPrice="186.00" sellPrice="186.00" highPrice="180.00" lowPrice="180.00" />
      <AssetTradeRow symbol="XAU-USDC" name="现货黄金" buyPrice="486.00" sellPrice="486.00" highPrice="480.00" lowPrice="480.00" />
      <AssetTradeRow symbol="BTC-USDC" name="Bitcoin" buyPrice="198,652.0" sellPrice="198,186.00" highPrice="198,280.0" lowPrice="198,280.0" />
      <AssetTradeRow symbol="SOL-USDC" name="Solana" buyPrice="186.00" sellPrice="186.00" highPrice="180.00" lowPrice="180.00" />
      <AssetTradeRow symbol="SOL-USDC" name="Solana" buyPrice="186.00" sellPrice="186.00" highPrice="180.00" lowPrice="180.00" />
      <AssetTradeRow symbol="XAU-USDC" name="现货黄金" buyPrice="486.00" sellPrice="486.00" highPrice="480.00" lowPrice="480.00" />
      <AssetTradeRow symbol="BTC-USDC" name="Bitcoin" buyPrice="198,652.0" sellPrice="198,186.00" highPrice="198,280.0" lowPrice="198,280.0" />
      <AssetTradeRow symbol="SOL-USDC" name="Solana" buyPrice="186.00" sellPrice="186.00" highPrice="180.00" lowPrice="180.00" />
      <AssetTradeRow symbol="SOL-USDC" name="Solana" buyPrice="186.00" sellPrice="186.00" highPrice="180.00" lowPrice="180.00" />
      <AssetTradeRow symbol="XAU-USDC" name="现货黄金" buyPrice="486.00" sellPrice="486.00" highPrice="480.00" lowPrice="480.00" />
      <AssetTradeRow symbol="BTC-USDC" name="Bitcoin" buyPrice="198,652.0" sellPrice="198,186.00" highPrice="198,280.0" lowPrice="198,280.0" />
      <AssetTradeRow symbol="SOL-USDC" name="Solana" buyPrice="186.00" sellPrice="186.00" highPrice="180.00" lowPrice="180.00" />
    </View>
  )
}
