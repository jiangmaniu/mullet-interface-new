import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react'
import { useEffect, useRef, useState } from 'react'

import useTrade from '@/v1/hooks/useTrade'
import { useStores } from '@/v1/provider/mobxProvider'
import { cn } from '@mullet/ui/lib/utils'
import { NumberInput, NumberInputSourceType } from '@mullet/ui/number-input'
import { Switch } from '@mullet/ui/switch'
import { COMMON_PERCENT_DISPLAY_DECIMALS } from '@mullet/utils/format'
import { BNumber } from '@mullet/utils/number'

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

export const TradeActionPanelTpAndSl = observer(() => {
  const { trade, ws } = useStores()
  const { setOrderSpslChecked, orderSpslChecked, orderType, currentAccountInfo } = trade
  return (
    <div className="flex flex-col">
      {/* 止盈止损 */}
      <div className="">
        <Switch
          checked={orderSpslChecked}
          onCheckedChange={(checked: boolean) => {
            setOrderSpslChecked(checked)
            // 重置值
            trade.resetSpSl()
          }}
        >
          <Trans>止盈/止损</Trans>
        </Switch>
      </div>

      {/* 使用 CSS Grid 实现高度过渡动画 */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-in-out',
          orderSpslChecked ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className={cn('overflow-hidden', {})}>
          <div className="gap-xl pt-xl flex flex-col">
            <SetTakeProfit />
            <SetStopLoss />
          </div>
        </div>
      </div>
    </div>
  )
})

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

      {!spFlag && (
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

      {!slFlag && (
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
