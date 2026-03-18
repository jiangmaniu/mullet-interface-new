import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

import { Button } from '@/components/ui/button'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'
import { USDC_TOKEN_SYMBOL, WITHDRAW_SOLANA_CHAIN_ID } from '@/constants/config/deposit'
import { useI18n } from '@/hooks/use-i18n'
import { msg } from '@lingui/core/macro'
import { BNumber } from '@mullet/utils/number'
import { isValidSolanaAddress } from '@mullet/web3/helpers'

import { useAccountExtractable } from '../_apis/use-account-extractable'
import { useSelectedWithdrawAccount } from '../_hooks/use-selected-account'
import { useSelectedChainInfo } from '../_hooks/use-selected-chain-info'
import { useWithdrawState } from '../_hooks/use-withdraw-state'
import { useDepositAddress } from '../../deposit/_apis/use-deposit-address'
import { TokenChainSelector } from './_comps/token-chain-selector'
import { WalletSelector } from './_comps/wallet-address-selector'

const CryptoWithdrawScreen = observer(function CryptoWithdrawScreen() {
  const selectedAccount = useSelectedWithdrawAccount()
  const { selectedTokenSymbol, selectedChainId, toWalletAddress } = useWithdrawState()
  const { chainInfo, tokenInfo } = useSelectedChainInfo()

  // 获取可提取余额
  const { data: extractableBalance } = useAccountExtractable(selectedAccount?.id)

  // 判断是否可以提交：必须有代币、链、且有地址
  const canSubmit = selectedTokenSymbol && selectedChainId && chainInfo && toWalletAddress.trim().length > 0

  const { data: accountWalletInfo } = useDepositAddress(selectedChainId, selectedAccount?.id)
  const { renderLinguiMsg } = useI18n()

  const handleConfirm = () => {
    if (!isValidSolanaAddress(toWalletAddress)) {
      toast.warning(renderLinguiMsg(msg`无效的钱包地址`))
      return
    } else if (toWalletAddress.toUpperCase() === accountWalletInfo?.address.toUpperCase()) {
      toast.warning(renderLinguiMsg(msg`接收的钱包地址不得与账户地址一致`))
      return
    }

    // 判断是否为 Solana 链
    const isSolanaChain = selectedChainId.toUpperCase() === WITHDRAW_SOLANA_CHAIN_ID.toUpperCase()

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
                {BNumber.toFormatNumber(extractableBalance, {
                  unit: selectedAccount?.currencyUnit,
                  volScale: selectedAccount?.currencyDecimal,
                })}
              </Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>
                最低取现
                {BNumber.toFormatNumber(chainInfo?.minWithdraw, {
                  unit: tokenInfo?.symbol,
                  volScale: tokenInfo?.displayDecimals,
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
              <Trans>继续</Trans>
            </Text>
          </Button>
        </View>
      </SafeAreaView>
    </View>
  )
})

export default CryptoWithdrawScreen
