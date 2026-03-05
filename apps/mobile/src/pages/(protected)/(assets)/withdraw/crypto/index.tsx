import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

import { Button } from '@/components/ui/button'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'
import { SOLANA_CHAIN_ID, USDC_TOKEN_SYMBOL } from '@/constants/config/deposit'
import { BNumber } from '@mullet/utils/number'

import { useWithdrawSupportedChains } from '../_hooks/use-supported-chains'
import { useWithdrawStore } from '../_store'
import { TokenChainSelector } from './_comps/token-chain-selector'
import { WalletSelector } from './_comps/wallet-address-selector'

const CryptoWithdrawScreen = observer(function CryptoWithdrawScreen() {
  const withdrawSourceAccount = useWithdrawStore((s) => s.withdrawSourceAccount)
  const selectedTokenSymbol = useWithdrawStore((s) => s.selectedTokenSymbol)
  const selectedChainId = useWithdrawStore((s) => s.selectedChainId)
  const withdrawAddress = useWithdrawStore((s) => s.withdrawAddress)
  const { data: supportedChains } = useWithdrawSupportedChains()
  const selectedChainInfo = supportedChains?.find((c) => c.chainId === selectedChainId)
  const selectedTokenInfo = selectedChainInfo?.supportedTokens.find((t) => t.symbol === selectedTokenSymbol)
  const selectedAccount = withdrawSourceAccount

  // 判断是否可以提交：必须有代币、链、且有地址
  const canSubmit = selectedTokenSymbol && selectedChainId && selectedChainInfo && withdrawAddress.trim().length > 0

  const handleConfirm = () => {
    // 判断是否为 Solana 链
    const isSolanaChain = selectedChainId === SOLANA_CHAIN_ID

    if (isSolanaChain) {
      // Solana 链：USDC 走钱包转账，非 USDC 走 Swap
      if (selectedTokenSymbol === USDC_TOKEN_SYMBOL) {
        router.push('/(assets)/withdraw/crypto/usdc')
      } else {
        router.push('/(assets)/withdraw/crypto/swap')
      }
    } else {
      // 非 Solana 链：走 Bridge 交易
      router.push('/(assets)/withdraw/crypto/bridge')
    }
  }

  return (
    <View className="gap-xl flex-1">
      <ScreenHeader content={<Trans>加密货币取现</Trans>} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-xl px-5">
          <View className="gap-medium pb-xl flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>
                余额：
                {BNumber.toFormatNumber(selectedAccount?.money, {
                  unit: selectedAccount?.currencyUnit,
                  volScale: selectedAccount?.currencyDecimal,
                })}
              </Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>
                最低取现
                {BNumber.toFormatNumber(selectedChainInfo?.minWithdraw, {
                  unit: selectedTokenInfo?.symbol,
                  volScale: selectedTokenInfo?.displayDecimals,
                })}
              </Trans>
            </Text>
          </View>

          {/* 代币和网络选择器 */}
          <TokenChainSelector />

          {/* 钱包选择器 */}
          <WalletSelector />
        </View>
      </ScrollView>
      <SafeAreaView edges={['bottom']}>
        <View className="py-3xl px-5">
          <Button block size="lg" color="primary" onPress={handleConfirm} disabled={!canSubmit}>
            <Text>
              <Trans>确定</Trans>
            </Text>
          </Button>
        </View>
      </SafeAreaView>
    </View>
  )
})

export default CryptoWithdrawScreen
