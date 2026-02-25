import { observer } from "mobx-react-lite"

import { useState, useCallback } from 'react'
import { View, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Text } from '@/components/ui/text'
import {
  IconifyActivity,
  IconifyCandlestickChart,
  IconifyMoreHoriz,
  IconifyNavArrowDownSolid,
} from '@/components/ui/icons'
import { AvatarImage } from '@/components/ui/avatar'
import { ScreenHeader } from '@/components/ui/screen-header'
import { cn } from '@/lib/utils'
import { CommonFeaturesDrawer } from './common-features-drawer'
import { SymbolSelectDrawer } from '@/components/drawers/symbol-select-drawer'
import { getImgSource } from '@/utils/img'
import { useStores } from '@/v1/provider/mobxProvider'
import { BNumber } from '@mullet/utils/number'
import { useGetCurrentQuoteCallback, subscribeCurrentAndPositionSymbol } from '@/v1/utils/wsUtil'
import { parseRiseAndFallInfo } from '@/helpers/market'

interface TradeHeaderProps {
  symbol: string
}

export const TradeHeader = observer(({ symbol }: TradeHeaderProps) => {
  const router = useRouter()
  const { trade } = useStores()
  const symbolInfo = trade.getActiveSymbolInfo(symbol)

  const [isCommonFeaturesDrawerOpen, setIsCommonFeaturesDrawerOpen] = useState(false)
  const isFavorite = trade.favoriteList.some((item) => item.symbol === symbolInfo.symbol)


  const handleViewChange = useCallback((view: 'chart' | 'depth') => {
    if (view === 'chart') {
      // Already on chart view, do nothing
      return
    } else {
      // Navigate to symbol depth page with default symbol (e.g., SOL-USDC)
      router.push('/SOL-USDC')
    }
  }, [router])

  const handleMorePress = () => setIsCommonFeaturesDrawerOpen(true)

  return (
    <>
      <ScreenHeader
        showBackButton={false}
        left={
          <SymbolSelector symbolInfo={symbolInfo} />
        }
        right={
          <View className="flex-row items-center gap-xl">
            <View className={cn('flex-row rounded-full border border-brand-default overflow-hidden p-[3px]')}>
              <Pressable
                onPress={() => handleViewChange('chart')}
                className="w-[36px] h-[24px] rounded-full justify-center items-center bg-button"
              >
                <IconifyActivity width={22} height={22} className="text-content-1" />
              </Pressable>
              <Pressable
                onPress={() => handleViewChange('depth')}
                className="w-[36px] h-[24px] rounded-full justify-center items-center"
              >
                <IconifyCandlestickChart
                  width={22}
                  height={22}
                  className="text-brand-default"
                />
              </Pressable>
            </View>

            <>
              <Pressable onPress={handleMorePress}>
                <IconifyMoreHoriz width={22} height={22} className="text-content-1" />
              </Pressable>

              {/* Common Features Drawer */}
              <CommonFeaturesDrawer
                isFavorite={isFavorite}
                open={isCommonFeaturesDrawerOpen}
                onOpenChange={setIsCommonFeaturesDrawerOpen}
                onTradingSettings={() => {
                  setIsCommonFeaturesDrawerOpen(false)
                  router.push('/(trade)/settings')
                }}
                onDeposit={() => {
                  setIsCommonFeaturesDrawerOpen(false)
                  // TODO: 实现入金功能
                  console.log('Deposit pressed')
                }}
                onTransfer={() => {
                  setIsCommonFeaturesDrawerOpen(false)
                  router.push('/(assets)/transfer')
                }}
                onBill={() => {
                  setIsCommonFeaturesDrawerOpen(false)
                  router.push('/(trade)/records')
                }}
                onFavorites={() => {
                  trade.toggleSymbolFavorite(symbolInfo.symbol)
                }}
              />
            </>
          </View>
        }
      />
    </>
  )
})

const SymbolSelector = observer(({ symbolInfo }: { symbolInfo: Account.TradeSymbolListItem }) => {
  const { trade } = useStores()
  const [isSymbolSelectDrawerOpen, setIsSymbolSelectDrawerOpen] = useState(false)

  const getCurrentQuote = useGetCurrentQuoteCallback()
  const symbolMarketInfo = getCurrentQuote(symbolInfo.symbol)
  const percentChangeInfo = parseRiseAndFallInfo(symbolMarketInfo.percent)

  const handleSymbolPress = () => {
    setIsSymbolSelectDrawerOpen(true)
  }

  const handleSymbolSelect = useCallback((symbolInfo: Account.TradeSymbolListItem) => {
    trade.switchSymbol(symbolInfo.symbol)
    subscribeCurrentAndPositionSymbol({ cover: true })
  }, [trade])

  return (
    <>
      <View className="flex-row items-center gap-medium">
        <Pressable
          onPress={handleSymbolPress}
          className="flex-row items-center gap-medium"
        >
          <AvatarImage source={getImgSource(symbolInfo.imgUrl)} className="size-[30px] flex-shrink-0 rounded-full" />
          <Text className="text-paragraph-p1 text-content-1 font-medium">{symbolInfo.symbol}</Text>
          <Text className={percentChangeInfo.isRise ? 'text-market-rise' : percentChangeInfo.isFall ? 'text-market-fall' : 'text-content-1'}>
            {BNumber.toFormatPercent(symbolMarketInfo?.percent, { forceSign: true, isRaw: false })}
          </Text>
          <IconifyNavArrowDownSolid width={16} height={16} className='text-content-1' />
        </Pressable>
      </View>

      <SymbolSelectDrawer
        visible={isSymbolSelectDrawerOpen}
        onClose={() => setIsSymbolSelectDrawerOpen(false)}
        selectedSymbol={symbolInfo.symbol}
        onSelect={handleSymbolSelect}
      />
    </>
  )
})
