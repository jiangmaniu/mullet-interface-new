'use client'

import { Trans, useLingui } from '@lingui/react/macro'
import { observer } from 'mobx-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { isUndefined, omit } from 'lodash-es'
import z from 'zod'

import SymbolIcon from '@/components/Base/SymbolIcon'
import { useStores } from '@/context/mobxProvider'
import useTrade from '@/hooks/useTrade'
import { Alert, AlertDescription, AlertTitle } from '@/libs/ui/components/alert'
import { Form, FormControl, FormField, FormItem } from '@/libs/ui/components/form'
import { IconClose, IconInfo, IconMinus, IconPlus } from '@/libs/ui/components/icons'
import { NumberInput, NumberInputSourceType } from '@/libs/ui/components/number-input'
import { SliderTooltip } from '@/libs/ui/components/slider-tooltip'
import { toast } from '@/libs/ui/components/toast'
import { COMMON_PERCENT_DISPLAY_DECIMALS } from '@/libs/utils/format'
import { BNumber } from '@/libs/utils/number/b-number'
import { getBuySellInfo } from '@/utils/business'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, IconButton } from '@mullet/ui/button'
import { Checkbox } from '@mullet/ui/checkbox'
import { cn } from '@mullet/ui/lib/utils'
import { Modal, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle, ModalTrigger } from '@mullet/ui/modal'

import { TradeOrderDirectionEnum } from '../../_options/order'
import { IPendingItem } from '../records/PendingList'
import { IPositionItem } from '../records/PositionList'
import CurrentPrice from '../records/PositionList/_comps/CurrentPrice'

export type SettingPendingTpSlModalProps = {
  isOpen?: boolean
  onClose?: () => void
  children?: React.ReactNode
  onConfirm?: () => void
  pendingOrderInfo: IPendingItem
}

export const SettingPendingTpSlModal = observer(({ ...props }: SettingPendingTpSlModalProps) => {
  const { isOpen, onClose, onConfirm, children } = props

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
        </ModalHeader>
        {isOpen && <SettingPendingTpSlModalContent {...props} />}
      </ModalContent>
    </Modal>
  )
})

type SettingPendingTpSlModalContentProps = SettingPendingTpSlModalProps

