import { View, ScrollView, Pressable } from 'react-native'
import { Text } from '@/components/ui/text'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Trans } from '@lingui/react/macro'
import { cn } from '@/lib/utils'
import { useCSSVariable } from 'uniwind'
import { IconifyArrowUpCircleSolid, IconifyArrowDownCircleSolid } from '@/components/ui/icons'
import { IconCandlestickChart, IconCandlestickBottom } from '@/components/ui/icons/set'
import { Separator } from '@/components/ui/separator'
import { useTradeSettingsStore } from '@/stores/trade-settings'

export default function TradeSettingsScreen() {
  const {
    colorScheme,
    orderConfirmation,
    closeConfirmation,
    chartPosition,
    setColorScheme,
    setOrderConfirmation,
    setCloseConfirmation,
    setChartPosition,
  } = useTradeSettingsStore()

  const [tradeBuy, tradeSell] = useCSSVariable([
    '--color-trade-buy',
    '--color-trade-sell',
  ]) as [string, string]

  return (
    <View className="flex-1 bg-secondary gap-xl">
      {/* Header */}
      <ScreenHeader
        content={<Trans>交易设置</Trans>}
      />

      <View className='gap-xl'>
        {/* 订单确认 */}
        <View className="h-[48px] flex-row items-center justify-between px-xl">
          <Text className="text-paragraph-p2 text-content-1">
            <Trans>订单确认</Trans>
          </Text>
          <Switch checked={orderConfirmation} onCheckedChange={setOrderConfirmation} />
        </View>

        {/* 平仓确认 */}
        <View className="h-[48px] flex-row items-center justify-between px-xl">
          <Text className="text-paragraph-p2 text-content-1">
            <Trans>平仓确认</Trans>
          </Text>
          <Switch checked={closeConfirmation} onCheckedChange={setCloseConfirmation} />
        </View>

        {/* 涨跌颜色设置 */}
        <View className="gap-xl px-xl">
          {/* 绿涨红跌 */}
          <View className="h-[48px] flex-row items-center justify-between py-[10px]">
            <View className="flex-row items-center gap-medium">
              <Text className="text-paragraph-p2 text-content-1">
                <Trans>绿涨红跌</Trans>
              </Text>
              <View className="flex-row items-center gap-xs">
                {/* 绿色向上箭头 */}
                <IconifyArrowUpCircleSolid width={16} height={16} color="#2ebc84" />
                {/* 红色向下箭头 */}
                <IconifyArrowDownCircleSolid width={16} height={16} color="#ff112f" />
              </View>
            </View>
            <Checkbox
              checked={colorScheme === 'green-up'}
              onCheckedChange={() => setColorScheme('green-up', { tradeBuy, tradeSell })}
            />
          </View>

          {/* 红涨绿跌 */}
          <View className="h-[48px] flex-row items-center justify-between">
            <View className="flex-row items-center gap-medium">
              <Text className="text-paragraph-p2 text-content-1">
                <Trans>红涨绿跌</Trans>
              </Text>
              <View className="flex-row items-center gap-xs">
                {/* 红色向上箭头 */}
                <IconifyArrowUpCircleSolid width={16} height={16} color="#ff112f" />
                {/* 绿色向下箭头 */}
                <IconifyArrowDownCircleSolid width={16} height={16} color="#2ebc84" />
              </View>
            </View>
            <Checkbox
              checked={colorScheme === 'red-up'}
              onCheckedChange={() => setColorScheme('red-up', { tradeBuy, tradeSell })}
            />
          </View>
        </View>

        <Separator className="my-xl" />

        {/* K线标题 */}
        <View className="px-xl">
          <Text className="text-paragraph-p2 text-content-1">
            <Trans>K线</Trans>
          </Text>
        </View>

        {/* K线位置选择 */}
        <View className="flex-row gap-xl px-xl pb-xl">
          {/* 顶部选项 */}
          <View className="gap-xl items-center">
            <Pressable
              className={cn(
                'w-[110px] gap-xs px-[5px] py-xs rounded-small border border-transparent',
                chartPosition === 'top'
                  ? 'bg-move-in border-brand-important'
                  : 'bg-move-in'
              )}
              onPress={() => setChartPosition('top')}
            >
              {/* K线缩略图 - 顶部 */}
              <IconCandlestickChart width={99} height={46} />
              <IconCandlestickBottom width={99} height={74} />
            </Pressable>
            <Text
              className={cn(
                'text-paragraph-p2',
                chartPosition === 'top' ? 'text-content-1' : 'text-content-5'
              )}
            >
              <Trans>顶部</Trans>
            </Text>
          </View>

          {/* 底部选项 */}
          <View className="gap-xl items-center">
            <Pressable
              className={cn(
                'w-[110px] gap-xs px-[5px] py-xs rounded-small border border-transparent',
                chartPosition === 'bottom'
                  ? 'bg-move-in border border-brand-important'
                  : 'bg-move-in'
              )}
              onPress={() => setChartPosition('bottom')}
            >
              {/* K线缩略图 - 底部 */}
              <IconCandlestickBottom width={99} height={74} />
              <IconCandlestickChart width={99} height={46} />
            </Pressable>
            <Text
              className={cn(
                'text-paragraph-p2',
                chartPosition === 'bottom' ? 'text-content-1' : 'text-content-5'
              )}
            >
              <Trans>底部</Trans>
            </Text>
          </View>
        </View>
      </View>
    </View >
  )
}
