import { getQueryClient } from '@/components/providers/global/react-query-provider/get-query-client'
import { useForm } from 'react-hook-form'
import z from 'zod'

import { TransactionStatusTrackingGlobalModalProps } from '@/components/providers/global/nice-modal-provider/global-modal'
import { useNiceModal } from '@/components/providers/global/nice-modal-provider/hooks'
import { GLOBAL_MODAL_ID } from '@/components/providers/global/nice-modal-provider/register'
import { IO_ASSETS_TOKEN_SYMBOL } from '@/constants/assets'
import { useLpPoolPrice } from '@/hooks/lp/use-lp-price'
import { useConnectedActiveWallet } from '@/hooks/wallet/use-wallet-instance'
import { BN } from '@coral-xyz/anchor'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@mullet/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@mullet/ui/form'
import { IconInfo } from '@mullet/ui/icons'
import { NumberInput, NumberInputSourceType } from '@mullet/ui/numberInput'
import { toast } from '@mullet/ui/toast'
import { formatAddress } from '@mullet/utils/format'
import { BNumber } from '@mullet/utils/number'
import { ChainId, getProgramConfigBySymbol, getTokenConfigBySymbol, ProgramSymbol } from '@mullet/web3/config'
import { web3QueryQueriesKey } from '@mullet/web3/constants'
import { useATATokenBalance, useSolExploreUrl, useWaitTransactionConfirm } from '@mullet/web3/hooks'
import { useLpSwapProgram } from '@mullet/web3/program'
import { getAssociatedTokenAddress, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

export default function VaultDetailDeposits() {
  const ioAssetsTokenConfig = getTokenConfigBySymbol(ChainId.SOL_DEVNET, IO_ASSETS_TOKEN_SYMBOL)

  const vaultProgramConfig = getProgramConfigBySymbol(ChainId.SOL_DEVNET, ProgramSymbol.VAULT)
  const activeWallet = useConnectedActiveWallet()

  const { data: balance, refetch: refetchBalance } = useATATokenBalance({
    ownerAddress: activeWallet?.address,
    mintAddress: ioAssetsTokenConfig.address,
  })

  const { getSolExplorerUrl } = useSolExploreUrl(ChainId.SOL_DEVNET)
  const formSchema = z.object({
    amount: z
      .string()
      // .refine(
      //   (val) => {
      //     return BNumber.from(val).gte(MIN_DEPOSIT_AMOUNT)
      //   },
      //   {
      //     message: `最低每笔存入${MIN_DEPOSIT_AMOUNT}USDC`
      //   }
      // )
      .refine(
        (val) => {
          return BNumber.from(val).lte(balance)
        },
        {
          message: `最大存入${BNumber.toFormatNumber(balance, {
            unit: ioAssetsTokenConfig.label,
            volScale: ioAssetsTokenConfig.volScale,
          })}`,
        },
      ),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: '' },
  })

  const { price, updatePrice } = useLpPoolPrice(ioAssetsTokenConfig.address)

  const waitTransactionConfirm = useWaitTransactionConfirm()
  const usdcAmount = BNumber.from(form.watch('amount'))
  const LpMintAmount = usdcAmount?.div(price)
  const transactionStatusTrackingDialog = useNiceModal<TransactionStatusTrackingGlobalModalProps>(
    GLOBAL_MODAL_ID.TransactionStatusTracking,
    {
      title: '存款申请',
      description: `正在申请 ${BNumber.toFormatNumber(usdcAmount, {
        unit: ioAssetsTokenConfig.label,
        volScale: ioAssetsTokenConfig.volScale,
      })} 存款`,
    },
  )

  const { getSignProgram } = useLpSwapProgram()
  const onSubmitDeposit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (!activeWallet?.address) {
        throw new Error('请先连接钱包')
      }
      const amountBigInt = BNumber.from(data.amount)
        .multipliedBy(10 ** 6)
        .integerValue()

      const userWalletPublicKey = new PublicKey(activeWallet.address)
      const usdcMintPublicKey = new PublicKey(ioAssetsTokenConfig.address)
      const purchaseUsdcAccount = await getAssociatedTokenAddress(
        usdcMintPublicKey,
        userWalletPublicKey,
        false,
        TOKEN_PROGRAM_ID,
      )

      const vaultAccountPublicKey = new PublicKey(vaultProgramConfig.address)
      const lpVault = getAssociatedTokenAddressSync(
        usdcMintPublicKey, // 代币 mint 地址
        vaultAccountPublicKey, // 所有者地址
        true, // allowOwnerOffCurve (设为 true 来允许离线曲线地址)
        TOKEN_PROGRAM_ID,
      )

      transactionStatusTrackingDialog.show({
        title: '存款申请',
        description: `正在申请 ${BNumber.toFormatNumber(usdcAmount, { volScale: 2, unit: 'USDC' })} 存款`,
      })

      const program = getSignProgram()
      let tx: string
      try {
        tx = await program.methods
          .purchaseMxlp(new BN(amountBigInt.toString()))
          .accounts({
            usdcMint: usdcMintPublicKey,
            lpVault: lpVault,
            purchaseUsdcAccount: purchaseUsdcAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc()
      } catch (error) {
        transactionStatusTrackingDialog.show({
          title: '存款申请',
          description: `正在申请 ${BNumber.toFormatNumber(usdcAmount, { volScale: ioAssetsTokenConfig.volScale, unit: ioAssetsTokenConfig.label })} 存款`,
          isError: true,
        })
        throw error
      }

      transactionStatusTrackingDialog.show({
        title: '存款申请',
        description: `正在申请 ${BNumber.toFormatNumber(usdcAmount, { volScale: ioAssetsTokenConfig.volScale, unit: ioAssetsTokenConfig.label })} 存款`,
        txHash: tx,
      })

      const txResponse = await waitTransactionConfirm(tx)

      if (txResponse) {
        form.reset()

        updatePrice()
        const queryClient = getQueryClient()
        queryClient.invalidateQueries({
          queryKey: web3QueryQueriesKey.sol.balance.ata.toKeyWithArgs({
            ownerAddress: activeWallet?.address,
            mintAddress: ioAssetsTokenConfig.address,
          }),
        })

        toast.success('存款成功', {
          description: (
            <div>
              查看交易：
              <a href={getSolExplorerUrl(tx)} target="_blank" rel="noreferrer" className="text-blue-400" title={tx}>
                {formatAddress(tx)}
              </a>
            </div>
          ),
        })
      }
    } catch (error: any) {
      console.error('💥 Deposit failed:', error)
      toast.error(error?.message)
    }
  }
  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitDeposit)}>
          <div className="flex justify-between text-[12px]">
            <div className="text-[#9FA0B0]">您的金额</div>
            <div className="text-white">
              {BNumber.toFormatNumber(balance, {
                unit: ioAssetsTokenConfig.label,
                volScale: ioAssetsTokenConfig.volScale,
              })}
            </div>
          </div>

          <div className="mt-3.5">
            <FormField
              control={form.control}
              name={'amount'}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex-1 space-y-2">
                      <NumberInput
                        allowNegative={false}
                        placeholder="金额"
                        RightContent={ioAssetsTokenConfig.label}
                        max={BNumber.from(balance)?.toString()}
                        onValueChange={({ value }, { source }) => {
                          if (source === NumberInputSourceType.EVENT) {
                            field.onChange(value)
                          }
                        }}
                        {...field}
                      />

                      <FormMessage />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="mt-3.5">
            <div className="flex justify-between text-[12px]">
              <div className="text-[#9FA0B0]">您将获得</div>
              <div className="text-white">{BNumber.toFormatNumber(LpMintAmount, { volScale: 2 })} MTLP</div>
            </div>
          </div>

          <div className="mt-3.5">
            <div className="flex justify-between text-[12px]">
              <div className="text-[#9FA0B0]">MTLP/USDC</div>
              <div className="text-white">
                1 MTLP ={' '}
                {BNumber.toFormatNumber(price, {
                  volScale: ioAssetsTokenConfig.volScale,
                  unit: ioAssetsTokenConfig.label,
                })}
              </div>
            </div>
          </div>

          <div className="mt-[30px]">
            <Button block type="submit" loading={form.formState.isSubmitting}>
              立即存款
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-[30px] flex items-start gap-2.5">
        <IconInfo className="size-4 text-[#FF8F34]" />

        <div className="flex-1 text-[12px] leading-normal text-[#9E9E9E]">
          <div>存入 USDC 以换取 MTLP，MTLP 是代表您在流动性池中的资产所有权的代币。</div>
          <div>作为所有交易的对手方，质押者从平台上的每笔交易中赚取费用。MTLP 实时累积这些费用。</div>
        </div>
      </div>
    </div>
  )
}
