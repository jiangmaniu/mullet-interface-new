import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'

import { SymbolSelectDrawer } from '@/components/drawers/symbol-select-drawer'
import { AvatarImage } from '@/components/ui/avatar'
import {
  IconifyActivity,
  IconifyCandlestickChart,
  IconifyMoreHoriz,
  IconifyNavArrowDownSolid,
} from '@/components/ui/icons'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'
import { parseRiseAndFallInfo } from '@/helpers/market'
import { renderFormatSymbolName } from '@/helpers/symbol'
import { cn } from '@/lib/utils'
import { getImgSource } from '@/utils/img'
import { useStores } from '@/v1/provider/mobxProvider'
import { Account } from '@/v1/services/tradeCore/account/typings'
import { subscribeCurrentAndPositionSymbol, useGetCurrentQuoteCallback } from '@/v1/utils/wsUtil'
import { BNumber } from '@mullet/utils/number'

import { CommonFeaturesDrawer } from './common-features-drawer'

interface TradeHeaderProps {
  symbol: string
}

export const TradeHeader = observer(({ symbol }: TradeHeaderProps) => {
  const router = useRouter()
  const { trade } = useStores()
  const symbolInfo = trade.getActiveSymbolInfo(symbol)

  const [isCommonFeaturesDrawerOpen, setIsCommonFeaturesDrawerOpen] = useState(false)
  const isFavorite = trade.favoriteList.some((item) => item.symbol === symbolInfo.symbol)

  const handleViewChange = useCallback(
    (view: 'chart' | 'depth') => {
      if (view === 'chart') {
        // Already on chart view, do nothing
        return
      } else {
        // Navigate to symbol depth page with default symbol (e.g., SOL-USDC)
        router.push('/SOL-USDC')
      }
    },
    [router],
  )

  const handleMorePress = () => setIsCommonFeaturesDrawerOpen(true)

  return (
    <>
      <ScreenHeader
        showBackButton={false}
        left={<SymbolSelector symbolInfo={symbolInfo} />}
        right={
          <View className="gap-xl flex-row items-center">
            <View className={cn('border-brand-default flex-row overflow-hidden rounded-full border p-[3px]')}>
              <Pressable
                onPress={() => handleViewChange('chart')}
                className="bg-button h-[24px] w-[36px] items-center justify-center rounded-full"
              >
                <IconifyActivity width={22} height={22} className="text-content-1" />
              </Pressable>
              <Pressable
                onPress={() => handleViewChange('depth')}
                className="h-[24px] w-[36px] items-center justify-center rounded-full"
              >
                <IconifyCandlestickChart width={22} height={22} className="text-brand-default" />
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

  const handleSymbolSelect = useCallback(
    (symbolInfo: Account.TradeSymbolListItem) => {
      trade.switchSymbol(symbolInfo.symbol)
      subscribeCurrentAndPositionSymbol({ cover: true })
    },
    [trade],
  )

  return (
    <>
      <View className="gap-medium flex-row items-center">
        <Pressable onPress={handleSymbolPress} className="gap-medium flex-row items-center">
          <AvatarImage source={getImgSource(symbolInfo.imgUrl)} className="size-[30px] flex-shrink-0 rounded-full" />
          <Text className="text-paragraph-p1 text-content-1 font-medium">{renderFormatSymbolName(symbolInfo)}</Text>
          <Text
            className={
              percentChangeInfo.isRise
                ? 'text-market-rise'
                : percentChangeInfo.isFall
                  ? 'text-market-fall'
                  : 'text-content-1'
            }
          >
            {BNumber.toFormatPercent(symbolMarketInfo?.percent, { forceSign: true, isRaw: false })}
          </Text>
          <IconifyNavArrowDownSolid width={16} height={16} className="text-content-1" />
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
