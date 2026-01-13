'use client'

import { Trans, useLingui } from '@lingui/react/macro'
import { Activity, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { isUndefined, omit } from 'lodash-es'
import z from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button, IconButton } from '@mullet/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@mullet/ui/form'
import { cn } from '@mullet/ui/lib/utils'
import { Modal, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle, ModalTrigger } from '@mullet/ui/modal'
import { NumberInput, NumberInputPrimitive, NumberInputSourceType } from '@mullet/ui/numberInput'
import { SliderTooltip } from '@mullet/ui/slider-tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@mullet/ui/tabs'
import { BNumber } from '@mullet/utils/number'

enum MarginMode {
  CROSS_MARGIN = 'CROSS_MARGIN',
  ISOLATED_MARGIN = 'ISOLATED_MARGIN',
}

export type AdjustMarginModalProps = {
  isOpen?: boolean
  onClose?: () => void
  children?: React.ReactNode
  onSettingLeverage?: (mode: MarginMode) => void
  defaultMode?: MarginMode
}

export const AdjustMarginModal = ({ isOpen, onClose, children }: AdjustMarginModalProps) => {
  enum AdjustMarginType {
    ADD = 'add',
    REDUCE = 'reduce',
  }

  const [selectedTab, setSelectedTab] = useState(AdjustMarginType.ADD)

  const TABS_OPTIONS = [
    {
      label: <Trans>增加保证金</Trans>,
      value: AdjustMarginType.ADD,
      content: <AddMarginModalContent />,
    },
    {
      label: <Trans>减少保证金</Trans>,
      value: AdjustMarginType.REDUCE,
      content: <ReduceMarginModalContent />,
    },
  ]

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      {children && <ModalTrigger asChild>{children}</ModalTrigger>}

      <ModalContent
        onInteractOutside={(event) => event.preventDefault()}
        className="flex min-h-[260px] w-full max-w-[360px] min-w-[360px]"
      >
        <ModalHeader className="w-full">
          <ModalTitle className="flex items-center justify-between gap-3">
            <div className={cn('')}>
              <Trans>调整保证金</Trans>
            </div>
          </ModalTitle>

          <Tabs value={selectedTab} className="mt-2xl" variant={'underline'} onValueChange={setSelectedTab}>
            <TabsList>
              {TABS_OPTIONS.map((option) => (
                <TabsTrigger key={option.value} value={option.value}>
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {TABS_OPTIONS.map((option) => (
              <Activity key={option.value} mode={option.value === selectedTab ? 'visible' : 'hidden'}>
                <TabsContent key={option.value} value={option.value} className="mt-2xl">
                  {option.content}
                </TabsContent>
              </Activity>
            ))}
          </Tabs>
        </ModalHeader>
      </ModalContent>
    </Modal>
  )
}

const AddMarginModalContent = () => {
  const balance = '56324.23'
  const { t } = useLingui()

  const formSchema = z.object({
    amount: z
      .string()
      .refine(
        (val) => {
          return BNumber.from(val).lte(balance)
        },
        {
          message: t`最大可新增${balance}USDC保证金`,
        },
      )
      .refine(
        (val) => {
          return BNumber.from(val).gte(0)
        },
        {
          message: t`保证金金额不能小于0`,
        },
      ),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: '' },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data)
  }

  return (
    <div className="gap-2xl flex flex-col">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => {
              const amountPercent = BNumber.from(field.value).div(balance).toPercent()
              return (
                <FormItem>
                  <FormControl>
                    <div className="space-y-2xl">
                      <NumberInput
                        placeholder={<Trans>0.00</Trans>}
                        labelText={<Trans>保证金</Trans>}
                        max={balance}
                        onValueChange={({ value }, { source }) => {
                          if (source === NumberInputSourceType.EVENT) {
                            field.onChange(value)
                          }
                        }}
                        hintLabel={<Trans>最多可增加约</Trans>}
                        hintValue={
                          <div>
                            {BNumber.toFormatNumber(balance, {
                              unit: 'USDC',
                              volScale: 2,
                            })}
                          </div>
                        }
                        {...omit(field, 'onChange')}
                      />
                      {/* <FormMessage /> */}

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
                        interval={100 / 5}
                        value={[amountPercent.decimalPlaces(0).toNumber()]}
                        onValueChange={(val) => {
                          const amount = BNumber.from(balance)
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
        </form>
      </Form>

      <div className="text-paragraph-p3 text-content-4">
        <Trans>系统需要执行一次链上交易来更新用户账户的保证金。因此会产生 Gas 费用。</Trans>
      </div>

      <ModalFooter>
        <Button block color="primary" size="md" loading={form.formState.isSubmitting} type="submit">
          <Trans>确定</Trans>
        </Button>
      </ModalFooter>
    </div>
  )
}

const ReduceMarginModalContent = () => {
  const availableMargin = '10000.00'

  const { t } = useLingui()
  const formSchema = z.object({
    amount: z
      .string()
      .refine(
        (val) => {
          return BNumber.from(val).lte(availableMargin)
        },
        {
          message: t`最大可减少${availableMargin}USDC保证金`,
        },
      )
      .refine(
        (val) => {
          return BNumber.from(val).gte(0)
        },
        {
          message: t`保证金金额不能小于0`,
        },
      ),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: '' },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data)
  }
  return (
    <div className="gap-2xl flex flex-col">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => {
              const amountPercent = BNumber.from(field.value).div(availableMargin).toPercent()
              return (
                <FormItem>
                  <FormControl>
                    <div className="space-y-2xl">
                      <NumberInput
                        placeholder={<Trans>0.00</Trans>}
                        labelText={<Trans>保证金</Trans>}
                        max={availableMargin}
                        onValueChange={({ value }, { source }) => {
                          if (source === NumberInputSourceType.EVENT) {
                            field.onChange(value)
                          }
                        }}
                        hintLabel={<Trans>最多可减少约</Trans>}
                        hintValue={
                          <div>
                            {BNumber.toFormatNumber(availableMargin, {
                              unit: 'USDC',
                              volScale: 2,
                            })}
                          </div>
                        }
                        {...omit(field, 'onChange')}
                      />
                      {/* <FormMessage /> */}

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
        </form>
      </Form>

      <div className="text-paragraph-p3 text-content-4">
        <Trans>系统需要执行一次链上交易来更新用户账户的保证金。因此会产生 Gas 费用。</Trans>
      </div>

      <ModalFooter>
        <Button block color="primary" size="md" loading={form.formState.isSubmitting} type="submit">
          <Trans>确定</Trans>
        </Button>
      </ModalFooter>
    </div>
  )
}
