'use client'

import { Trans, useLingui } from '@lingui/react/macro'
import { observer } from 'mobx-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { isUndefined, omit } from 'lodash-es'
import { observable } from 'mobx'
import z from 'zod'

import { useStores } from '@/context/mobxProvider'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/libs/ui/components/form'
import { NumberInput, NumberInputSourceType } from '@/libs/ui/components/number-input'
import { SliderTooltip } from '@/libs/ui/components/slider-tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/libs/ui/components/tabs'
import { toast } from '@/libs/ui/components/toast'
import { BNumber } from '@/libs/utils/number/b-number'
import { addMargin, extractMargin } from '@/services/api/tradeCore/order'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@mullet/ui/button'
import { cn } from '@mullet/ui/lib/utils'
import { Modal, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle, ModalTrigger } from '@mullet/ui/modal'
import { useModel } from '@umijs/max'

import { IPositionItem } from '../records/PositionList'

export type AdjustPositionMarginModalProps = {
  isOpen?: boolean
  onClose?: () => void
  children?: React.ReactNode
  onConfirm?: () => void
  positionInfo: IPositionItem
}

enum AdjustMarginTypeEnum {
  ADD = 'addMargin',
  REDUCE = 'extractMargin',
}

export const AdjustPositionMarginModal = observer((props: AdjustPositionMarginModalProps) => {
  const { isOpen, onClose, positionInfo, onConfirm, children } = props

  const [selectedTab, setSelectedTab] = useState(AdjustMarginTypeEnum.ADD)

  const TABS_OPTIONS = [
    {
      label: <Trans>增加保证金</Trans>,
      value: AdjustMarginTypeEnum.ADD,
      content: <AddMarginModalContent {...props} />,
    },
    {
      label: <Trans>减少保证金</Trans>,
      value: AdjustMarginTypeEnum.REDUCE,
      content: <ReduceMarginModalContent {...props} />,
    },
  ]

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      {children && <ModalTrigger asChild>{children}</ModalTrigger>}

      <ModalContent
        onInteractOutside={(event) => event.preventDefault()}
        className="gap-2xl flex min-h-[260px] w-full max-w-[360px] min-w-[360px]"
      >
        <ModalHeader className="w-full">
          <ModalTitle className="flex items-center justify-between gap-3">
            <div className={cn('')}>
              <Trans>调整保证金</Trans>
            </div>
          </ModalTitle>

          <Tabs value={selectedTab} size={'md'} variant={'underline'} onValueChange={setSelectedTab}>
            <TabsList>
              {TABS_OPTIONS.map((option) => (
                <TabsTrigger key={option.value} className="flex-1" value={option.value}>
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {TABS_OPTIONS.map((option) => (
              <TabsContent key={option.value} value={option.value} className="mt-2xl">
                {option.content}
              </TabsContent>
            ))}
          </Tabs>
        </ModalHeader>
      </ModalContent>
    </Modal>
  )
})

const AddMarginModalContent = observer(
  ({ isOpen, children, onClose, positionInfo, onConfirm }: AdjustPositionMarginModalProps) => {
    const { trade } = useStores()
    const { t } = useLingui()
    const { availableMargin } = trade.getAccountBalance()
    const precision = trade.currentAccountInfo.currencyDecimal

    const { fetchUserInfo } = useModel('user')

    const formSchema = z.object({
      amount: z
        .string()
        .refine(
          (val) => {
            return BNumber.from(val).lte(availableMargin)
          },
          {
            message: t`超过最大可增加的保证金`,
          },
        )
        .refine(
          (val) => {
            return BNumber.from(val).gt(0)
          },
          {
            message: t`请输入保证金金额`,
          },
        ),
    })

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: { amount: '' },
    })

    useEffect(() => {
      if (isOpen) {
        form.reset()
      }
    }, [isOpen])

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
      const params = {
        [AdjustMarginTypeEnum.ADD]: BNumber.from(data.amount).toNumber(),
        bagOrderId: positionInfo.id, // 持仓订单号
      }

      const res = await addMargin(params)
      const success = res.success
      if (success) {
        await trade.getPositionList()
        // 刷新账户信息
        await fetchUserInfo(true)
        toast.success(<Trans>添加保证金成功</Trans>)
        onClose?.()
      }
    }

    const unit = 'USDC'

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="gap-2xl flex flex-col">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => {
                const amountPercent = BNumber.from(field.value).div(BNumber.max(availableMargin, 1)).toPercent()
                return (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-2xl">
                        <NumberInput
                          placeholder={`0.${'0'.repeat(precision ?? 2)}`}
                          labelText={<Trans>保证金</Trans>}
                          max={availableMargin}
                          RightContent={<div className="text-white">{unit}</div>}
                          onValueChange={({ value }, { source }) => {
                            if (source === NumberInputSourceType.EVENT) {
                              field.onChange(value)
                            }
                          }}
                          hintLabel={<Trans>最多可增加约</Trans>}
                          hintValue={
                            <div>
                              {BNumber.toFormatNumber(availableMargin, {
                                unit: unit,
                                volScale: 2,
                              })}
                            </div>
                          }
                          {...omit(field, 'onChange')}
                        />
                        <FormMessage />

                        <SliderTooltip
                          min={0}
                          step={1}
                          max={100}
                          showTooltip={true}
                          tooltipFormat={([value]) => {
                            return <div className="text-white">{value}%</div>
                          }}
                          disabled={BNumber.from(availableMargin).lte(0)}
                          isShowMarks
                          isShowMarkLabels
                          interval={100 / 5}
                          value={[amountPercent.decimalPlaces(0).toNumber()]}
                          onValueChange={(val) => {
                            const amount = BNumber.from(availableMargin)
                              .multipliedBy(val[0]!)
                              .div(100)
                              .decimalPlaces(precision ?? 2)
                              .toString()

                            field.onChange(amount)
                          }}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )
              }}
            />

            <div className="text-paragraph-p3 text-content-4">
              <Trans>系统需要执行一次链上交易来更新用户账户的保证金。因此会产生 Gas 费用。</Trans>
            </div>

            <ModalFooter>
              <Button
                block
                color="primary"
                size="md"
                loading={form.formState.isSubmitting}
                disabled={!form.formState.isValid}
                type="submit"
              >
                <Trans>确定</Trans>
              </Button>
            </ModalFooter>
          </div>
        </form>
      </Form>
    )
  },
)

