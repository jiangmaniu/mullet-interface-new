import { useEffect } from 'react'
import { Form, useForm } from 'react-hook-form'
import { omit } from 'lodash-es'
import z from 'zod'

import { usePoolVaultDivvyApiMutation } from '@/services/api/trade-core/hooks/follow-manage/pool-vault-divvy'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@mullet/ui/button'
import { FormControl, FormField, FormItem, FormMessage } from '@mullet/ui/form'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@mullet/ui/modal'
import { NumberInput, NumberInputSourceType } from '@mullet/ui/numberInput'
import { toast } from '@mullet/ui/toast'
import { BNumber } from '@mullet/utils/number'

// import { useModel } from '@umijs/max'

import { useVaultAvailableBalance } from '../../../_hooks/use-vault-available-balance'
import { useVaultDetail } from '../../../_hooks/use-vault-detail'

export const DistributeModal = (props: React.ComponentProps<typeof Modal>) => {
  const availableBalance = useVaultAvailableBalance()
  const { vaultDetail } = useVaultDetail()
  // const { fetchUserInfo } = useModel('user')
  const fetchUserInfo = () => {}
  const formSchema = z.object({
    amount: z.string(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: '' },
  })

  useEffect(() => {
    if (props.open) {
      form.reset()
    }
  }, [props.open])

  const { mutate: divvyVaultApiMutation, isPending } = usePoolVaultDivvyApiMutation()

  const handleSubmitDistribute = async (data: z.infer<typeof formSchema>) => {
    divvyVaultApiMutation(
      {
        followManageId: vaultDetail?.id,
        divvyMoney: BNumber.from(data.amount).toNumber(),
      },
      {
        onSuccess: async () => {
          toast.success('分发成功')
          props.onOpenChange?.(false)

          await fetchUserInfo()
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : '分发失败')
        },
      },
    )
  }
  return (
    <Modal {...props}>
      <ModalContent aria-describedby={undefined} className="gap-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitDistribute)}>
            <ModalHeader>
              <ModalTitle className="">分发</ModalTitle>
            </ModalHeader>

            <div className="">
              <div className="text-[12px] text-[#9FA0B0]">
                你选择分发的金额将按每个存款用户比例发放到对应交易账户中。
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
                            // min={MIN_DEPOSIT_AMOUNT}
                            allowNegative={false}
                            max={availableBalance}
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
                <div className="text-[#9FA0B0]">金库可用余额</div>
                <div className="text-white">{BNumber.toFormatNumber(availableBalance, { volScale: 2 })} USDC</div>
              </div>

              <Button block className="mt-[30px]" type="submit" loading={isPending}>
                确定
              </Button>
            </div>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  )
}
