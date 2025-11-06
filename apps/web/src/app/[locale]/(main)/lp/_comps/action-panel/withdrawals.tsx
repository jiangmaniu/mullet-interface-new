import { getQueryClient } from '@/components/providers/global/react-query-provider/get-query-client'
// import { PublicKey } from '@solana/web3.js'
import { useForm } from 'react-hook-form'
import z from 'zod'

import { TransactionStatusTrackingGlobalModalProps } from '@/components/providers/global/nice-modal-provider/global-modal'
import { useNiceModal } from '@/components/providers/global/nice-modal-provider/hooks'
import { GLOBAL_MODAL_ID } from '@/components/providers/global/nice-modal-provider/register'
import { BN } from '@coral-xyz/anchor'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@mullet/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@mullet/ui/form'
import { IconInfo } from '@mullet/ui/icons'
import { NumberInput, NumberInputSourceType } from '@mullet/ui/numberInput'
import { toast } from '@mullet/ui/toast'
import { formatAddress } from '@mullet/utils/format'
// import { useStores } from '@/context/mobxProvider'
// import { useLpPoolPrice } from '@/hooks/lp/use-lp-price'
// import { useUserWallet } from '@/hooks/user/use-wallet-user'
// import { ATATokenBalanceOptionsQuery, useATATokenBalance } from '@/hooks/web3-query/use-ata-balance'
// import { useSolanaErrorHandler } from '@/hooks/web3/error-handler/use-solana-error-handler'
// import { useLpSwapProgram } from '@/hooks/web3/use-anchor-program'
// import { useSolExploreUrl } from '@/hooks/web3/use-sol-explore-url'
// import useConnection from '@/hooks/web3/useConnection'
// import { poolProgramAddress } from '@/libs/web3/constans/address'
// import { PoolSeed } from '@/libs/web3/constans/enum'
// import { web3QueryQueriesKey } from '@/libs/web3/constans/queries-cache-key'
// import { waitTransactionConfirm } from '@/libs/web3/helpers/tx'
import { BNumber } from '@mullet/utils/number'
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token'