const SettingPendingTpSlModalContent = observer(
  ({ pendingOrderInfo, onConfirm, onClose }: SettingPendingTpSlModalContentProps) => {
    const buySellInfo = getBuySellInfo(pendingOrderInfo)
    const isPositionDirectionBuy = TradeOrderDirectionEnum.BUY === pendingOrderInfo.buySell
    const { setSl, setSp, slFlag, spFlag, takeProfit, stopLoss, disabledBtnByCondition } = useTrade({
      limitStopItem: pendingOrderInfo,
    })
    const { trade } = useStores()

    console.log('tpsl:', slFlag, spFlag, takeProfit, stopLoss, disabledBtnByCondition)
    const { t } = useLingui()

    const handleEditPendingOrderTpSl = async () => {
      const msg = t`止盈止损设置错误`

      if (slFlag) {
        toast.error(msg)
        setSl(pendingOrderInfo.stopLoss)
        return
      }
      if (spFlag) {
        toast.error(msg)
        setSp(pendingOrderInfo.takeProfit)
        return
      }

      const params = {
        orderId: pendingOrderInfo.id,
        stopLoss: stopLoss ? Number(stopLoss) : undefined,
        takeProfit: takeProfit ? Number(takeProfit) : undefined,
        limitPrice: pendingOrderInfo.limitPrice,
      } as Order.UpdatePendingOrderParams

      console.log('修改挂单参数', params)

      // setLoading(true)
      const res = await trade.modifyPendingOrder(params)
      // .finally(() => {
      //   setLoading(false)
      // })

      if (res.success) {
      }
    }

    const formSchema = z.object({})

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {},
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
      try {
        await handleEditPendingOrderTpSl()
        await Promise.resolve(onConfirm?.())
        // 只有在 onConfirm 成功执行（没有抛出异常）时才关闭 modal
        onClose?.()
      } catch (error) {
        // onConfirm 抛出异常时，不关闭 modal，保持当前状态
        console.log('操作失败:', error)
      }
    }
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="gap-xl flex flex-col">
          <div className="py-2xl gap-2xl flex flex-1 flex-col">
            <div className="gap-2xl flex flex-col">
              <div className="gap-medium flex flex-col items-center">
                <div className="size-10 rounded-full">
                  <SymbolIcon src={pendingOrderInfo?.imgUrl || ''} width={40} height={40} />
                </div>
                <div className="text-paragraph-p1 flex gap-1">
                  <div className="text-white"> {pendingOrderInfo?.symbol}</div>
                  <div className={cn(isPositionDirectionBuy ? 'text-market-rise' : 'text-market-fall')}>
                    {buySellInfo.buySellText}
                  </div>
                  <div className={cn(isPositionDirectionBuy ? 'text-market-rise' : 'text-market-fall')}>
                    {buySellInfo?.leverageText}
                  </div>
                </div>
              </div>
              <div className="gap-2xl flex flex-col">
                <div className="flex justify-between gap-1">
                  <div className="text-paragraph-p2 text-content-4">
                    <Trans>挂单价</Trans>
                  </div>
                  <div className="text-paragraph-p2 text-market-rise">
                    {BNumber.toFormatNumber(pendingOrderInfo?.limitPrice)}
                  </div>
                </div>
                <div className="flex justify-between gap-1">
                  <div className="text-paragraph-p2 text-content-4">
                    <Trans>标记价格</Trans>
                  </div>
                  <div className="text-paragraph-p2 text-white">
                    <CurrentPrice item={pendingOrderInfo} />
                  </div>
                </div>

                <div className="gap-2xl flex flex-col">
                  <SetTakeProfit />
                  <SetStopLoss />
                </div>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button
              block
              color="primary"
              type="submit"
              size="md"
              loading={form.formState.isSubmitting}
              disabled={disabledBtnByCondition}
            >
              <Trans>确定</Trans>
            </Button>
          </ModalFooter>
        </form>
      </Form>
    )
  },
)

// 常量定义
const ZERO_PERCENT_PLACEHOLDER = `0.${'0'.repeat(COMMON_PERCENT_DISPLAY_DECIMALS)}`
const MAX_PERCENT = BNumber.from(`99.${'9'.repeat(COMMON_PERCENT_DISPLAY_DECIMALS)}`).toString()

/**
 * 根据多空方向获取百分比输入框的最大值
 * @param isBuy 是否做多
 * @param isTakeProfit 是否为止盈（true: 止盈, false: 止损）
 * @returns 最大值字符串，如果无限制则返回 undefined
 */
const getMaxPercent = (isBuy: boolean, isTakeProfit: boolean): string | undefined => {
  if (isTakeProfit) {
    // 止盈：开空时限制为 MAX_PERCENT，开多时无限制
    return !isBuy ? MAX_PERCENT : undefined
  } else {
    // 止损：开多时限制为 MAX_PERCENT，开空时无限制
    return isBuy ? MAX_PERCENT : undefined
  }
}

/**
 * 根据百分比计算止盈价格
 * @param percent 百分比字符串
 * @param isBuy 是否做多
 * @param sp_scope 止盈范围
 * @returns 止盈价格字符串，如果无效则返回空字符串
 */
const getTakeProfitPrice = (percent: string, isBuy: boolean, sp_scope: number, volScale: number): string => {
  if (!percent || !sp_scope) return ''

  const maxPercent = getMaxPercent(isBuy, true)
  const percentValue = BNumber.from(percent)

  // 如果超过最大值，返回空字符串
  if (maxPercent && percentValue.gt(maxPercent)) {
    return ''
  }

  const spRate = percentValue.div(100)
  if (spRate?.lte(0)) {
    return ''
  }

  const pricePercent = isBuy ? BNumber.from(1).plus(spRate) : BNumber.from(1).minus(spRate)

  const profitPrice = pricePercent.multipliedBy(sp_scope).decimalPlaces(volScale)
  if (profitPrice.lte(0)) {
    return ''
  }

  return profitPrice.toString()
}

