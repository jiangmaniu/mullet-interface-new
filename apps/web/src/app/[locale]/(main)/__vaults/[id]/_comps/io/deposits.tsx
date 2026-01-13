import { useForm } from 'react-hook-form'
import { omit } from 'lodash-es'
import z from 'zod'

// import { useMainAccount } from '@/hooks/user/use-main-account'
import { usePurchaseSharesApiMutation } from '@/services/api/trade-core/hooks/follow-shares/purchase-shares'
import { FollowShares } from '@/services/api/trade-core/instance/_gen'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@mullet/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@mullet/ui/form'
import { IconInfo } from '@mullet/ui/icons'
import { NumberInput } from '@mullet/ui/numberInput'
import { toast } from '@mullet/ui/toast'
import { BNumber } from '@mullet/utils/number'

// import { useModel } from '@umijs/max'

import { useVaultDetail } from '../../_hooks/use-vault-detail'

const MIN_DEPOSIT_AMOUNT = 5
const DEPOSIT_LOCK_PERIOD = 1 // 天

export default function VaultDetailDeposits() {
  const { vaultDetail } = useVaultDetail()
  // const mainAccount = useMainAccount()

  const mainAccount = {} as any
  // const { fetchUserInfo } = useModel('user')
  const fetchUserInfo = () => {}

  const formSchema = z.object({
    amount: z
      .string()
      .refine(
        (val) => {
          return BNumber.from(val).gte(MIN_DEPOSIT_AMOUNT)
        },
        {
          message: `最低每笔存入${MIN_DEPOSIT_AMOUNT}USDC`,
        },
      )
      .refine(
        (val) => {
          return BNumber.from(val).lte(mainAccount?.money)
        },
        {
          message: `最大存入${mainAccount?.money}USDC`,
        },
      ),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: '' },
  })

  const { mutate: purchaseShares, isPending } = usePurchaseSharesApiMutation()
  const onSubmitDeposit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (!vaultDetail) {
        throw new Error('金库信息不存在')
      }

      if (vaultDetail?.status === 'CLOSE') {
        throw new Error('金库已关闭')
      }

      if (!mainAccount) {
        throw new Error('主账户不存在')
      }

      const bodyData: FollowShares.PostFollowSharesPurchaseShares.RequestBody = {
        purchaseMoney: Number(data.amount),
        followManageId: vaultDetail.id,
        tradeAccountId: mainAccount.id,
      }
      purchaseShares(bodyData, {
        onSuccess: async (data) => {
          if (data?.success) {
            await fetchUserInfo()

            toast.success('存款成功')
            form.reset()
          }
        },
        onError: (error) => {
          console.error(error)
          toast.error(error instanceof Error ? error.message : '存款失败')
        },
      })
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : '存款失败')
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitDeposit)}>
          <div className="flex justify-between text-[12px]">
            <div className="text-[#9FA0B0]">您的交易账户余额</div>
            <div className="text-white">
              {BNumber.toFormatNumber(mainAccount?.money, {
                volScale: 2,
                unit: 'USDC',
              })}
            </div>
          </div>

          <div className="mt-4">
            <FormField
              control={form.control}
              name={'amount'}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex-1 space-y-2">
                      <NumberInput
                        placeholder="金额"
                        min={MIN_DEPOSIT_AMOUNT}
                        decimalScale={2}
                        allowNegative={false}
                        max={mainAccount?.money}
                        onValueChange={({ value }, { source }) => {
                          field.onChange(value)
                        }}
                        {...omit(field, ['onChange'])}
                      />

                      <FormMessage />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="mt-[30px]">
            <Button block type="submit" loading={isPending}>
              立即存款
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-[30px] flex items-center gap-2.5">
        <IconInfo className="size-4 text-[#FF8F34]" />

        <span className="text-[12px] leading-normal text-[#9E9E9E]">
          最低每笔存入{MIN_DEPOSIT_AMOUNT}USDC，每次存款后锁定期为{DEPOSIT_LOCK_PERIOD}天。
        </span>
      </div>
    </div>
  )
}
