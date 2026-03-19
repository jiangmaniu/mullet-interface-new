
import { useCallback, useMemo } from 'react'
import useQuote from './useQoute'
import { useStores } from '@/v1/provider/mobxProvider'
import { toFixed, formatNum, toNegativeOrEmpty } from '@/v1/utils'
import { calcExchangeRate } from '@/v1/utils/wsUtil'
import { add, subtract, throttle } from 'lodash-es'
import { useDisabledTrade } from '@/pages/(protected)/(trade)/_hooks/use-disabled-trade'
import { useRootStore } from '@/stores'

export default function useSpSl() {
  const { trade } = useStores()
  const {
    orderVolume,
    symbol,
    quoteInfo,
    d,
    symbolConf,
    isBuy,
    ask,
    bid,
    buySell,
    orderType,
    orderPrice,
    isStopLossLimit,
    isLimit
    // slValue,
    // spValue
  } = useQuote()

  const {
    spPriceOrAmountType,
    slPriceOrAmountType,
    setSpPriceOrAmountType: _setSpPriceOrAmountType,
    setSlPriceOrAmountType: _setSlPriceOrAmountType,
    spValue,
    slValue,
    setSp: _setSp,
    setSl: _setSl,
    spAmount,
    setSpAmount: _setSpAmount,
    slAmount,
    setSlAmount: _setSlAmount,
    recordModalItem
  } = trade

  // ================= 实时计算交易 ================
  const isPosition = useMemo(() => !!recordModalItem?.id, [recordModalItem]) // 打开持仓单的时候会设置 recordModalItem， 有 recordModalItem 视为是【查看持仓单】

  // 输入时取最后一次行情缓存计算
  const consize = quoteInfo?.consize

  const stopl = useMemo(() => Number(symbolConf?.limitStopLevel || 1) * Math.pow(10, -d), [symbolConf, d]) // 交易-限价和停损级别

  const step = useMemo(() => Number(symbolConf?.tradeStep || 0) || Math.pow(10, -d), [symbolConf, d]) // 手数步长
  // 根据品种小数点位数计算步长，独立于手数步长step。获取计算的小数位倒数第二位开始作为累加步长
  // 限价、止盈止损、停损挂单，加减时，连动报价小数位倒数第二位
  // const step2 = useMemo(() => Math.pow(10, -(d - 1)) || step, [d, step])
  // 报价大小 * Math.pow(10, -d)
  const step2 = useMemo(() => Number(symbolConf?.quotationSize || 0) * Math.pow(10, -d) || step, [d, symbolConf, step])
  const accountGroupPrecision = useMemo(() => trade.currentAccountInfo.currencyDecimal || 2, [trade.currentAccountInfo.currencyDecimal])

  // 格式化数据
  const sl = useMemo(() => Number(slValue), [slValue])
  const sp = useMemo(() => Number(spValue), [spValue])

  const count = useMemo(() => Number(orderVolume), [orderVolume])
  const price = useMemo(() => Number(orderPrice), [orderPrice])
  let rangeSymbol = ['≥', '≤']

  const currentPrice = useMemo(() => (isBuy ? ask : bid), [isBuy, ask, bid])
  const reversePrice = useMemo(() => (isBuy ? bid : ask), [isBuy, ask, bid]) // 止盈止损用
  const stopll = useMemo(() => (isBuy ? stopl : -stopl), [isBuy, stopl])
  const reverseStopll = useMemo(() => (isBuy ? -stopl : stopl), [isBuy, stopl]) // 止损使用

  /**
   * 止损范围，参与计算，不提交到后端，也不直接展示在 UI 层
   */
  const sl_scope = useMemo(() => {
    if (orderType === 'MARKET_ORDER') {
      // 市价单： 买入：止损范围 = 卖价 - 停损级别，卖出：止损范围 = 买价 + 停损级别
      return Number((reversePrice + reverseStopll).toFixed(d))
    }
    if (isLimit || isStopLossLimit) {
      // 限价单 & 停损单： 买入：止损范围 = 限价 - 停损级别，卖出：止损范围 = 限价 + 停损级别
      return price ? Number((price + reverseStopll).toFixed(d)) : 0
    }
    return 0
  }, [currentPrice, stopll, d, orderType, price, isLimit, isStopLossLimit])

  /**
   * 止盈范围，参与计算，不提交到后端，也不直接展示在 UI 层
   */
  const sp_scope = useMemo(() => {
    if (orderType === 'MARKET_ORDER') {
      // 市价单： 买入：止盈范围 = 卖价 + 停损级别，卖出：止盈范围 = 买价 - 停损级别
      return Number((reversePrice + stopll).toFixed(d))
    } else if (isLimit || isStopLossLimit) {
      // 限价单 & 停损单： 买入：止盈范围 = 限价 + 停损级别，卖出：止盈范围 = 限价 - 停损级别
      return price ? Number((price + stopll).toFixed(d)) : 0
    }
    return 0
  }, [currentPrice, stopll, d, orderType, price, isLimit, isStopLossLimit])

  /**
   * 预估亏损， 参与计算，不提交到后端，也不直接展示在 UI 层
   */
  const slProfit = useMemo(() => {
    let profit: any = 0
    // Math.abs 价格和行情的差值，取正数
    if (isPosition || isLimit || isStopLossLimit) {
      profit = price && sl ? Number(toFixed(Math.abs(sl - price) * count * consize, d)) : 0
    } else if (orderType === 'MARKET_ORDER') {
      profit = sl ? Number(toFixed(Math.abs(sl - currentPrice) * count * consize, d)) : 0
    }
    // 转换汇率
    profit = calcExchangeRate({
      value: profit,
      unit: symbolConf?.profitCurrency,
      buySell
    })
    return profit
  }, [sl, currentPrice, count, consize, orderType, price, symbolConf, buySell, isPosition, isLimit, isStopLossLimit])

  /**
   * 预估盈利， 参与计算，不提交到后端，也不直接展示在 UI 层
   */
  const spProfit = useMemo(() => {
    let profit: any = 0
    // Math.abs 价格和行情的差值，取正数
    if (isPosition || isLimit || isStopLossLimit) {
      profit = price && sp ? Number(toFixed(Math.abs(sp - price) * count * consize, d)) : 0
    } else if (orderType === 'MARKET_ORDER') {
      profit = sp ? Number(toFixed(Math.abs(sp - currentPrice) * count * consize, d)) : 0
    }
    // 转换汇率
    profit = calcExchangeRate({
      value: profit,
      unit: symbolConf?.profitCurrency,
      buySell
    })

    return profit
  }, [sp, currentPrice, count, consize, orderType, price, symbolConf, buySell, isPosition, isLimit, isStopLossLimit])

  // ========= 止盈止损加减 ============

  // 止盈加
  const onSpAdd = useCallback(() => {
    if (sp && Number(sp) > 0.01) {
      // const c = (((Number(sp) + step2) * 100) / 100).toFixed(d)
      const c = add(sp, step2)?.toFixed(d)

      setSp(String(c))
    } else {
      setSp(sp_scope)
    }
  }, [sp, step2, d, sp_scope])

  // 止盈减
  const onSpMinus = useCallback(() => {
    if (sp && Number(sp) > 0.01) {
      // const c = (((sp - step2) * 100) / 100).toFixed(d)
      const c = subtract(sp, step2)?.toFixed(d)
      setSp(c)
    } else {
      setSp(sp_scope)
    }
  }, [sp, step2, d, sp_scope])

  // 止损加
  const onSlAdd = useCallback(() => {
    if (sl && Number(sl) > 0.01) {
      // const c = (((sl + step2) * 100) / 100).toFixed(d)
      const c = add(sl, step2)?.toFixed(d)
      setSl(c)
    } else {
      setSl(sl_scope)
    }
  }, [sl, step2, d, sl_scope])

  // 止损减
  const onSlMinus = useCallback(() => {
    if (sl && Number(sl) > 0.01) {
      // const c = (((sl - step2) * 100) / 100).toFixed(d)
      const c = subtract(sl, step2)?.toFixed(d)
      setSl(c)
    } else {
      setSl(sl_scope)
    }
  }, [sl, step2, d, sl_scope])

  // ========= 止盈止损加减 ============

  // 计算止盈价格
  // 止盈价格=（止盈金额/手数/合约大小）+市价/限价
  const spValuePrice = useMemo(
    throttle(
      () => {
        if (spPriceOrAmountType === 'AMOUNT' && spAmount) {
          const _price = orderType === 'MARKET_ORDER' && !isPosition ? currentPrice : price
          let value = 0
          // 预估盈利值换汇
          let spAmountExValue = calcExchangeRate({
            value: Number(spAmount || 0),
            unit: symbolConf?.profitCurrency,
            buySell
          })
          if (isBuy) {
            //  * 止盈价 = 买单市价 + (预计盈利*汇率/手数/合约大小)
            value = _price + Number(spAmountExValue || 0) / count / consize
          } else {
            // * 止盈价 = 卖单市价 - (预计盈利*汇率/手数/合约大小)
            value = _price - Number(spAmountExValue || 0) / count / consize
          }
          return Number(toFixed(value, d))
        }
        return Number(sp)
      },
      100,
      {
        // 立即执行
        leading: true
      }
    ),
    [spPriceOrAmountType, sp, spAmount, isBuy, currentPrice, price, orderType, count, consize, isPosition]
  )

  // 计算止损价格
  // 止损价格=（止损金额/手数/合约大小）+市价/限价
  const slValuePrice = useMemo(
    throttle(
      () => {
        if (slPriceOrAmountType === 'AMOUNT' && slAmount) {
          const _price = orderType === 'MARKET_ORDER' && !isPosition ? currentPrice : price
          let value = 0
          // 预估亏损值换汇
          let slAmountExValue = calcExchangeRate({
            value: Number(slAmount || 0),
            unit: symbolConf?.profitCurrency,
            buySell
          })
          if (isBuy) {
            // * 止损价 = 买单市价 - (预估亏损/手数/合约大小)
            value = _price - Number(slAmountExValue || 0) / count / consize
          } else {
            // * 止损价 = 卖单市价 + (预估亏损/手数/合约大小)
            value = _price + Number(slAmountExValue || 0) / count / consize
          }
          return Number(toFixed(value, d))
        }
        return Number(sl)
      },
      100,
      {
        // 立即执行
        leading: true
      }
    ),
    [slPriceOrAmountType, sl, slAmount, isBuy, currentPrice, price, orderType, count, consize, isPosition]
  )

  // 计算止盈预估盈亏
  // 止盈预估盈亏=（止盈价-市价/限价）*合约单位*手数/*汇率
  const spValueEstimateRaw = useMemo(() => {
    let retValue = spPriceOrAmountType === 'AMOUNT' ? String(spAmount) : String(spProfit)
    return Number(retValue)
  }, [spPriceOrAmountType, spProfit, spAmount])

  // 格式化后的字符串，展示用
  const spValueEstimate = useMemo(
    throttle(
      () => {
        return spValueEstimateRaw ? formatNum(spValueEstimateRaw, { precision: accountGroupPrecision }) : ''
      },
      100,
      {
        // 立即执行
        leading: true
      }
    ),
    [spValueEstimateRaw]
  )

  // 计算止损预估盈亏
  // 止损预估盈亏=（市价/限价-止损价）*合约单位*手数/*汇率
  const slValueEstimateRaw = useMemo(() => {
    let retValue = slPriceOrAmountType === 'AMOUNT' ? String(slAmount) : String(slProfit)
    return Number(retValue)
  }, [slPriceOrAmountType, slProfit, slAmount])

  const slValueEstimate = useMemo(
    throttle(
      () => {
        let retValue = slValueEstimateRaw === 0 ? '' : toNegativeOrEmpty(slValueEstimateRaw)
        return retValue
          ? formatNum(retValue, {
            precision: accountGroupPrecision
          })
          : retValue
      },
      100,
      {
        // 立即执行
        leading: true
      }
    ),
    [slValueEstimateRaw]
  )

  // 止盈止损范围大小判断
  const spFlag = useMemo(
    () =>
      !spValuePrice || spValuePrice === 0 || Number.isNaN(spValuePrice)
        ? false
        : isBuy
          ? spValuePrice < sp_scope || spValuePrice < 0
          : spValuePrice > sp_scope,
    [isBuy, spValuePrice, sp_scope]
  )
  const slFlag = useMemo(
    () =>
      !slValuePrice || slValuePrice === 0 || Number.isNaN(slValuePrice)
        ? false
        : isBuy
          ? slValuePrice > sl_scope || slValuePrice < 0
          : slValuePrice < sl_scope,
    [isBuy, slValuePrice, sl_scope]
  )

  const activeTradeAccountId = useRootStore((s) => s.user.info.activeTradeAccountId)
  const disabledInfo = useDisabledTrade({ accountId: activeTradeAccountId, symbol })

  // 禁用交易输入框
  const disabledInput = disabledInfo.disabledInput

  // 设置止盈按价格还是金额, 切换后填入最后计算的值
  const setSpPriceOrAmountType = (value: 'PRICE' | 'AMOUNT') => {
    _setSpPriceOrAmountType(value)
    if (value === 'AMOUNT') {
      _setSpAmount(spValueEstimateRaw)
    } else {
      _setSp(spValuePrice)
    }
  }

  const setSlPriceOrAmountType = (value: 'PRICE' | 'AMOUNT') => {
    _setSlPriceOrAmountType(value)
    if (value === 'AMOUNT') {
      _setSlAmount(slValueEstimateRaw)
    } else {
      _setSl(slValuePrice)
    }
  }

  // 封装设置止盈价格, 输入时取最后一次行情缓存计算
  const setSp = (value) => {
    value && setSpPriceOrAmountType('PRICE')
    _setSp(value)
  }

  // 封装设置止损价格, 输入时取最后一次行情缓存计算
  const setSl = (value) => {
    value && setSlPriceOrAmountType('PRICE')
    _setSl(value)
  }

  // 封装设置止盈金额, 输入时取最后一次行情缓存计算
  const setSpAmount = (value) => {
    value && setSpPriceOrAmountType('AMOUNT')
    _setSpAmount(value)
  }

  // 封装设置止损金额, 输入时取最后一次行情缓存计算
  const setSlAmount = (value) => {
    value && setSlPriceOrAmountType('AMOUNT')
    _setSlAmount(value)
  }

  return {
    sp,
    sl,
    d,
    step,
    setSp,
    setSl,
    setSpAmount,
    setSlAmount,
    spValueEstimateRaw, // 使用 formatNum 格式化之前的值
    spValueEstimate,
    slValueEstimateRaw, // 使用 formatNum 格式化之前的值
    slValueEstimate,
    spValuePrice,
    slValuePrice,
    disabledInput,
    onSpAdd,
    onSpMinus,
    onSlAdd,
    onSlMinus,
    slFlag,
    spFlag,
    isBuy,
    // 止盈止损范围
    sp_scope,
    sl_scope,
    rangeSymbol,
    showSpScopeRedColor: spFlag,
    showSlScopeRedColor: slFlag,
    spPriceOrAmountType,
    setSpPriceOrAmountType,
    slPriceOrAmountType,
    setSlPriceOrAmountType
  }
}
