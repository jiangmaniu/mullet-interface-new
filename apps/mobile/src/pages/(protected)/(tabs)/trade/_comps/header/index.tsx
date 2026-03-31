import { observer } from 'mobx-react-lite'
import React, { useCallback, useState } from 'react'
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
import { useMarketQuoteInfoWithSub } from '@/hooks/market/use-market-quote'
import { cn } from '@/lib/utils'
import { useTradeSwitchActiveSymbol } from '@/pages/(protected)/(trade)/_hooks/use-trade-switch-symbol'
import { Account } from '@/services/tradeCore/account/typings'
import { useRootStore } from '@/stores'
import { useMarketSymbolInfo } from '@/stores/market-slice'
import { marketCurrentFavoriteSetSelector } from '@/stores/market-slice/favorite-slice'
import { userInfoActiveTradeAccountIdSelector } from '@/stores/user-slice/infoSlice'
import { getImgSource } from '@/utils/img'
import { BNumber } from '@mullet/utils/number'

import { CommonFeaturesDrawer } from './common-features-drawer'

interface TradeHeaderProps {
  symbol?: string
}

export const TradeHeader = observer(({ symbol }: TradeHeaderProps) => {
  const router = useRouter()
  const symbolInfo = useMarketSymbolInfo(symbol)
  const activeTradeAccountId = useRootStore(userInfoActiveTradeAccountIdSelector)

  const [isCommonFeaturesDrawerOpen, setIsCommonFeaturesDrawerOpen] = useState(false)
  const favoriteSet = useRootStore(marketCurrentFavoriteSetSelector)
  const isFavorite = favoriteSet.has(symbolInfo?.symbol ?? '')

  const handleViewChange = (view: 'chart' | 'depth') => {
    if (view === 'chart') {
      // Already on chart view, do nothing
      return
    } else {
      if (!symbolInfo) {
        return
      }
      // Navigate to symbol depth page with default symbol (e.g., SOL-USDC)
      router.push({ pathname: '/(protected)/(trade)/[symbol]', params: { symbol: symbolInfo?.symbol } })
    }
  }

  const handleMorePress = () => setIsCommonFeaturesDrawerOpen(true)

  return (
    <>
      <ScreenHeader
        showBackButton={false}
        left={<SymbolSelector symbol={symbol} />}
        right={
          <View className="gap-xl flex-row items-center">
            <View className={cn('border-brand-default flex-row overflow-hidden rounded-full border p-[3px]')}>
              <View
                // onPress={() => handleViewChange('chart')}
                className="bg-button h-[24px] w-[36px] items-center justify-center rounded-full"
              >
                <IconifyActivity width={22} height={22} className="text-content-1" />
              </View>
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
                  router.push({ pathname: '/(protected)/(trade)/settings' })
                }}
                onDeposit={() => {
                  setIsCommonFeaturesDrawerOpen(false)
                  router.push({
                    pathname: '/(protected)/(assets)/deposit',
                    params: { accountId: activeTradeAccountId },
                  })
                }}
                onTransfer={() => {
                  setIsCommonFeaturesDrawerOpen(false)
                  router.push({
                    pathname: '/(protected)/(assets)/transfer',
                    params: { accountId: activeTradeAccountId },
                  })
                }}
                onBill={() => {
                  setIsCommonFeaturesDrawerOpen(false)
                  router.push({
                    pathname: '/(protected)/(trade)/records',
                    params: { tab: 'funding-flow' },
                  })
                }}
                onFavorites={() => {
                  useRootStore.getState().market.favorite.toggleFavorite(symbolInfo?.symbol ?? '')
                }}
              />
            </>
          </View>
        }
      />
    </>
  )
})

export const SymbolSelector = observer(({ symbol }: { symbol?: string }) => {
  const [isSymbolSelectDrawerOpen, setIsSymbolSelectDrawerOpen] = useState(false)
  const { switchTradeActiveSymbol } = useTradeSwitchActiveSymbol()
  const symbolInfo = useMarketSymbolInfo(symbol)

  const symbolMarketInfo = useMarketQuoteInfoWithSub(symbolInfo?.symbol)
  const percentChangeInfo = parseRiseAndFallInfo(symbolMarketInfo?.percent)

  const handleSymbolPress = () => {
    setIsSymbolSelectDrawerOpen(true)
  }

  const handleSymbolSelect = useCallback(
    (symbolInfo: Account.TradeSymbolListItem) => {
      switchTradeActiveSymbol(symbolInfo?.symbol)
    },
    [switchTradeActiveSymbol],
  )

  return (
    <>
      <View className="gap-medium flex-row items-center">
        <Pressable onPress={handleSymbolPress} className="gap-medium flex-row items-center">
          <AvatarImage source={getImgSource(symbolInfo?.imgUrl)} className="size-[30px] flex-shrink-0 rounded-full" />
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
        selectedSymbol={symbolInfo?.symbol}
        onSelect={handleSymbolSelect}
      />
    </>
  )
})
