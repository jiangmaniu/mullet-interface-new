import { useState, useCallback } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Stack, useRouter, usePathname } from 'expo-router'
import { Text } from '@/components/ui/text'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  IconifyActivity,
  IconifyCandlestickChart,
  IconifyMoreHoriz,
  IconifyNavArrowDownSolid,
  IconifyPageDown,
} from '@/components/ui/icons'
import { ScreenHeader } from '@/components/ui/screen-header'
import { cn } from '@/lib/utils'
import { IconStarFill } from '@/components/ui/icons/set/star-fill'
import { IconStar } from '@/components/ui/icons/set/star'
import { IconButton } from '@/components/ui/button'

interface TradeHeaderProps {
  symbol: string
  priceChange: string
  isPriceUp: boolean
  onSymbolPress?: () => void
  onChartToggle?: () => void
  isChartVisible: boolean
  isFavorite: boolean
  onFavoriteToggle?: () => void
}

function TradeHeader({
  symbol,
  priceChange,
  isPriceUp,
  onSymbolPress,
  onChartToggle,
  isChartVisible,
  isFavorite,
  onFavoriteToggle,
}: TradeHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const activeView = pathname.includes('/depth') ? 'depth' : 'chart'

  const handleViewChange = useCallback((view: 'chart' | 'depth') => {
    if (view === 'chart') {
      router.replace('/trade')
    } else {
      router.replace('/trade/depth')
    }
  }, [router])

  return (
    <ScreenHeader
      showBackButton={false}
      left={
        <View className="flex-row items-center gap-medium">
          <TouchableOpacity
            onPress={onSymbolPress}
            className="flex-row items-center gap-medium"
          >
            <Avatar className="size-[30px]">
              <AvatarFallback className="bg-[#9945FF]">
                <Text className="text-white text-xs">S</Text>
              </AvatarFallback>
            </Avatar>
            <Text className="text-paragraph-p1 text-content-1 font-medium">{symbol}</Text>
            <Text className={isPriceUp ? 'text-market-rise' : 'text-market-fall'}>
              {priceChange}
            </Text>
            <IconifyNavArrowDownSolid width={16} height={16} className='text-content-1' />
          </TouchableOpacity>

          {/* TODO: 显示K线/深度切换按钮 */}
          {!isChartVisible && (
            <IconButton onPress={onChartToggle}>
              <IconifyPageDown width={22} height={22} className='text-content-1' />
            </IconButton>
          )}
        </View>
      }
      right={
        <View className="flex-row items-center gap-xl">
          <View className={cn('flex-row rounded-full border border-brand-default overflow-hidden p-[3px]')}>
            <TouchableOpacity
              onPress={() => handleViewChange('chart')}
              className={`w-[36px] h-[24px] rounded-full justify-center items-center ${activeView === 'chart' ? 'bg-button' : ''}`}
            >
              <IconifyActivity width={22} height={22} className={activeView === 'chart' ? 'text-content-1' : 'text-content-4'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleViewChange('depth')}
              className={`w-[36px] h-[24px] rounded-full justify-center items-center ${activeView === 'depth' ? 'bg-button' : ''}`}
            >
              <IconifyCandlestickChart
                width={22}
                height={22}
                className={activeView === 'depth' ? 'text-content-1' : 'text-brand-default'}
              />
            </TouchableOpacity>
          </View>

          {activeView === 'chart' && <TouchableOpacity>
            <IconifyMoreHoriz width={22} height={22} className="text-content-1" />
          </TouchableOpacity>}

          {activeView === 'depth' && <TouchableOpacity onPress={onFavoriteToggle}>
            {isFavorite ? (
              <IconStarFill width={22} height={22} className="text-brand-primary" />
            ) : (
              <IconStar width={22} height={22} className="text-content-1" />
            )}
          </TouchableOpacity>}
        </View>
      }
    />
  )
}

export default function TradeLayout() {
  const [isChartVisible, setIsChartVisible] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  const handleChartToggle = useCallback(() => {
    setIsChartVisible((prev) => !prev)
  }, [])

  const handleFavoriteToggle = useCallback(() => {
    setIsFavorite((prev) => !prev)
  }, [])

  return (
    <View className="flex-1">
      <TradeHeader
        symbol="SOL-USDC"
        priceChange="+1.54%"
        isPriceUp={true}
        isChartVisible={isChartVisible}
        onChartToggle={handleChartToggle}
        isFavorite={isFavorite}
        onFavoriteToggle={handleFavoriteToggle}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      />
    </View>
  )
}
