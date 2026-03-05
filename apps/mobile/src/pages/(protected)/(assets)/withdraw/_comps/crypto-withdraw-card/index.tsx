import { Trans } from '@lingui/react/macro'
import { Image, View } from 'react-native'
import { router } from 'expo-router'

import { IconSpinner } from '@/components/ui/icons'
import { IconBitcoin } from '@/components/ui/icons/set/bitcoin'

import { useWithdrawSupportedChains } from '../../_hooks/use-supported-chains'
import { DepositMethodCard } from '../../../deposit/_comps/method-card'

export function CryptoWithdrawCard() {
  const { data: chains, isLoading } = useWithdrawSupportedChains()
  const chainIcons = chains?.slice(0, 6) ?? []

  return (
    <DepositMethodCard
      icon={<IconBitcoin width={24} height={24} className="text-content-1" />}
      title={<Trans>加密货币取现</Trans>}
      subtitle={<Trans>无限制 · 即时</Trans>}
      rightContent={
        <View className="pr-xs flex-row items-center">
          {isLoading ? (
            <IconSpinner width={14} height={14} className="text-content-1" />
          ) : (
            chainIcons.map((chain, index) => (
              <View key={chain.chainId} className={index < chainIcons.length - 1 ? '-mr-1' : ''}>
                {chain.iconUrl ? <Image source={{ uri: chain.iconUrl }} style={{ width: 24, height: 24 }} /> : null}
              </View>
            ))
          )}
        </View>
      }
      onPress={() => router.push('/(assets)/withdraw/crypto')}
    />
  )
}
