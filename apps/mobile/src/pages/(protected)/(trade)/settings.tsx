import { Trans } from '@lingui/react/macro'
import { Pressable, View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import { Checkbox } from '@/components/ui/checkbox'
import { IconifyArrowDownCircleSolid, IconifyArrowUpCircleSolid } from '@/components/ui/icons'
import { IconCandlestickBottom, IconCandlestickChart } from '@/components/ui/icons/set'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { useRootStore } from '@/stores'

export default function TradeSettingsScreen() {
  const setColorScheme = useRootStore((state) => state.trade.setting.setColorScheme)
  const setOrderConfirmation = useRootStore((state) => state.trade.setting.setOrderConfirmation)
  const setCloseConfirmation = useRootStore((state) => state.trade.setting.setCloseConfirmation)
  const setChartPosition = useRootStore((state) => state.trade.setting.setChartPosition)

  const { colorScheme, orderConfirmation, closeConfirmation, chartPosition } = useRootStore(
    useShallow((state) => ({
      colorScheme: state.trade.setting.colorScheme,
      orderConfirmation: state.trade.setting.orderConfirmation,
      closeConfirmation: state.trade.setting.closeConfirmation,
      chartPosition: state.trade.setting.chartPosition,
    })),
  )

  return (
    <View className="bg-secondary gap-xl flex-1">
      {/* Header */}
      <ScreenHeader content={<Trans>交易设置</Trans>} />

      <View className="gap-xl">
        {/* 订单确认 */}
        <View className="px-xl h-[48px] flex-row items-center justify-between">
          <Text className="text-paragraph-p2 text-content-1">
            <Trans>订单确认</Trans>
          </Text>
          <Switch checked={orderConfirmation} onCheckedChange={setOrderConfirmation} />
        </View>

        {/* 平仓确认 */}
        <View className="px-xl h-[48px] flex-row items-center justify-between">
          <Text className="text-paragraph-p2 text-content-1">
            <Trans>平仓确认</Trans>
          </Text>
          <Switch checked={closeConfirmation} onCheckedChange={setCloseConfirmation} />
        </View>

        {/* 涨跌颜色设置 */}
        <View className="gap-xl px-xl">
          {/* 绿涨红跌 */}
          <View className="h-[48px] flex-row items-center justify-between py-[10px]">
            <View className="gap-medium flex-row items-center">
              <Text className="text-paragraph-p2 text-content-1">
                <Trans>绿涨红跌</Trans>
              </Text>
              <View className="gap-xs flex-row items-center">
                {/* 绿色向上箭头 */}
                <IconifyArrowUpCircleSolid width={16} height={16} color="#2ebc84" />
                {/* 红色向下箭头 */}
                <IconifyArrowDownCircleSolid width={16} height={16} color="#ff112f" />
              </View>
            </View>
            <Checkbox checked={colorScheme === 'green-up'} onCheckedChange={() => setColorScheme('green-up')} />
          </View>

          {/* 红涨绿跌 */}
          <View className="h-[48px] flex-row items-center justify-between">
            <View className="gap-medium flex-row items-center">
              <Text className="text-paragraph-p2 text-content-1">
                <Trans>红涨绿跌</Trans>
              </Text>
              <View className="gap-xs flex-row items-center">
                {/* 红色向上箭头 */}
                <IconifyArrowUpCircleSolid width={16} height={16} color="#ff112f" />
                {/* 绿色向下箭头 */}
                <IconifyArrowDownCircleSolid width={16} height={16} color="#2ebc84" />
              </View>
            </View>
            <Checkbox checked={colorScheme === 'red-up'} onCheckedChange={() => setColorScheme('red-up')} />
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
        <View className="gap-xl px-xl pb-xl flex-row">
          {/* 顶部选项 */}
          <View className="gap-xl items-center">
            <Pressable
              className={cn(
                'gap-xs py-xs rounded-small w-[110px] border border-transparent px-[5px]',
                chartPosition === 'top' ? 'bg-move-in border-brand-important' : 'bg-move-in',
              )}
              onPress={() => setChartPosition('top')}
            >
              {/* K线缩略图 - 顶部 */}
              <IconCandlestickChart width={99} height={46} />
              <IconCandlestickBottom width={99} height={74} />
            </Pressable>
            <Text className={cn('text-paragraph-p2', chartPosition === 'top' ? 'text-content-1' : 'text-content-5')}>
              <Trans>顶部</Trans>
            </Text>
          </View>

          {/* 底部选项 */}
          <View className="gap-xl items-center">
            <Pressable
              className={cn(
                'gap-xs py-xs rounded-small w-[110px] border border-transparent px-[5px]',
                chartPosition === 'bottom' ? 'bg-move-in border-brand-important border' : 'bg-move-in',
              )}
              onPress={() => setChartPosition('bottom')}
            >
              {/* K线缩略图 - 底部 */}
              <IconCandlestickBottom width={99} height={74} />
              <IconCandlestickChart width={99} height={46} />
            </Pressable>
            <Text className={cn('text-paragraph-p2', chartPosition === 'bottom' ? 'text-content-1' : 'text-content-5')}>
              <Trans>底部</Trans>
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}
