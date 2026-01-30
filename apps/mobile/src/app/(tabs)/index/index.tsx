import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AssetList } from './_comps/asset-list'
import { HomeHeader } from './_comps/home-header'
import { MarketOverview } from './_comps/market-overview'

export default function Index() {
  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <ScrollView>
        <HomeHeader />
        <ScrollView showsHorizontalScrollIndicator={false} horizontal>
          <MarketOverview />
        </ScrollView>

        <AssetList />
      </ScrollView>
    </SafeAreaView>
  )
}