const ReduceMarginModalContent = observer(
  ({ isOpen, children, onClose, positionInfo, onConfirm }: AdjustPositionMarginModalProps) => {
    const { trade } = useStores()
    const precision = trade.currentAccountInfo.currencyDecimal
    console.log('positionInfo', positionInfo.orderMargin, positionInfo.orderBaseMargin)
    const availableMargin = BNumber.from(positionInfo.orderMargin ?? 0)?.minus(positionInfo.orderBaseMargin ?? 0)
    const { fetchUserInfo } = useModel('user')
    const { t } = useLingui()
    const formSchema = z.object({
      amount: z
        .string()
        .refine(
          (val) => {
            return BNumber.from(val).lte(availableMargin)
          },
          {
            message: t`超过最大可减少的保证金`,
          },
        )
        .refine(
          (val) => {
            return BNumber.from(val).gt(0)
          },
          {
            message: t`请输入保证金金额`,
          },
        ),
    })

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: { amount: '' },
    })

    useEffect(() => {
      if (isOpen) {
        form.reset()
      }
    }, [isOpen])

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
      const params = {
        [AdjustMarginTypeEnum.REDUCE]: BNumber.from(data.amount).toNumber(),
        bagOrderId: positionInfo.id, // 持仓订单号
      }

      const res = await extractMargin(params)
      const success = res.success
      if (success) {
        await trade.getPositionList()
        // 刷新账户信息
        await fetchUserInfo(true)

        toast.success(<Trans>减少保证金成功</Trans>)
        onClose?.()
      }
    }

    const unit = 'USDC'

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="gap-2xl flex flex-col">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => {
                const amountPercent = BNumber.from(field.value).div(BNumber.max(availableMargin, 1)).toPercent()

                return (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-2xl">
                        <NumberInput
                          placeholder={`0.${'0'.repeat(precision ?? 2)}`}
                          labelText={<Trans>保证金</Trans>}
                          max={availableMargin.toString()}
                          onValueChange={({ value }, { source }) => {
                            if (source === NumberInputSourceType.EVENT) {
                              field.onChange(value)
                            }
                          }}
                          hintLabel={<Trans>最多可减少约</Trans>}
                          hintValue={
                            <div>
                              {BNumber.toFormatNumber(availableMargin, {
                                unit: unit,
                                volScale: precision,
                              })}
                            </div>
                          }
                          RightContent={<div className="text-white">{unit}</div>}
                          {...omit(field, 'onChange')}
                        />
                        <FormMessage />

                        <SliderTooltip
                          min={0}
                          step={1}
                          max={100}
                          showTooltip={true}
                          tooltipFormat={([value]) => {
                            return <div className="text-white">{value}%</div>
                          }}
                          isShowMarks
                          isShowMarkLabels
                          disabled={BNumber.from(availableMargin).lte(0)}
                          interval={100 / 5}
                          value={[amountPercent.decimalPlaces(0).toNumber()]}
                          onValueChange={(val) => {
                            const amount = BNumber.from(availableMargin)
                              .multipliedBy(val[0]!)
                              .div(100)
                              .decimalPlaces(2)
                              .toString()

                            field.onChange(amount)
                          }}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )
              }}
            />

            <div className="text-paragraph-p3 text-content-4">
              <Trans>系统需要执行一次链上交易来更新用户账户的保证金。因此会产生 Gas 费用。</Trans>
            </div>

            <ModalFooter>
              <Button
                block
                color="primary"
                size="md"
                loading={form.formState.isSubmitting}
                disabled={!form.formState.isValid}
                type="submit"
              >
                <Trans>确定</Trans>
              </Button>
            </ModalFooter>
          </div>
        </form>
      </Form>
    )
  },
)