/**
 * 根据百分比计算止损价格
 * @param percent 百分比字符串
 * @param isBuy 是否做多
 * @param sl_scope 止损范围
 * @returns 止损价格字符串，如果无效则返回空字符串
 */
const getStopLossPrice = (percent: string, isBuy: boolean, sl_scope: number, volScale: number): string => {
  if (!percent || !sl_scope) return ''

  const maxPercent = getMaxPercent(isBuy, false)
  const percentValue = BNumber.from(percent)

  // 如果超过最大值，返回空字符串
  if (maxPercent && percentValue.gt(maxPercent)) {
    return ''
  }

  const slRate = percentValue.div(100)
  if (slRate?.lte(0)) {
    return ''
  }

  // 止损逻辑与止盈相反：做多时价格下降，做空时价格上升
  const pricePercent = isBuy ? BNumber.from(1).minus(slRate) : BNumber.from(1).plus(slRate)
  const lossPrice = pricePercent.multipliedBy(sl_scope).decimalPlaces(volScale)
  if (lossPrice.lte(0)) {
    return ''
  }

  return lossPrice.toString()
}

const SetTakeProfit = observer(() => {
  let {
    disabledTrade,
    spValue,
    sp_scope,
    spPercent: tpPercent,
    setSpPercent: setTpPercent,
    isBuy,
    slValue,
    onSpAdd,
    onSpMinus,
    onSlAdd,
    onSlMinus,
    setSl,
    setSp,
  } = useTrade()
  const prevIsBuyRef = useRef(isBuy)

  // 当多空方向变化时，如果已输入百分比，重新计算止盈价格
  useEffect(() => {
    // 只有当 isBuy 真正发生变化时才重新计算
    if (prevIsBuyRef.current !== isBuy && tpPercent && sp_scope) {
      const price = getTakeProfitPrice(tpPercent, isBuy, sp_scope, 2)
      setSp(price)
    }
    // 更新 ref 为当前值
    prevIsBuyRef.current = isBuy
  }, [isBuy, tpPercent, sp_scope, setSp])

  return (
    <div className="gap-medium flex flex-col">
      <div className={'gap-xl flex flex-1 items-center'}>
        <div className="flex-1">
          <NumberInput
            min={0}
            decimalScale={2}
            value={spValue}
            placeholder={({ isFocused }) => {
              return <Trans>止盈价格</Trans>
            }}
            onValueChange={({ value }, { source }) => {
              if (source === NumberInputSourceType.EVENT) {
                setSp(value)

                // const diffPrice = isBuy ? BNumber.from(value).minus(sp_scope) : BNumber.from(sp_scope).minus(value)

                // const tpSlPercent = diffPrice?.gt(0)
                //   ? diffPrice?.div(sp_scope)?.multipliedBy(100)?.decimalPlaces(COMMON_PERCENT_DISPLAY_DECIMALS)?.toString()
                //   : '0'
              }
            }}
            size={'md'}
          />
        </div>

        <NumberInput
          className={'w-[80px]'}
          value={tpPercent}
          onValueChange={({ value, floatValue }, { source }) => {
            if (source === NumberInputSourceType.EVENT) {
              setTpPercent(value)
              const price = getTakeProfitPrice(value, isBuy, sp_scope, 2)
              setSp(price)
            }
          }}
          min={0}
          max={getMaxPercent(isBuy, true)}
          decimalScale={COMMON_PERCENT_DISPLAY_DECIMALS}
          size={'md'}
          labelText={<Trans>百分比</Trans>}
          placeholder={() => {
            return <>{ZERO_PERCENT_PLACEHOLDER}</>
          }}
          RightContent={'%'}
        />
      </div>
      <div>
        <SetTakeProfitLabel />
      </div>
    </div>
  )
})

