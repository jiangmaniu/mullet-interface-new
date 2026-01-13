'use client'

import { Trans, useLingui } from '@lingui/react/macro'
import { observer } from 'mobx-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { isUndefined, omit } from 'lodash-es'
import z from 'zod'

import SymbolIcon from '@/components/Base/SymbolIcon'
import { useStores } from '@/context/mobxProvider'
import { Alert, AlertDescription, AlertTitle } from '@/libs/ui/components/alert'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/libs/ui/components/form'
import { NumberInput, NumberInputSourceType } from '@/libs/ui/components/number-input'
import { SliderTooltip } from '@/libs/ui/components/slider-tooltip'
import { BNumber } from '@/libs/utils/number/b-number'
import { getBuySellInfo } from '@/utils/business'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, IconButton } from '@mullet/ui/button'
import { Checkbox } from '@mullet/ui/checkbox'
import { cn } from '@mullet/ui/lib/utils'
import { Modal, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle, ModalTrigger } from '@mullet/ui/modal'

import { TradeOrderDirectionEnum } from '../../_options/order'
import { IPositionItem } from '../records/PositionList'
import CurrentPrice from '../records/PositionList/_comps/CurrentPrice'

export type ClosePositionModalProps = {
  isOpen?: boolean
  onClose?: () => void
  children?: React.ReactNode
  onConfirm?: (data: { amount: string }) => void
  positionInfo: IPositionItem
}

export const ClosePositionModal = observer(
  ({ isOpen, onClose, onConfirm, children, positionInfo }: ClosePositionModalProps) => {
    const buySellInfo = getBuySellInfo(positionInfo)
    const isPositionDirectionBuy = TradeOrderDirectionEnum.BUY === positionInfo.buySell

    const volScale = 2
    const { trade } = useStores()
    const positionListSymbolCalcInfo = trade.positionListSymbolCalcInfo
    const calcInfo = positionListSymbolCalcInfo.get(positionInfo.id)
    const precision = trade.currentAccountInfo.currencyDecimal

    const { t } = useLingui()

    const unit = t`手`
    const formSchema = z.object({
      amount: z
        .string()
        .refine(
          (val) => {
            return BNumber.from(val).lte(positionInfo?.orderVolume)
          },
          {
            message: t`平仓数量不能大于可平仓数量`,
          },
        )
        .refine(
          (val) => {
            return BNumber.from(val).gt(0)
          },
          {
            // message: t`平仓数量不能小于${BNumber.toFormatNumber(min, { unit })}`
            message: t`请输入平仓数量`,
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
      // setIsLoading(true)
      try {
        await Promise.resolve(
          onConfirm?.({
            ...data,
          }),
        )
        onClose?.()
      } finally {
        // setIsLoading(false)
      }
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
                <Trans>平仓</Trans>
              </div>
            </ModalTitle>
          </ModalHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="py-2xl gap-2xl flex flex-1 flex-col">
                <div className="gap-2xl flex flex-col">
                  <div className="gap-medium flex flex-col items-center">
                    <div className="size-10 rounded-full bg-white">
                      <SymbolIcon src={positionInfo?.imgUrl || ''} width={40} height={40} />
                    </div>
                    <div className="text-paragraph-p1 flex gap-1">
                      <div className="text-white">{positionInfo?.symbol}</div>

                      <div className={cn(isPositionDirectionBuy ? 'text-market-rise' : 'text-market-fall')}>
                        {buySellInfo.buySellText}
                      </div>

                      <div className={cn(isPositionDirectionBuy ? 'text-market-rise' : 'text-market-fall')}>
                        {buySellInfo?.leverageText}
                      </div>
                    </div>
                  </div>
                  <div className="gap-medium flex flex-col">
                    <div className="flex justify-between gap-1">
                      <div className="text-paragraph-p2 text-content-4">
                        <Trans>开仓均价</Trans>
                      </div>
                      <div className="text-paragraph-p2 text-market-rise">
                        {BNumber.toFormatNumber(positionInfo?.startPrice)}
                      </div>
                    </div>
                    <div className="flex justify-between gap-1">
                      <div className="text-paragraph-p2 text-content-4">
                        <Trans>标记价格</Trans>
                      </div>
                      <div className="text-paragraph-p2 text-white">
                        <CurrentPrice item={positionInfo} />
                      </div>
                    </div>

                    <div>
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => {
                          const amountPercent = BNumber.from(field.value)?.div(positionInfo?.orderVolume)?.toPercent()
                          return (
                            <FormItem>
                              <FormControl>
                                <div className="space-y-2xl">
                                  <NumberInput
                                    placeholder={`0.${'0'.repeat(volScale)}`}
                                    labelText={<Trans>平仓数量</Trans>}
                                    max={positionInfo?.orderVolume}
                                    onValueChange={({ value }, { source }) => {
                                      if (source === NumberInputSourceType.EVENT) {
                                        field.onChange(value)
                                      }
                                    }}
                                    decimalScale={volScale}
                                    RightContent={<div className="text-white">{'手'}</div>}
                                    hintLabel={<Trans>可平仓数量</Trans>}
                                    hintValue={
                                      <div>
                                        {BNumber.toFormatNumber(positionInfo?.orderVolume, {
                                          unit: '手',
                                          volScale: volScale,
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
                                    isShowMarks
                                    isShowMarkLabels
                                    interval={100 / 5}
                                    value={[amountPercent?.decimalPlaces(0)?.toNumber() ?? 0]}
                                    onValueChange={(val) => {
                                      const amount = BNumber.from(positionInfo?.orderVolume)
                                        ?.multipliedBy(val[0]!)
                                        .div(100)
                                        .decimalPlaces(volScale)
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
                    </div>

                    <div className="flex justify-between gap-1">
                      <div className="text-paragraph-p2 text-content-4">
                        <Trans>预计盈亏</Trans>
                      </div>
                      <div
                        className={cn(
                          'text-paragraph-p2',
                          BNumber.from(calcInfo?.profit)?.gt(0)
                            ? 'text-market-rise'
                            : BNumber.from(calcInfo?.profit)?.lt(0)
                              ? 'text-market-fall'
                              : 'text-white',
                        )}
                      >
                        {BNumber.toFormatNumber(calcInfo?.profit, {
                          unit: 'USDC',
                          forceSign: true,
                          positive: false,
                          volScale: precision,
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <ModalFooter>
                <Button
                  block
                  type="submit"
                  color="primary"
                  size="md"
                  disabled={!form.formState.isValid}
                  loading={form.formState.isSubmitting}
                >
                  <Trans>确定</Trans>
                </Button>
              </ModalFooter>
            </form>
          </Form>
        </ModalContent>
      </Modal>
    )
  },
)