export default function VaultDetailWithdrawals() {
  // const userWallet = useUserWallet()
  // const { trade } = useStores()
  // const currentAccountInfo = trade.currentAccountInfo
  // const usdcMintAddress = currentAccountInfo.mintAddress

  // const [lpMintAddress] = PublicKey.findProgramAddressSync([Buffer.from(PoolSeed.LPMint)], new PublicKey(poolProgramAddress))

  // const lpBalanceQuery: ATATokenBalanceOptionsQuery = {
  //   ownerAddress: userWallet?.address,
  //   mintAddress: lpMintAddress.toString()
  // }
  // const { data: lpBalance } = useATATokenBalance(lpBalanceQuery)

  const formSchema = z.object({
    amount: z.string(),
    // .refine(
    //   (val) => {
    //     return BNumber.from(val).lte(lpBalance)
    //   },
    //   {
    //     message: `最大取现${BNumber.toFormatNumber(lpBalance)} MTLP`
    //   }
    // )
  })

  // const { getSignProgram, program } = useLpSwapProgram()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: '' },
  })

  // const { price, updatePrice } = useLpPoolPrice(usdcMintAddress)
  const price = undefined
  const lpAmount = BNumber.from(form.watch('amount'))
  const usdcAmount = lpAmount?.multipliedBy(price)
  // const { connection } = useConnection()
  // const { getSolExplorerUrl } = useSolExploreUrl()

  const transactionStatusTrackingDialog = useNiceModal<TransactionStatusTrackingGlobalModalProps>(
    GLOBAL_MODAL_ID.TransactionStatusTracking,
    {
      title: '提款申请',
      description: `正在申请 ${BNumber.toFormatNumber(usdcAmount, { volScale: 2, unit: 'USDC' })} 提款`,
    },
  )

  // const { handleSolanaError } = useSolanaErrorHandler(program.idl)

  // const onSubmitWithdrawals = async (data: z.infer<typeof formSchema>) => {
  //   try {
  //     if (!userWallet?.address) {
  //       throw new Error('请先连接钱包')
  //     }

  //     const amountBigInt = BNumber.from(data.amount)
  //       .multipliedBy(10 ** 6)
  //       .integerValue()
  //     const program = getSignProgram()

  //     const userWalletPublicKey = new PublicKey(userWallet?.address)

  //     const redeemMxlpAccount = await getAssociatedTokenAddress(lpMintAddress, userWalletPublicKey, false, TOKEN_PROGRAM_ID)

  //     transactionStatusTrackingDialog.show()

  //     let tx: string
  //     try {
  //       tx = await program.methods
  //         .redeemMxlp(new BN(amountBigInt.toString()))
  //         .accounts({
  //           redeemMxlpAccount: redeemMxlpAccount,
  //           tokenProgram: TOKEN_PROGRAM_ID
  //         })
  //         .rpc()
  //     } catch (error) {
  //       transactionStatusTrackingDialog.show({
  //         isError: true
  //       })

  //       throw error
  //     }

  //     transactionStatusTrackingDialog.show({ txHash: tx })

  //     const txResponse = await waitTransactionConfirm(connection, tx)

  //     if (txResponse) {
  //       form.reset()

  //       updatePrice()
  //       const queryClient = getQueryClient()
  //       queryClient.invalidateQueries({
  //         queryKey: web3QueryQueriesKey.sol.balance.ata.toKeyWithArgs(lpBalanceQuery)
  //       })

  //       toast.success('交易已确认，等待审核', {
  //         description: (
  //           <div>
  //             查看交易哈希
  //             <a href={getSolExplorerUrl(tx)} target="_blank" rel="noreferrer" className="text-blue-400" title={tx}>
  //               {formatAddress(tx)}
  //             </a>
  //           </div>
  //         )
  //       })
  //     }
  //   } catch (error: any) {
  //     console.error(error)

  //     handleSolanaError(error)
  //   }
  // }
  const onSubmitWithdrawals = () => {}
  const lpBalance = undefined

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitWithdrawals)}>
          <div className="flex justify-between text-[12px]">
            <div className="text-[#9FA0B0]">您的份额</div>
            <div className="text-white">{BNumber.toFormatNumber(lpBalance, { volScale: 2 })} MTLP</div>
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
                        placeholder="取现份额"
                        RightContent={'MTLP'}
                        max={BNumber.from(lpBalance)?.toString()}
                        decimalScale={2}
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
              <div className="text-white">{BNumber.toFormatNumber(usdcAmount, { volScale: 2 })} USDC</div>
            </div>
          </div>

          <div className="mt-3.5">
            <div className="flex justify-between text-[12px]">
              <div className="text-[#9FA0B0]">MTLP/USDC</div>
              <div className="text-white">1 MTLP = {BNumber.toFormatNumber(price, { volScale: 2 })} USDC</div>
            </div>
          </div>

          <div className="mt-[30px]">
            <Button block type="submit" loading={form.formState.isSubmitting}>
              立即取现
            </Button>
          </div>
        </form>
      </Form>
      {/* <div className="mt-[30px] items-start gap-2.5 flex">
        <Icons.lucide.Info className="text-[#FF8F34] size-4" />

        <div className="text-[#9E9E9E] text-[12px]">
          <div>
            您的存款可以在 <span className="text-[#FF8F34]">2025/9/17 00:52:17</span> 之后提取。
          </div>
          <div>操作取款后会将资金划转到您的交易账户。</div>
        </div>
      </div> */}

      <div className="mt-[30px] flex items-start gap-2.5">
        <IconInfo className="size-4 text-[#FF8F34]" />

        <div className="flex-1 text-[12px] text-[#9E9E9E]">
          <div>申请取款后MTLP会暂时储存到合约中，并将会1~3天内自动发放到您的取款地址中。 </div>
        </div>
      </div>
    </div>
  )
}
