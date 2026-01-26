import { View, Text } from 'react-native'
import { Trans } from '@lingui/react/macro'
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { IconDepth, IconDepthTB } from '@/components/ui/icons'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { AssetListView } from './asset-list-view'
import { AssetTradeView } from './asset-trade-view'

export function AssetList() {
  const [viewMode, setViewMode] = useState('list')
  const [activeTab, setActiveTab] = useState('all')

  const { colorMarketRise, colorMarketFall, colorBrandSecondary1 } = useThemeColors()

  return (
    <View className="flex-col gap-xl">
      <View className="flex-row items-center border-b border-brand-default">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 border-none">
            <TabsList variant="underline" size="md" className='border-b-0'>
                <TabsTrigger value="watchlist">
                    <Text className={cn('text-button-2 text-content-4', activeTab === 'watchlist' && 'text-content-1')}><Trans>自选</Trans></Text>
                </TabsTrigger>
                <TabsTrigger value="all">
                    <Text className={cn('text-button-2 text-content-4', activeTab === 'all' && 'text-content-1')}><Trans>全部</Trans></Text>
                </TabsTrigger>
                <TabsTrigger value="hot">
                     <Text className={cn('text-button-2 text-content-4', activeTab === 'hot' && 'text-content-1')}><Trans>热门</Trans></Text>
                </TabsTrigger>
                 <TabsTrigger value="gainers">
                     <Text className={cn('text-button-2 text-content-4', activeTab === 'gainers' && 'text-content-1')}><Trans>涨跌幅</Trans></Text>
                </TabsTrigger>
            </TabsList>
        </Tabs>

        <Tabs value={viewMode} onValueChange={setViewMode} className='flex-shrink-0'>
          <TabsList variant='icon' size='sm'>
            <TabsTrigger value="list" className='size-5'>
                <IconDepthTB width={12} height={12} color={viewMode === 'list' ? colorMarketFall : colorBrandSecondary1} />
            </TabsTrigger>
            <TabsTrigger value="trade" className='size-5'>
                  <IconDepth width={12} height={12} color={viewMode === 'trade' ? colorMarketFall : colorBrandSecondary1} primaryColor={viewMode === 'trade' ? colorMarketRise : colorBrandSecondary1} />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </View>
      
      {viewMode === 'list' ? <AssetListView /> : <AssetTradeView />}
    </View>
  )
}
