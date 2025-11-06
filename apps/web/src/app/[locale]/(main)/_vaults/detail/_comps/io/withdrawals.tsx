import { NumberInput } from '@/components/input/number-input'
import { NumberInputSourceType } from '@/components/input/number-input-primitive'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Icons } from '@/components/ui/icons'
import SliderTooltip from '@/components/ui/slider-tooltip'
import { toast } from '@/components/ui/toast'
import { useMainAccount } from '@/hooks/user/use-main-account'
import { useRedeemSharesApiMutation } from '@/services/api/trade-core/hooks/follow-shares/redeem-shares'
import { BNumber } from '@/utils/b-number'
import { zodResolver } from '@hookform/resolvers/zod'
import { useModel } from '@umijs/max'
import { omit } from 'lodash-es'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { useVaultAccountNetValue } from '../../_hooks/use-vault-account-net-value'
import { useVaultDetail } from '../../_hooks/use-vault-detail'
import { useVaultSharePrice } from '../../_hooks/use-vault-share-price'
import { useVaultWithdrawTime } from '../../_hooks/use-vault-withdraw-time'

export default function VaultDetailWithdrawals() {
  const formSchema = z.object({
    amountPercent: z.string()
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { amountPercent: '' }
  })

  const { fetchUserInfo } = useModel('user')

  const sharePrice = useVaultSharePrice()
  const vaultNetValue = useVaultAccountNetValue()
  const amountPercent = form.watch('amountPercent')
  const estimatedWithdrawalAmount = BNumber.from(amountPercent).div(100).multipliedBy(vaultNetValue)

  const { vaultDetail } = useVaultDetail()
  const mainAccount = useMainAccount()

  const { canWithdraw, remainingTime, canWithdrawTime } = useVaultWithdrawTime({
    lastVisitedTime: vaultDetail?.followAccount?.lastVisitedTime
  })

  const { mutate: redeemShares, isPending } = useRedeemSharesApiMutation()
  const onSubmitWithdrawals = async (data: z.infer<typeof formSchema>) => {
    try {
      console.log('data', data)
      if (!vaultDetail) {
        throw new Error('金库信息不存在')
      }
      if (!mainAccount) {
        throw new Error('主账户不存在')
      }

      if (vaultDetail?.status === 'CLOSE') {
        throw new Error('金库已关闭')
      }

      // if (!canWithdraw) {
      //   throw new Error('尚未到达可提取时间')
      // }

      const estimatedWithdrawalShares = BNumber.from(estimatedWithdrawalAmount)?.div(sharePrice)

      if (!estimatedWithdrawalShares) {
        throw new Error('提取份额不能为空')
      }

      redeemShares(
        {
          sharesAmount: estimatedWithdrawalShares.toNumber(),
          followManageId: vaultDetail?.accountFollowShares?.followManageId,
          tradeAccountId: mainAccount.id
        },
        {
          onSuccess: async (data) => {
            if (data?.success) {
              await fetchUserInfo()
              toast.success('提取成功')
              form.reset()
            }
          },
          onError: (error) => {
            toast.error(error instanceof Error ? error.message : '提取失败')
          }
        }
      )
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : '提取失败')
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitWithdrawals)}>
          <div className="flex text-[12px] justify-between">
            <div className="text-[#9FA0B0]">您的金库净值</div>
            <div className=" text-white">≈{BNumber.toFormatNumber(vaultNetValue, { unit: 'USDC', volScale: 2 })}</div>
          </div>

          <div className="mt-4">
            <FormField
              control={form.control}
              name={'amountPercent'}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex-1 space-y-2">
                      <NumberInput
                        placeholder="金额"
                        allowNegative={false}
                        min={0}
                        max={100}
                        decimalScale={0}
                        onValueChange={({ value }, { source }) => {
                          if (source === NumberInputSourceType.EVENT) {
                            field.onChange(value)
                          }
                        }}
                        RightContent={'%'}
                        {...omit(field, 'onChange')}
                      />

                      <FormMessage />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="mt-4">
            <FormField
              control={form.control}
              name={'amountPercent'}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex-1 space-y-2">
                      <SliderTooltip
                        min={0}
                        step={1}
                        max={100}
                        {...field}
                        showTooltip={true}
                        tooltipFormat={([value]) => {
                          return <div className="text-white">{value}%</div>
                        }}
                        interval={100 / 5}
                        value={[BNumber.from(field.value).toNumber()]}
                        onValueChange={(val) => {
                          field.onChange(val[0].toString())
                        }}
                      />
                      <FormMessage />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex text-[12px] mt-[14px] justify-between">
            <div className="text-[#9FA0B0]">预计提取金额</div>
            <div className=" text-white">≈{BNumber.toFormatNumber(estimatedWithdrawalAmount, { unit: 'USDC', volScale: 2 })}</div>
          </div>

          <div className="mt-[30px]">
            <Button
              block
              type="submit"
              loading={isPending}
              // disabled={!canWithdraw && !!remainingTime}
            >
              {/* {!canWithdraw && !!remainingTime ? remainingTime : <>立即取现</>} */}
              立即取现
            </Button>
          </div>
        </form>
      </Form>
      <div className="mt-[30px] items-start gap-2.5 flex">
        <Icons.lucide.Info className="text-[#FF8F34] size-4" />

        <div className="text-[#9E9E9E] text-[12px]">
          <div>
            您的存款可以在 <span className="text-[#FF8F34]">{canWithdrawTime}</span> 之后提取。
          </div>
          <div>操作取款后会将资金划转到您的交易账户。</div>
        </div>
      </div>
    </div>
  )
}