const SetTakeProfitLabel = observer(() => {
  const { isBuy, sp_scope, spFlag, spValueEstimate } = useTrade()
  return (
    <div className="flex justify-between gap-2">
      <div className="text-paragraph-p3 flex items-start gap-1">
        <span className={cn(spFlag ? 'text-status-danger' : 'text-content-5')}>
          <Trans>范围</Trans>
        </span>
        <span className="text-content-1">
          {BNumber.toFormatNumber(sp_scope, {
            prefix: isBuy ? '≥' : '≤',
            volScale: 2,
          })}
        </span>
      </div>

      {!spFlag && spValueEstimate && (
        <div className="text-paragraph-p3 text-content-5 flex items-start gap-1">
          <Trans>预计盈利</Trans>
          <span className="text-market-rise">
            {BNumber.toFormatNumber(spValueEstimate, {
              volScale: 2,
              unit: 'USDC',
            })}
          </span>
        </div>
      )}
    </div>
  )
})

const SetStopLoss = observer(() => {
  let {
    disabledTrade,
    spValue,
    slPercent,
    setSlPercent,
    isBuy,
    slValue,
    onSpAdd,
    onSpMinus,
    sl_scope,
    onSlAdd,
    onSlMinus,
    setSl,
    setSp,
  } = useTrade()
  const prevIsBuyRef = useRef(isBuy)

  // 当多空方向变化时，如果已输入百分比，重新计算止损价格
  useEffect(() => {
    // 只有当 isBuy 真正发生变化时才重新计算
    if (prevIsBuyRef.current !== isBuy && slPercent && sl_scope) {
      const price = getStopLossPrice(slPercent, isBuy, sl_scope, 2)
      setSl(price)
    }
    // 更新 ref 为当前值
    prevIsBuyRef.current = isBuy
  }, [isBuy, slPercent, sl_scope, setSl])

  return (
    <div className="gap-medium flex flex-col">
      <div className={'gap-xl flex flex-1 items-center'}>
        <div className="flex-1">
          <NumberInput
            min={0}
            decimalScale={2}
            value={slValue}
            labelText={<Trans>止损价格</Trans>}
            onValueChange={({ value }, { source }) => {
              if (source === NumberInputSourceType.EVENT) {
                setSl(value)
              }
            }}
            size={'md'}
          />
        </div>

        <div className={'w-[80px]'}>
          <NumberInput
            min={0}
            max={getMaxPercent(isBuy, false)}
            decimalScale={COMMON_PERCENT_DISPLAY_DECIMALS}
            value={slPercent}
            onValueChange={({ value, floatValue }, { source }) => {
              if (source === NumberInputSourceType.EVENT) {
                setSlPercent(value)
                const price = getStopLossPrice(value, isBuy, sl_scope, 2)

                setSl(price)
              }
            }}
            size={'md'}
            labelText={<Trans>百分比</Trans>}
            placeholder={() => {
              return <>{ZERO_PERCENT_PLACEHOLDER}</>
            }}
            RightContent={'%'}
          />
        </div>
      </div>

      <div>
        <SetStopLossLabel />
      </div>
    </div>
  )
})
const SetStopLossLabel = observer(() => {
  const { isBuy, sl_scope, slFlag, slValueEstimate } = useTrade()
  return (
    <div className="flex justify-between gap-2">
      <div className="text-paragraph-p3 flex items-start gap-1">
        <span className={cn(slFlag ? 'text-status-danger' : 'text-content-4')}>
          <Trans>范围</Trans>
        </span>
        <span className="text-content-1">
          {BNumber.toFormatNumber(sl_scope, {
            prefix: isBuy ? '≤' : '≥',
            volScale: 2,
          })}
        </span>
      </div>

      {!slFlag && slValueEstimate && (
        <div className="text-paragraph-p3 text-content-5 flex items-start gap-1">
          <Trans>预计亏损</Trans>
          <span className="text-market-fall">
            {BNumber.toFormatNumber(slValueEstimate, {
              volScale: 2,
              unit: 'USDC',
            })}
          </span>
        </div>
      )}
    </div>
  )
})
