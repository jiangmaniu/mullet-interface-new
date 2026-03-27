import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useDebounce } from 'ahooks'

import { OrderCreateTypeEnum } from '@/options/trade/order'
import { useRootStore } from '@/stores'
import {
  tradeFormDataAmountSelector,
  tradeFormDataDirectionSelector,
  tradeFormDataLimitPriceSelector,
  tradeFormDataTypeSelector,
} from '@/stores/trade-slice/formDataSlice'
import { userInfoActiveTradeAccountIdSelector } from '@/stores/user-slice/infoSlice'
import { getOrderMargin } from '@/v1/services/tradeCore/order'
import { BNumber } from '@mullet/utils/number'

import { useOrderMarketPrice } from '../_comps/order-panel/_hooks/use-order-price'
import { buildOrderParams } from '../_helpers/build-order-params'

/** 用户输入防抖延迟（ms） */
const INPUT_DEBOUNCE_WAIT = 300

/**
 * 行情价格节流间隔（ms）
 *
 * 设置为 1500ms，略长于保证金接口的平均响应时间。
 * 目的：确保上一个请求完成后再触发下一轮，避免并发堆积。
 */
const MARKET_PRICE_THROTTLE_WAIT = 1500

/**
 * 限价单价格处理：用户输入，防抖后使用
 */
const useLimitOrderPrice = (orderPrice: string | undefined) => {
  return useDebounce(orderPrice, { wait: INPUT_DEBOUNCE_WAIT })
}

/**
 * 市价单价格处理：行情推送，手动节流
 *
 * ahooks 的 useThrottle 是值节流，内部状态会随原始值变化而更新，
 * 导致组件频繁重新渲染。这里手动实现真正的节流：在节流期间完全忽略新值。
 */
const useMarketOrderPrice = (orderPrice: string | undefined) => {
  const [throttledValue, setThrottledValue] = useState(orderPrice)
  const lastUpdateTime = useRef(0)
  const pendingValue = useRef(orderPrice)

  useEffect(() => {
    pendingValue.current = orderPrice

    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdateTime.current

    if (timeSinceLastUpdate >= MARKET_PRICE_THROTTLE_WAIT) {
      // 超过节流时间，立即更新
      setThrottledValue(orderPrice)
      lastUpdateTime.current = now
    } else {
      // 在节流期间，设置定时器在节流时间到后更新
      const timer = setTimeout(() => {
        setThrottledValue(pendingValue.current)
        lastUpdateTime.current = Date.now()
      }, MARKET_PRICE_THROTTLE_WAIT - timeSinceLastUpdate)

      return () => clearTimeout(timer)
    }
  }, [orderPrice])

  return throttledValue
}

/**
 * 预估保证金查询 Hook
 *
 * 频率控制策略：
 * - amount（用户输入）：防抖 300ms
 * - limitPrice（限价单，用户输入）：防抖 300ms
 * - marketPrice（市价单，行情推送）：节流 1500ms，间隔大于接口响应时间，天然避免并发
 * - 两套价格逻辑拆成独立 hook，各自注册自己的定时器，不互相干扰
 * - queryKey 使用基础值拍平，避免每次渲染新对象导致 key 无限变化
 * - placeholderData 保留上次结果，避免参数变化时闪烁为空
 *
 * 错误熔断策略：
 * - retry: false，失败后不自动重试
 * - 请求失败后标记 hasError，暂停后续由 marketPrice 驱动的请求
 * - 用户主动修改 amount 或 orderType 时重置 hasError，恢复请求
 */
export const useOrderMargin = ({ symbol, amount }: { symbol?: string; amount: string }) => {
  const accountId = useRootStore(userInfoActiveTradeAccountIdSelector)

  // 只订阅需要的字段，避免无关字段变化触发重渲染
  const direction = useRootStore(tradeFormDataDirectionSelector)
  const inputLimitPrice = useRootStore(tradeFormDataLimitPriceSelector)
  const orderType = useRootStore(tradeFormDataTypeSelector)
  const formData = useRootStore(
    useShallow((s) => ({
      slPrice: s.trade.formData.slPrice,
      tpPrice: s.trade.formData.tpPrice,
      hasTpSl: s.trade.formData.hasTpSl,
      marginType: s.trade.formData.marginType,
    })),
  )

  const orderMarketPrice = useOrderMarketPrice({
    symbol: symbol,
    direction: direction,
  })

  const isLimitOrder = orderType !== OrderCreateTypeEnum.MARKET_ORDER

  // 两套价格 hook 始终注册，但只有对应模式下的值才会被实际使用
  // 非对应模式传入 undefined，内部定时器不会真正触发（值不变则不 flush）
  const debouncedAmount = useDebounce(amount, { wait: INPUT_DEBOUNCE_WAIT })
  // limitPrice 是 string，直接传；marketPrice 是 number | undefined，转 string
  const limitPrice = useLimitOrderPrice(isLimitOrder ? inputLimitPrice : undefined)
  const marketPrice = useMarketOrderPrice(isLimitOrder ? undefined : orderMarketPrice?.toString())

  const effectivePrice = isLimitOrder ? limitPrice : marketPrice

  const hasVolume = BNumber.from(debouncedAmount)?.gt(0)
  const hasPrice = BNumber.from(effectivePrice)?.gt(0)

  // 错误熔断标记：请求失败后停止 marketPrice 驱动的自动请求
  // 用户主动修改 amount / orderType 时重置，恢复请求（用 ref 避免触发重渲染）
  const hasError = useRef(false)
  const prevUserInputKey = useRef(`${amount}|${orderType}`)
  const userInputKey = `${amount}|${orderType}`
  if (prevUserInputKey.current !== userInputKey) {
    prevUserInputKey.current = userInputKey
    hasError.current = false
  }

  // queryKey 用基础值拍平，避免每次渲染产生新对象引用导致 key 无限变化
  const queryKey = [
    'order-margin',
    accountId,
    symbol,
    direction,
    debouncedAmount,
    orderType,
    effectivePrice,
    formData.slPrice,
    formData.tpPrice,
    formData.hasTpSl,
    formData.marginType,
  ] as const

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const params = buildOrderParams({
          accountId,
          symbol,
          direction,
          amount: debouncedAmount,
          orderType,
          limitPrice: effectivePrice,
          slPrice: formData.slPrice,
          tpPrice: formData.tpPrice,
          hasTpSl: formData.hasTpSl,
          marginType: formData.marginType,
        })
        const res = await getOrderMargin({ ...params })
        return BNumber.from(res.data)?.toFixed()
      } catch {
        // 请求失败后标记熔断，阻止 marketPrice 继续驱动新请求
        hasError.current = true
        return null
      }
    },
    enabled: Boolean(hasVolume && hasPrice && accountId && symbol && !hasError.current),
    staleTime: 0,
    gcTime: 30_000,
    placeholderData: (prev) => prev,
    retry: false,
  })
}
