import { useLingui } from '@lingui/react/macro'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { throttle } from 'lodash-es'

import { ORDER_TYPE } from '@/v1/constants/enum'
import { ITradeTabsOrderType, RecordModalItem } from '@/v1/mobx/trade'
import { useStores } from '@/v1/provider/mobxProvider'
import { formatNum, getPrecisionByNumber, toFixed, toNegativeOrEmpty } from '@/v1/utils'
import { add } from '@/v1/utils/float'
import { calcExchangeRate } from '@/v1/utils/wsUtil'
import { toast } from '@mullet/ui/toast'

import { useCurrentQuote } from './useCurrentQuote'

type IProps = {
  /** 市价订单 */
  marketItem?: Order.BgaOrderPageListItem
  /** 限价止损订单 */
  limitStopItem?: Order.OrderPageListItem
}

export default function useTrade(props?: IProps) {
  const { marketItem, limitStopItem } = props || {}
  const { trade } = useStores()
  const { t } = useLingui()

  const [inputing, setInputing] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    setOrderSpslChecked,
    orderSpslChecked,
    activeSymbolName,
    setOrderPrice: _setOrderPrice,
    orderPrice,
    setOrderVolume,
    orderVolume,
    setSp: _setSp,
    setSl: _setSl,
    setSpAmount: _setSpAmount,
    setSlAmount: _setSlAmount,
    setSpPercent: _setSpPercent,
    setSlPercent: _setSlPercent,
    spValue, // 止盈价格, 只参与计算，不提交到后端，也不直接展示在 UI 层
    slValue, // 止损价格, 只参与计算，不提交到后端，也不直接展示在 UI 层
    spAmount, // 止盈金额, 只参与计算，不提交到后端，也不直接展示在 UI 层
    slAmount, // 止损金额, 只参与计算，不提交到后端，也不直接展示在 UI 层
    marginType,
    buySell,
    spPriceOrAmountType,
    slPriceOrAmountType,
    resetSpSl,
    setOrderType,
    setBuySell,
    setSpPriceOrAmountType: _setSpPriceOrAmountType,
    setSlPriceOrAmountType: _setSlPriceOrAmountType,
    setRecordModalItem,
    recordModalItem,
    setIsPosition, // 是否是持仓单
    isPosition, // 是否是持仓单
  } = trade

  // 优先设置赋值的symbolName
  const symbol = useMemo(() => recordModalItem.symbol || activeSymbolName, [activeSymbolName, recordModalItem])
  const conf = recordModalItem.conf
  const digits = recordModalItem.symbolDecimal

  const setItem = (item: RecordModalItem) => {
    if (item && item.symbol) {
      // 关闭止盈止损，避免赋值的时候污染了右侧下单全局的值展示
      setOrderSpslChecked(false)
      setIsPosition(true)

      let _orderType = 'MARKET_ORDER' as ITradeTabsOrderType
      // @ts-ignore
      if (item?.type) {
        // @ts-ignore
        _orderType =
          item.type === 'LIMIT_BUY_ORDER' || item.type === 'LIMIT_SELL_ORDER' ? 'LIMIT_ORDER' : 'STOP_LIMIT_ORDER'

        // 设置价格：限价单 或 停损单
        // @ts-ignore
        trade.setOrderPrice(item.limitPrice)
      } else {
        // 设置价格：市价持仓单
        // @ts-ignore
        trade.setOrderPrice(item.startPrice)
      }

      trade.setOrderType(_orderType)
      trade.setBuySell(item.buySell as API.TradeBuySell)

      if (_orderType === 'MARKET_ORDER') {
        trade.setOrderVolume(item.orderVolume || 0)
      }

      setSl(item.stopLoss)
      setSp(item.takeProfit)

      // 设置弹窗数据到全局
      setRecordModalItem(item)
    }
  }

  // ================= 实时计算交易 ================
  const orderType = useMemo(() => trade.orderType, [trade.orderType])
  const isMarketOrder = useMemo(() => orderType === 'MARKET_ORDER', [orderType])
  const isBuy = useMemo(() => buySell === 'BUY', [buySell])
  const currentAccountInfo = trade.currentAccountInfo

  // 使用stores的值全局组件共享
  const { availableMargin } = trade.getAccountBalance()

  const prevQuoteInfo = useRef<any>(void 0) // 缓存上一次的行情信息

  const quote = useCurrentQuote(symbol)

  useEffect(() => {
    if (!inputing) {
      prevQuoteInfo.current = quote
    }
  }, [quote, inputing])

  const quoteInfo = quote

  // 输入时取最后一次行情缓存计算
  const symbolConf = useMemo(() => {
    if (inputing) {
      return conf || prevQuoteInfo.current?.symbolConf
    }
    return conf || quoteInfo?.symbolConf
  }, [conf, quoteInfo, inputing, prevQuoteInfo])

  // 输入时取最后一次行情缓存计算
  const d = useMemo(() => {
    if (inputing) {
      return digits || prevQuoteInfo.current?.digits
    }
    return digits || quoteInfo?.digits
  }, [digits, quoteInfo, inputing, prevQuoteInfo]) // 小数位

  // 输入时取最后一次行情缓存计算
  const bid = useMemo(() => {
    if (inputing) {
      return Number(prevQuoteInfo.current?.bid || 0)
    }
    return Number(quoteInfo?.bid || 0)
  }, [quoteInfo, inputing, prevQuoteInfo]) // 卖价

  // 输入时取最后一次行情缓存计算
  const ask = useMemo(() => {
    if (inputing) {
      return Number(prevQuoteInfo.current?.ask || 0)
    }
    return Number(quoteInfo?.ask || 0)
  }, [quoteInfo, inputing, prevQuoteInfo]) // 买价

  // 输入时取最后一次行情缓存计算
  const consize = useMemo(() => {
    if (inputing) {
      return prevQuoteInfo.current?.consize
    }
    return quoteInfo?.consize
  }, [quoteInfo, inputing, prevQuoteInfo])

  // 输入时取最后一次行情缓存计算
  const hasQuote = useMemo(() => {
    if (inputing) {
      return prevQuoteInfo.current?.hasQuote
    }
    return quoteInfo?.hasQuote
  }, [quoteInfo, inputing, prevQuoteInfo])

  // 输入时取最后一次行情缓存计算
  const leverageMultiple =
    quoteInfo?.prepaymentConf?.mode === 'float_leverage' ? trade.leverageMultiple || 1 : undefined

  const stopl = useMemo(() => Number(symbolConf?.limitStopLevel || 1) * Math.pow(10, -d), [symbolConf, d]) // 交易-限价和停损级别
  const maxOpenVolume = trade.leverageMultipleMaxOpenVolume || trade.maxOpenVolume // 最大可开手数
  const vmaxShow = useMemo(() => symbolConf?.maxTrade || 20, [symbolConf]) // 配置最大可开手数，展示值
  const vmax = useMemo(() => symbolConf?.maxTrade as number, [symbolConf])
  const vmin = useMemo(() => symbolConf?.minTrade || 0.01, [symbolConf])
  const step = useMemo(() => Number(symbolConf?.tradeStep || 0) || Math.pow(10, -d), [symbolConf, d]) // 手数步长
  // 根据品种小数点位数计算步长，独立于手数步长step。获取计算的小数位倒数第二位开始作为累加步长
  // 限价、止盈止损、停损挂单，加减时，连动报价小数位倒数第二位
  // const step2 = useMemo(() => Math.pow(10, -(d - 1)) || step, [d, step])
  // 报价大小 * Math.pow(10, -d)
  const step2 = useMemo(() => Number(symbolConf?.quotationSize || 0) * Math.pow(10, -d) || step, [d, symbolConf, step])
  const countPrecision = useMemo(() => getPrecisionByNumber(symbolConf?.minTrade), [symbolConf]) // 手数精度
  const accountGroupPrecision = useMemo(
    () => trade.currentAccountInfo.currencyDecimal || 2,
    [trade.currentAccountInfo.currencyDecimal],
  )

  // 格式化数据
  const sl = useMemo(() => Number(slValue), [slValue])
  const sp = useMemo(() => Number(spValue), [spValue])
  const count = useMemo(() => Number(orderVolume), [orderVolume])
  const price = useMemo(() => Number(orderPrice), [orderPrice])
  let rangeSymbol = ['≥', '≤']

  let currentPrice = useMemo(() => (isBuy ? ask : bid), [isBuy, ask, bid]) // 当前市价
  let reversePrice = useMemo(() => (isBuy ? bid : ask), [isBuy, ask, bid])
  const stopll = useMemo(() => (isBuy ? stopl : -stopl), [isBuy, stopl]) // 停损级别
  const reverseStopll = useMemo(() => (isBuy ? -stopl : stopl), [isBuy, stopl])

  /**
   * 止损范围，参与计算，不提交到后端，也不直接展示在 UI 层
   */
  const sl_scope = useMemo(() => {
    if (orderType === 'MARKET_ORDER') {
      // 市价单： 买入：止损范围 = 卖价 - 停损级别，卖出：止损范围 = 买价 + 停损级别
      return Number((reversePrice + reverseStopll).toFixed(d))
    }
    if (orderType === 'LIMIT_ORDER' || orderType === 'STOP_LIMIT_ORDER') {
      // 限价单 & 停损单： 买入：止损范围 = 限价 - 停损级别，卖出：止损范围 = 限价 + 停损级别
      return price ? Number((price + reverseStopll).toFixed(d)) : 0
    }
    return 0
  }, [currentPrice, stopll, d, orderType, price])

  /**
   * 止盈范围，参与计算，不提交到后端，也不直接展示在 UI 层
   */
  const sp_scope = useMemo(() => {
    if (orderType === 'MARKET_ORDER') {
      // 市价单： 买入：止盈范围 = 卖价 + 停损级别，卖出：止盈范围 = 买价 - 停损级别
      return Number((reversePrice + stopll).toFixed(d))
    } else if (orderType === 'LIMIT_ORDER' || orderType === 'STOP_LIMIT_ORDER') {
      // 限价单 & 停损单： 买入：止盈范围 = 限价 + 停损级别，卖出：止盈范围 = 限价 - 停损级别
      return price ? Number((price + stopll).toFixed(d)) : 0
    }
    return 0
  }, [currentPrice, stopll, d, orderType, price])

  /**
   * 预估亏损， 参与计算，不提交到后端，也不直接展示在 UI 层
   */
  const slProfit = useMemo(() => {
    let profit: any = 0
    // Math.abs 价格和行情的差值，取正数
    if (orderType === 'LIMIT_ORDER' || orderType === 'STOP_LIMIT_ORDER') {
      profit = price && sl ? Number((Math.abs(sl - price) * count * consize).toFixed(d)) : 0
    } else if (orderType === 'MARKET_ORDER') {
      profit = sl ? Number((Math.abs(sl - currentPrice) * count * consize).toFixed(d)) : 0
    }
    // 转换汇率
    profit = calcExchangeRate({
      value: profit,
      unit: symbolConf?.profitCurrency,
      buySell,
    })
    return profit
  }, [sl, currentPrice, count, consize, orderType, price, symbolConf])

  /**
   * 预估盈利， 参与计算，不提交到后端，也不直接展示在 UI 层
   */
  const spProfit = useMemo(() => {
    let profit: any = 0
    // Math.abs 价格和行情的差值，取正数
    if (isPosition || orderType === 'LIMIT_ORDER' || orderType === 'STOP_LIMIT_ORDER') {
      profit = price && sp ? Number((Math.abs(sp - price) * count * consize).toFixed(d)) : 0
    } else if (orderType === 'MARKET_ORDER') {
      profit = sp ? Number((Math.abs(sp - currentPrice) * count * consize).toFixed(d)) : 0
    }
    // 转换汇率
    profit = calcExchangeRate({
      value: profit,
      unit: symbolConf?.profitCurrency,
      buySell,
    })

    return profit
  }, [sp, currentPrice, count, consize, orderType, price, symbolConf, buySell, isPosition])

  // 价格范围
  const priceTip = useMemo(() => {
    if (orderType === 'STOP_LIMIT_ORDER') {
      return Number((isBuy ? currentPrice + stopll : currentPrice + stopll).toFixed(d))
    } else if (isPosition || orderType === 'LIMIT_ORDER') {
      return Number((isBuy ? currentPrice - stopll : currentPrice - stopll).toFixed(d))
    }
    return 0
  }, [orderType, isBuy, stopll, d, currentPrice])

  // 价格范围 大于或者小于符号
  const priceRangeSymbol = useMemo(() => {
    if (orderType === 'LIMIT_ORDER') {
      return isBuy ? rangeSymbol[1] : rangeSymbol[0]
    } else if (orderType === 'STOP_LIMIT_ORDER') {
      return isBuy ? rangeSymbol[0] : rangeSymbol[1]
    }
    return ''
  }, [orderType, isBuy])

  // 价格范围提示文字红色
  const showPriceTipRedColor = useMemo(
    throttle(
      () => {
        if (orderType === 'STOP_LIMIT_ORDER') {
          return (
            price &&
            !Number.isNaN(price) &&
            (isBuy ? Number(price) < Number(priceTip) : Number(price) > Number(priceTip))
          )
        } else if (isPosition || orderType === 'LIMIT_ORDER') {
          return (
            price &&
            !Number.isNaN(price) &&
            (isBuy ? Number(price) > Number(priceTip) : Number(price) < Number(priceTip))
          )
        }
        return false
      },
      100,
      {
        // 立即执行
        leading: true,
      },
    ),
    [orderType, isBuy, price, priceTip, isPosition],
  )

  // 给价格输入框加上默认值
  const getInitPriceValue = () => {
    if (isBuy) {
      // 买：输入框减少0.2
      return ask ? toFixed(ask - stopl, d, false) : 0
    } else {
      // 卖：输入框增加0.2
      return bid ? toFixed(bid + stopl, d, false) : 0
    }
  }

  // ============== hooks start ==============
  useEffect(() => {
    // 重置右侧交易信息
    if (!recordModalItem.id) {
      resetSpSl()
    }
  }, [orderType, symbol, recordModalItem])

  useEffect(() => {
    // 初始化下单交易价格
    if (!recordModalItem.id) {
      setOrderPrice(getInitPriceValue())
    }
  }, [symbol, buySell, orderType, vmin])

  useEffect(() => {
    marketItem && setItem(marketItem)
  }, [marketItem])

  useEffect(() => {
    limitStopItem && setItem(limitStopItem)
  }, [limitStopItem])

  // 使用ref保存止盈止损的值，避免组件重复渲染
  const sp_scopeRef = useRef<any>(null)
  const sl_scopeRef = useRef<any>(null)
  const priceTipRef = useRef<any>(null)

  useEffect(() => {
    sp_scopeRef.current = sp_scope
  }, [sp_scope])

  useEffect(() => {
    sl_scopeRef.current = sl_scope
  }, [sl_scope])

  useEffect(() => {
    priceTipRef.current = priceTip
  }, [priceTip])

  // ============== hooks end ==============

  // 手数加
  const onAdd = useCallback(() => {
    // 取最大可开手数和最大可开手数展示值的最小值
    const maxValue = Math.min(vmax, maxOpenVolume)
    if (orderType === 'MARKET_ORDER') {
      // 市价单
      if (count && (isBuy ? count < maxValue : count < 30)) {
        const c = (((count + step) * 100) / 100).toFixed(countPrecision)
        setOrderVolume(Math.min(Number(c), maxValue))
      } else {
        setOrderVolume(maxValue)
      }
    } else if (orderType === 'LIMIT_ORDER') {
      // 限价单
      if (count && (isBuy ? count < maxValue : count <= 5)) {
        const c = (((count + step) * 100) / 100).toFixed(countPrecision)
        setOrderVolume(Math.min(Number(c), maxValue))
      }
    } else if (orderType === 'STOP_LIMIT_ORDER') {
      // 停损单
      if (count && (isBuy ? count < maxValue : count <= 5)) {
        const c = (((count + step) * 100) / 100).toFixed(countPrecision)
        setOrderVolume(Math.min(Number(c), maxValue))
      }
    }
  }, [orderType, count, step, countPrecision, isBuy, maxOpenVolume, vmax])

  // 手数减
  const onMinus = useCallback(() => {
    if (orderType === 'MARKET_ORDER') {
      if (count && count > step) {
        // 市价单
        const c = (((count - step) * 100) / 100).toFixed(countPrecision)
        setOrderVolume(c)
      } else {
        setOrderVolume(step)
      }
    } else if (orderType === 'LIMIT_ORDER') {
      // 限价单
      if (count && (isBuy ? count > vmin : count > step)) {
        const c = (((count - step) * 100) / 100).toFixed(countPrecision)
        setOrderVolume(c)
      }
    } else if (orderType === 'STOP_LIMIT_ORDER') {
      // 停损单
      if (count && (isBuy ? count > vmin : count > step)) {
        const c = (((count - step) * 100) / 100).toFixed(countPrecision)
        setOrderVolume(c)
      }
    }
  }, [orderType, count, step, countPrecision, vmin, isBuy])

  // ========= 止盈止损加减 ============

  // 止盈加
  const onSpAdd = useCallback(() => {
    if (sp && Number(sp) > 0.01) {
      // const c = (((Number(sp) + step2) * 100) / 100).toFixed(d)
      const c = add(sp, step2)?.toFixed(d)

      setSp(String(c))
    } else {
      setSp(sp_scopeRef.current)
    }
  }, [sp, step2, d])

  // 止盈减
  const onSpMinus = useCallback(() => {
    if (sp && Number(sp) > 0.01) {
      const c = (((sp - step2) * 100) / 100).toFixed(d)
      setSp(c)
    } else {
      setSp(sp_scopeRef.current)
    }
  }, [sp, step2, d])

  // 止损加
  const onSlAdd = useCallback(() => {
    if (sl && Number(sl) > 0.01) {
      const c = (((sl + step2) * 100) / 100).toFixed(d)
      setSl(c)
    } else {
      setSl(sl_scopeRef.current)
    }
  }, [sl, step2, d])

  // 止损减
  const onSlMinus = useCallback(() => {
    if (sl && Number(sl) > 0.01) {
      const c = (((sl - step2) * 100) / 100).toFixed(d)
      setSl(c)
    } else {
      setSl(sl_scopeRef.current)
    }
  }, [sl, step2, d])

  // 价格加
  const onPriceAdd = useCallback(() => {
    if (price && price >= 0) {
      const c = (((price + step2) * 100) / 100).toFixed(d)
      setOrderPrice(c)
    } else {
      setOrderPrice(priceTipRef.current)
    }
  }, [price, step2, d])

  // 价格减
  const onPriceMinus = useCallback(() => {
    if (price && price > 0) {
      const c = (((price - step2) * 100) / 100).toFixed(d)
      setOrderPrice(c)
    } else {
      setOrderPrice(priceTipRef.current)
    }
  }, [price, step2, d])

  // 计算止盈价格
  // 止盈价格=（止盈金额/手数/合约大小）+市价/限价
  const spValuePrice = useMemo(
    throttle(
      () => {
        if (spPriceOrAmountType === 'AMOUNT') {
          const _price = orderType === 'MARKET_ORDER' && !isPosition ? currentPrice : price
          if (isBuy) {
            //  * 止盈价 = 买单市价 + (预计盈利/手数/合约大小)
            return (_price + Number(spAmount || 0) / count / consize).toFixed(d)
          } else {
            // * 止盈价 = 卖单市价 - (预计盈利/手数/合约大小)
            return (_price - Number(spAmount || 0) / count / consize).toFixed(d)
          }
        }
        return spValue
      },
      100,
      {
        // 立即执行
        leading: true,
      },
    ),
    [spPriceOrAmountType, spValue, spAmount, isBuy, currentPrice, price, orderType, count, consize, isPosition],
  )

  // 计算止损价格
  // 止损价格=（止损金额/手数/合约大小）+市价/限价
  const slValuePrice = useMemo(
    throttle(
      () => {
        if (slPriceOrAmountType === 'AMOUNT') {
          const _price = orderType === 'MARKET_ORDER' && !isPosition ? currentPrice : price
          if (isBuy) {
            // * 止损价 = 买单市价 - (预估亏损/手数/合约大小)
            return (_price - Number(slAmount || 0) / count / consize).toFixed(d)
          } else {
            // * 止损价 = 卖单市价 + (预估亏损/手数/合约大小)
            return (_price + Number(slAmount || 0) / count / consize).toFixed(d)
          }
        }
        return slValue
      },
      100,
      {
        // 立即执行
        leading: true,
      },
    ),
    [slPriceOrAmountType, slValue, slAmount, isBuy, currentPrice, price, orderType, count, consize, isPosition],
  )

  // 计算止盈预估盈亏
  // 止盈预估盈亏=（止盈价-市价/限价）*合约单位*手数/*汇率
  const spValueEstimateRaw = useMemo(() => {
    const retValue = spPriceOrAmountType === 'AMOUNT' ? String(spAmount) : String(spProfit)
    return Number(retValue)
  }, [spPriceOrAmountType, spProfit, spAmount])

  // 格式化后的字符串，展示用
  const spValueEstimate = useMemo(
    throttle(
      () => {
        return spValueEstimateRaw ? String(spValueEstimateRaw) : ''
      },
      100,
      {
        // 立即执行
        leading: true,
      },
    ),
    [spValueEstimateRaw],
  )

  // 计算止损预估盈亏
  // 止损预估盈亏=（市价/限价-止损价）*合约单位*手数/*汇率
  const slValueEstimateRaw = useMemo(() => {
    let retValue = slPriceOrAmountType === 'AMOUNT' ? slAmount : slProfit
    return Number(retValue)
  }, [slPriceOrAmountType, slProfit, slAmount])

  const slValueEstimate = useMemo(
    throttle(
      () => {
        let retValue = slValueEstimateRaw === 0 ? '' : slValueEstimateRaw
        return retValue ? retValue : retValue
      },
      100,
      {
        // 立即执行
        leading: true,
      },
    ),
    [slValueEstimateRaw],
  )

  // 止盈止损范围大小判断
  const spFlag = useMemo(
    () =>
      !spValuePrice || Number(spValuePrice) === 0 || Number.isNaN(spValuePrice)
        ? false
        : isBuy
          ? Number(spValuePrice) < sp_scope || Number(spValuePrice) < 0
          : Number(spValuePrice) > sp_scope,
    [isBuy, spValuePrice, sp_scope],
  )
  const slFlag = useMemo(
    () =>
      !slValuePrice || Number(slValuePrice) === 0 || Number.isNaN(slValuePrice)
        ? false
        : isBuy
          ? Number(slValuePrice) > sl_scope || Number(slValuePrice) < 0
          : Number(slValuePrice) < sl_scope,
    [isBuy, slValuePrice, sl_scope],
  )

  const disabledBtnByCondition = spFlag || slFlag

  const disabledInfo = useMemo(() => {
    const disabledBtn = trade.disabledTrade() || trade.disabledTradeAction()
    const disabledTrade = trade.disabledTrade()
    const disabledInput = trade.disabledTradeAction()
    return {
      disabledBtn,
      disabledTrade,
      disabledInput,
    }
  }, [trade.currentAccountInfo, symbol, trade.symbolListAll.length])

  // 禁用交易按钮
  const disabledBtn = disabledInfo.disabledBtn || disabledBtnByCondition
  // 禁用交易
  const disabledTrade = disabledInfo.disabledTrade
  // 禁用交易输入框
  const disabledInput = disabledInfo.disabledInput

  const stopLoss = useMemo(
    () => (Number.isNaN(slValuePrice) || Number(slValuePrice) === 0 ? undefined : slValuePrice),
    [slValuePrice],
  )
  const takeProfit = useMemo(
    () => (Number.isNaN(spValuePrice) || Number(spValuePrice) === 0 ? undefined : spValuePrice),
    [spValuePrice],
  )

  const onSubmitEnd = useCallback(() => {
    setInputing(false)
  }, [])

  // 使用ref来保存spFlag和slFlag的值，避免触发submit函数更新
  const spFlagRef = useRef<any>(false)
  const slFlagRef = useRef<any>(false)
  const maxOpenVolumeRef = useRef<any>(0)

  useEffect(() => {
    spFlagRef.current = spFlag
  }, [spFlag])

  useEffect(() => {
    slFlagRef.current = slFlag
  }, [slFlag])

  useEffect(() => {
    maxOpenVolumeRef.current = maxOpenVolume
  }, [maxOpenVolume])

  // useEffect(() => {
  //   // 后台设置的最小手数
  //   setOrderVolume(vmin)
  // }, [vmin])

  // 提交订单之前校验
  const onCheckSubmit = () => {
    if (!count) {
      toast.error(t`请输入手数`)
      onSubmitEnd()
      return false
    }
    if (!maxOpenVolumeRef.current) {
      onSubmitEnd()
      toast.error(t`当前账户余额不足`)
      return false
    }
    // 限价、停损单
    if (['LIMIT_ORDER', 'STOP_LIMIT_ORDER'].includes(orderType) && !orderPrice) {
      onSubmitEnd()
      toast.error(t`请输入价格`)
      return false
    }

    const spSlErrorMsg = t`止盈止损设置错误`

    if (slFlagRef.current && sl) {
      onSubmitEnd()
      toast.error(spSlErrorMsg)
      return false
    }
    if (spFlagRef.current && sp) {
      onSubmitEnd()
      toast.error(spSlErrorMsg)
      return false
    }

    return true
  }

  const orderParams = useMemo(() => {
    const orderParams = {
      symbol,
      buySell, // 订单方向
      orderVolume: count,
      stopLoss,
      takeProfit,
      // 浮动杠杆默认1
      leverageMultiple,
      tradeAccountId: trade.currentAccountInfo?.id,
      marginType,
    } as Order.CreateOrder

    if (orderType === 'LIMIT_ORDER' || orderType === 'STOP_LIMIT_ORDER') {
      // @ts-ignore
      orderParams.limitPrice = orderPrice
    }
    // @ts-ignore
    const type = {
      MARKET_ORDER: ORDER_TYPE.MARKET_ORDER,
      LIMIT_ORDER: isBuy ? ORDER_TYPE.LIMIT_BUY_ORDER : ORDER_TYPE.LIMIT_SELL_ORDER,
      STOP_LIMIT_ORDER: isBuy ? ORDER_TYPE.STOP_LOSS_MARKET_BUY_ORDER : ORDER_TYPE.STOP_LOSS_MARKET_SELL_ORDER,
    }[orderType]

    // 订单类型
    // @ts-ignore
    orderParams.type = type

    return orderParams
  }, [
    symbol,
    buySell,
    count,
    stopLoss,
    takeProfit,
    leverageMultiple,
    trade.currentAccountInfo?.id,
    orderType,
    orderPrice,
    marginType,
  ])

  // 实时计算下单时预估保证金
  const expectedMargin = trade.expectedMargin

  // 提交订单
  const onSubmitOrder = async () => {
    setInputing(true)

    if (!onCheckSubmit()) {
      return
    }

    try {
      setLoading(true)
      const res = await trade.createOrder(orderParams)

      if (res.success) {
        resetSpSl()
        setOrderVolume(vmin)
        setOrderPrice('')

        // 更新账户余额信息
        // await fetchUserInfo(true)
      }
    } catch (error) {
      console.log('onSubmitOrder error', error)
      setLoading(false)
    } finally {
      onSubmitEnd()
      setLoading(false)
    }
  }

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
  const setSp = useCallback((value: any) => {
    value && setSpPriceOrAmountType('PRICE')
    _setSp(value)
    setInputing(false)
  }, [])

  // 封装设置止损价格, 输入时取最后一次行情缓存计算
  const setSl = useCallback((value: any) => {
    value && setSlPriceOrAmountType('PRICE')
    _setSl(value)
    setInputing(false)
  }, [])

  // 封装设置止盈金额, 输入时取最后一次行情缓存计算
  const setSpAmount = useCallback((value: any) => {
    value && setSpPriceOrAmountType('AMOUNT')
    _setSpAmount(value)
    setInputing(false)
  }, [])

  // 封装设置止损金额, 输入时取最后一次行情缓存计算
  const setSlAmount = useCallback((value: any) => {
    value && setSlPriceOrAmountType('AMOUNT')
    _setSlAmount(value)
    setInputing(false)
  }, [])

  // 挂单价格要取实时
  const setOrderPrice = useCallback((value: any) => {
    _setOrderPrice(value)
    // setInputing(false)
  }, [])

  return {
    expectedMargin: formatNum(expectedMargin, { precision: accountGroupPrecision }),

    // 止盈止损范围
    sp_scope,
    sl_scope,
    sp,
    sl,
    slValue: slValuePrice,
    spValue: spValuePrice,
    slAmount: slValueEstimate,
    spAmount: spValueEstimate,
    spValueEstimateRaw,
    slValueEstimateRaw,
    // 止盈止损预计盈亏
    slValueEstimate,
    spValueEstimate,

    // 按价格或者金额 止盈、止损
    spValuePrice,
    slValuePrice,

    orderType,
    countPrecision,
    step2,
    step,
    maxOpenVolume,
    vmaxShow,
    vmax,
    vmin,
    isMarketOrder,
    isBuy,
    ask,
    bid,
    spPercent: trade.spPercent,
    slPercent: trade.slPercent,
    setSpPercent: _setSpPercent,
    setSlPercent: _setSlPercent,
    d,
    symbol,
    orderVolume,
    priceTip,
    priceRangeSymbol,
    rangeSymbol,
    orderPrice,
    price,
    showPriceTipRedColor,
    showSpScopeRedColor: spFlag,
    showSlScopeRedColor: slFlag,
    disabledBtn: hasQuote && disabledBtn,
    disabledTrade: hasQuote && disabledTrade,
    disabledInput: hasQuote && disabledInput,
    disabledBtnByCondition,
    slFlag,
    spFlag,
    spByAmountScopeFlag: spFlag,
    slByAmountScopeFlag: slFlag,
    loading,
    hasQuote,
    buySell,
    availableMargin,
    orderParams,

    // 方法
    setSl,
    setSp,
    setSpAmount,
    setSlAmount,
    setOrderVolume,
    setOrderPrice,
    setOrderType,
    onAdd,
    onMinus,
    onSubmitOrder,
    onCheckSubmit,
    getInitPriceValue,
    resetSpSl,
    setSpPriceOrAmountType,
    setSlPriceOrAmountType,
    setOrderSpslChecked,
    orderSpslChecked,
    onSpAdd,
    onSpMinus,
    onSlAdd,
    onSlMinus,
    onPriceAdd,
    onPriceMinus,
    spPriceOrAmountType,
    slPriceOrAmountType,

    // 设置监听依赖对象
    setItem,
    stopLoss,
    takeProfit,
    setInputing,
  }
}
