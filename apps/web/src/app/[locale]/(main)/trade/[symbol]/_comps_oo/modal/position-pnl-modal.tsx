'use client'

import { Trans, useLingui } from '@lingui/react/macro'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { isUndefined, omit } from 'lodash-es'
import z from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, AlertDescription, AlertTitle } from '@mullet/ui/alert'
import { Button, IconButton } from '@mullet/ui/button'
import { Checkbox } from '@mullet/ui/checkbox'
import { Form, FormControl, FormField, FormItem } from '@mullet/ui/form'
import { IconClose, IconInfo, IconMinus, IconPlus } from '@mullet/ui/icons'
import { cn } from '@mullet/ui/lib/utils'
import { Modal, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle, ModalTrigger } from '@mullet/ui/modal'
import { NumberInput, NumberInputSourceType } from '@mullet/ui/numberInput'
import { SliderTooltip } from '@mullet/ui/slider-tooltip'
import { BNumber } from '@mullet/utils/number'

export type PositionPnlModalProps = {
  isOpen?: boolean
  onClose?: () => void
  children?: React.ReactNode
  onConfirm?: () => void
}

export const PositionPnlModal = ({ isOpen, onClose, onConfirm, children }: PositionPnlModalProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await Promise.resolve(onConfirm?.())
      onClose?.()
    } finally {
      setIsLoading(false)
    }
  }

  const positionAmount = '10000.00'

  const { t } = useLingui()
  const formSchema = z.object({
    profitPrice: z
      .string()
      .refine(
        (val) => {
          return BNumber.from(val).lte(positionAmount)
        },
        {
          message: t`最大可减少${positionAmount}USDC保证金`,
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

    lossPrice: z
      .string()
      .refine(
        (val) => {
          return BNumber.from(val).lte(positionAmount)
        },
        {
          message: t`最大可减少${positionAmount}USDC保证金`,
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
    defaultValues: { profitPrice: '', lossPrice: '' },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data)
  }

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
              <Trans>设置止盈止损</Trans>
            </div>
          </ModalTitle>

          <div className="py-2xl gap-2xl flex flex-1 flex-col">
            <div className="gap-2xl flex flex-col">
              <div className="gap-medium flex flex-col items-center">
                <div className="size-10 rounded-full bg-white"></div>
                <div className="text-paragraph-p1 flex gap-1">
                  <div className="text-white"> solana</div>

                  <div className="text-market-fall">做空</div>

                  <div className="text-market-fall">10x</div>
                </div>
              </div>
              <div className="gap-2xl flex flex-col">
                <div className="flex justify-between gap-1">
                  <div className="text-paragraph-p2 text-content-4">
                    <Trans>开仓均价</Trans>
                  </div>
                  <div className="text-paragraph-p2 text-market-rise">100</div>
                </div>
                <div className="flex justify-between gap-1">
                  <div className="text-paragraph-p2 text-content-4">
                    <Trans>标记价格</Trans>
                  </div>
                  <div className="text-paragraph-p2 text-white">
                    {BNumber.toFormatNumber(100, { unit: 'USDC', volScale: 2 })}
                  </div>
                </div>

                <div>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="gap-xl flex flex-col">
                      <FormField
                        control={form.control}
                        name="profitPrice"
                        render={({ field }) => {
                          const amountPercent = BNumber.from(field.value).div(positionAmount).toPercent()
                          return (
                            <FormItem>
                              <FormControl>
                                <div className="gap-xl flex">
                                  <NumberInput
                                    placeholder={<Trans>止盈价格</Trans>}
                                    max={positionAmount}
                                    block
                                    onValueChange={({ value }, { source }) => {
                                      if (source === NumberInputSourceType.EVENT) {
                                        field.onChange(value)
                                      }
                                    }}
                                    {...omit(field, 'onChange')}
                                  />
                                  {/* <FormMessage /> */}
                                  <NumberInput
                                    className="max-w-[80px]"
                                    placeholder={<Trans>0.00</Trans>}
                                    labelText={<Trans>百分比</Trans>}
                                    RightContent={'%'}
                                    min={0}
                                    decimalScale={2}
                                    max={100}
                                    onValueChange={({ value }, { source }) => {
                                      if (source === NumberInputSourceType.EVENT) {
                                        const amount = BNumber.from(positionAmount)
                                          .multipliedBy(value)
                                          .div(100)
                                          .decimalPlaces(2)
                                          .toString()

                                        field.onChange(amount)
                                      }
                                    }}
                                    value={amountPercent.decimalPlaces(2).toString()}
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )
                        }}
                      />

                      <FormField
                        control={form.control}
                        name="lossPrice"
                        render={({ field }) => {
                          const amountPercent = BNumber.from(field.value).div(positionAmount).toPercent()
                          return (
                            <FormItem>
                              <FormControl>
                                <div className="gap-xl flex">
                                  <NumberInput
                                    placeholder={<Trans>止损价格</Trans>}
                                    block
                                    max={positionAmount}
                                    onValueChange={({ value }, { source }) => {
                                      if (source === NumberInputSourceType.EVENT) {
                                        field.onChange(value)
                                      }
                                    }}
                                    {...omit(field, 'onChange')}
                                  />
                                  {/* <FormMessage /> */}
                                  <NumberInput
                                    className="max-w-[80px]"
                                    placeholder={<Trans>0.00</Trans>}
                                    labelText={<Trans>百分比</Trans>}
                                    RightContent={'%'}
                                    min={0}
                                    max={100}
                                    decimalScale={2}
                                    onValueChange={({ value }, { source }) => {
                                      if (source === NumberInputSourceType.EVENT) {
                                        const amount = BNumber.from(positionAmount)
                                          .multipliedBy(value)
                                          .div(100)
                                          .decimalPlaces(2)
                                          .toString()

                                        field.onChange(amount)
                                      }
                                    }}
                                    value={amountPercent.decimalPlaces(2).toString()}
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )
                        }}
                      />
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button block color="primary" size="md" loading={isLoading} onClick={handleConfirm}>
              <Trans>确定</Trans>
            </Button>
          </ModalFooter>
        </ModalHeader>
      </ModalContent>
    </Modal>
  )
}
