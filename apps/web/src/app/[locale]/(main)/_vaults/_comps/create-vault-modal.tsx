import { create } from '@ebay/nice-modal-react'
import { useEffect } from 'react'
import { Form, useForm } from 'react-hook-form'
import { omit } from 'lodash-es'
import z from 'zod'

import { useNiceModal } from '@/components/providers/global/nice-modal-provider/hooks'
import { useMainAccount } from '@/hooks/user/use-main-account'
import { usePoolCreateVaultApiMutation } from '@/services/api/trade-core/hooks/follow-manage/pool-vault-create'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@mullet/ui/button'
import { FormControl, FormField, FormItem, FormMessage } from '@mullet/ui/form'
import { NumberInput, NumberInputSourceType } from '@mullet/ui/numberInput'
import { toast } from '@mullet/ui/toast'
import { BNumber } from '@mullet/utils/number'
import { useModel } from '@umijs/max'

const MIN_DEPOSIT_AMOUNT = 100
const PROFIT_SHARING_RATIO = 0.1
const CREATE_FEE = 100
const MIN_LIQUIDITY_RATIO = 0.05

export const CreateVaultModal = create((props: React.ComponentProps<typeof Modal>) => {
  const mainAccount = useMainAccount()
  const modal = useNiceModal()

  const formSchema = z.object({
    name: z.string().min(1, { message: '请输入金库名称' }),
    amount: z.string().refine(
      (val) => {
        return BNumber.from(val).gte(MIN_DEPOSIT_AMOUNT)
      },
      {
        message: `最低每笔存入${MIN_DEPOSIT_AMOUNT}USDC`,
      },
    ),
    remark: z.string(),

    // .refine(
    //   (val) => {
    //     return BNumber.from(val).lte(mainAccount?.money)
    //   },
    //   {
    //     message: `最大存入${mainAccount?.money}USDC`
    //   }
    // )
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', amount: '', remark: '' },
  })

  useEffect(() => {
    if (modal.visible) {
      form.reset()
    }
  }, [mainAccount])

  const { mutate: createVault, isPending } = usePoolCreateVaultApiMutation()
  const { fetchUserInfo } = useModel('user')

  const handleSubmitCreateVault = async (data: z.infer<typeof formSchema>) => {
    try {
      console.log('data', data)
      createVault(
        {
          followPoolName: data.name,
          initialMoney: Number(data.amount),
          mainAccountId: mainAccount?.id,
          redeemCloseOrder: true,
          remark: data.remark,
        },
        {
          onSuccess: async (data) => {
            if (data?.success) {
              toast.success('存款成功')
              form.reset()
              modal.hide()
              await fetchUserInfo()
            }
          },
          onError: (error) => {
            console.error(error)
            toast.error(error instanceof Error ? error.message : '存款失败')
          },
        },
      )
    } catch (error) {
      console.log('error', error)
    }
  }

  return (
    <Modal {...props} {...{ open: props.open ?? modal.visible, onOpenChange: props.onOpenChange ?? modal.setVisible }}>
      <ModalContent aria-describedby={undefined} className="gap-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitCreateVault)}>
            <ModalHeader>
              <ModalTitle className="">创建金库</ModalTitle>
            </ModalHeader>

            <div className="">
              <div className="text-[12px] text-[#9FA0B0]">
                你选择分发的金额将按每个存款用户比例发放到对应交易账户中。
              </div>

              <div className="mt-5">
                <FormField
                  control={form.control}
                  name={'name'}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex-1 space-y-2">
                          <Input placeholder="请创建您的金库名称" {...field} />

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
                  name={'remark'}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex-1 space-y-2">
                          <Textarea placeholder="请输入您的金库描述" {...field} />

                          <FormMessage />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="mt-2.5 text-[12px] text-[#9FA0B0]">描述为250个字符以内</div>
              </div>

              <div className="mt-5">
                <FormField
                  control={form.control}
                  name={'amount'}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex-1 space-y-2">
                          <NumberInput
                            placeholder="存款金额"
                            allowNegative={false}
                            min={MIN_DEPOSIT_AMOUNT}
                            max={mainAccount?.money}
                            onValueChange={({ value }, { source }) => {
                              if (source === NumberInputSourceType.EVENT) {
                                field.onChange(value)
                              }
                            }}
                            {...omit(field, 'onChange')}
                          />

                          <FormMessage />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-2.5 flex justify-between text-[12px]">
                <div className="text-[#9FA0B0]">交易账户可用余额</div>
                <div className="text-white">
                  {BNumber.toFormatNumber(mainAccount?.money, {
                    volScale: 2,
                    unit: 'USDC',
                  })}
                </div>
              </div>

              <div className="mt-5 text-[12px] text-[#9FA0B0]">
                <div>
                  首次创建金库您存入至少{BNumber.toFormatNumber(MIN_DEPOSIT_AMOUNT, { volScale: 2, unit: 'USDC' })}。
                </div>
                <div>作为创建者，您必须在金库中保持超过{BNumber.toFormatPercent(MIN_LIQUIDITY_RATIO)}的流动性。</div>
                <div>
                  金库创建费用为{BNumber.toFormatNumber(CREATE_FEE, { volScale: 2, unit: 'USDC' })}
                  ，金库关闭时不会退还。
                </div>
                <div>
                  创建者通过管理金库将会获得{BNumber.toFormatPercent(PROFIT_SHARING_RATIO, { volScale: 2 })}的利润分享。
                </div>
              </div>

              <Button block type="submit" className="mt-5" loading={form.formState.isSubmitting || isPending}>
                确定
              </Button>
            </div>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  )
})
