import { Trans } from '@lingui/react/macro'
import { ScrollView, View } from 'react-native'

import { ScreenHeader } from '@/components/ui/screen-header'

import { DepositAddressSection } from './_comps/deposit-address-section'
import { TokenChainSelector } from './_comps/token-chain-selector'

export default function QrDepositScreen() {
  return (
    <View className="gap-xl flex-1">
      <ScreenHeader content={<Trans>扫码转入</Trans>} />

      <ScrollView className="pt-small flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-xl pb-4xl px-5">
          {/* 代币和网络选择 */}
          <TokenChainSelector />

          {/* 存款地址和注意事项 */}
          <DepositAddressSection />
        </View>
      </ScrollView>
    </View>
  )
}
