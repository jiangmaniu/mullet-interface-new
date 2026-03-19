import { useMemo } from 'react'

import { useRootStore } from '@/stores'
import { tradeActiveTradeSymbolSelector } from '@/stores/trade-slice'
import { DEFAULT_LEVERAGE_MULTIPLE } from '@/v1/constants'
import { useStores } from '@/v1/provider/mobxProvider'
import { Order } from '@/v1/services/tradeCore/order/typings'
import { getPrecisionByNumber, toFixed } from '@/v1/utils'
import { useGetCurrentQuoteCallback } from '@/v1/utils/wsUtil'

export default function useQuote() {
  const { trade } = useStores()
  const activeTradeSymbol = useRootStore(tradeActiveTradeSymbolSelector)

  const {
    recordModalItem,
    isBuy: isBuyT,
    marginType: marginTypeT,
    orderType: orderTypeT,
    orderPrice: orderPriceT,
    orderVolume: orderVolumeT,
    // spValue: spValueT,
    // slValue: slValueT
  } = trade
  const {
    symbol: symbolRMI,
    conf: symbolConfRMI,
    symbolDecimal: dRMI,
    orderVolume: orderVolumeRMI,
    buySell: buySellRMI,
    marginType: marginTypeRMI,
    type: orderTypeRMI,
    limitPrice: orderPriceRMI,
    // stopLoss: slValueRMI,
    // takeProfit: spValueRMI
  } = recordModalItem

  const isBuyRMI = useMemo(
    () => (buySellRMI && buySellRMI === 'BUY' ? true : buySellRMI && buySellRMI === 'SELL' ? false : undefined),
    [buySellRMI],
  )

  const symbol = useMemo(() => symbolRMI || activeTradeSymbol, [activeTradeSymbol, symbolRMI])

  const getCurrentQuote = useGetCurrentQuoteCallback()
  const quoteInfo = getCurrentQuote(symbol)
  // const prevQuoteInfo = useRef<any>(quoteInfo) // 缓存上一次的行情信息

  // useEffect(() => {
  //   if (!typing) {
  //     prevQuoteInfo.current = quoteInfo
  //   }
  // }, [quoteInfo, typing])

  // 输入时取最后一次行情缓存计算
  const symbolConf = useMemo(() => {
    // if (typing) {
    //   return symbolConfRMI || prevQuoteInfo.current?.symbolConf
    // }
    return symbolConfRMI || quoteInfo.symbolConf
  }, [symbolConfRMI, quoteInfo])

  // 输入时取最后一次行情缓存计算
  const d = useMemo(() => {
    // if (typing) {
    //   return dRMI || prevQuoteInfo.current?.digits
    // }
    return dRMI || quoteInfo?.digits
  }, [dRMI, quoteInfo]) // 小数位

  // const orderVolume = useMemo(() => orderVolumeRMI || trade.orderVolume, [orderVolumeRMI, trade.orderVolume])
  // const orderVolume = useMemo(() => orderVolumeRMI || trade.orderVolume, [orderVolumeRMI, trade.orderVolume])

  const orderVolume = useMemo(() => {
    if (orderVolumeT) {
      return orderVolumeT
    }

    if (orderVolumeRMI) {
      return orderVolumeRMI
    }

    return orderVolumeT
  }, [orderVolumeRMI, orderVolumeT])

  const buySell = useMemo(() => buySellRMI || trade.buySell, [buySellRMI, trade.buySell])

  const stopl = useMemo(() => Number(symbolConf?.limitStopLevel || 1) * Math.pow(10, -d), [symbolConf, d]) // 交易-限价和停损级别
  const vmax = useMemo(() => symbolConf?.maxTrade as number, [symbolConf])
  const vmin = useMemo(() => symbolConf?.minTrade || 0.01, [symbolConf])
  const countPrecision = useMemo(() => getPrecisionByNumber(symbolConf?.minTrade), [symbolConf]) // 手数精度

  const bid = useMemo(() => {
    // if (typing) {
    //   return Number(prevQuoteInfo.current?.bid || 0)
    // }
    return Number(quoteInfo?.bid || 0)
  }, [quoteInfo]) // 卖价

  // 输入时取最后一次行情缓存计算
  const ask = useMemo(() => {
    // if (typing) {
    //   return Number(prevQuoteInfo.current?.ask || 0)
    // }
    return Number(quoteInfo?.ask || 0)
  }, [quoteInfo]) // 买价

  // 给价格输入框加上默认值
  const getInitPriceValue = () => {
    return isBuy ? (ask ? toFixed(ask - stopl, d, false) : 0) : bid ? toFixed(bid + stopl, d, false) : 0
  }
  const step = useMemo(() => Number(symbolConf?.tradeStep || 0) || Math.pow(10, -d), [symbolConf, d]) // 手数步长
  // 根据品种小数点位数计算步长，独立于手数步长step。获取计算的小数位倒数第二位开始作为累加步长
  // 限价、止盈止损、停损挂单，加减时，连动报价小数位倒数第二位
  // 报价大小 * Math.pow(10, -d)
  const step2 = useMemo(() => Number(symbolConf?.quotationSize || 0) * Math.pow(10, -d) || step, [d, symbolConf, step])

  const isBuy = useMemo(() => {
    if (isBuyRMI !== undefined) {
      return isBuyRMI
    }
    return isBuyT
  }, [isBuyRMI, isBuyT])

  const currentPrice = useMemo(() => (isBuy ? ask : bid), [isBuy, ask, bid])

  // 输入时取最后一次行情缓存计算
  const hasQuote = useMemo(() => {
    // if (typing) {
    //   return prevQuoteInfo.current?.hasQuote
    // }
    return quoteInfo?.hasQuote
  }, [quoteInfo])

  // 输入时取最后一次行情缓存计算
  const leverageMultiple = useMemo(() => {
    // if (typing) {
    //   return prevQuoteInfo.current?.prepaymentConf?.mode === 'float_leverage' ? trade.leverageMultiple || DEFAULT_LEVERAGE_MULTIPLE : undefined
    // }
    return quoteInfo?.prepaymentConf?.mode === 'float_leverage'
      ? trade.leverageMultiple || DEFAULT_LEVERAGE_MULTIPLE
      : undefined
  }, [quoteInfo, trade.leverageMultiple])

  // 如果有 recordModalItem 则取 recordModalItem 的 orderType，否则取 trade 的 orderType
  const orderType = useMemo(() => {
    if (orderTypeRMI) {
      return orderTypeRMI
    } else if (recordModalItem?.id) {
      // 这里需要做特殊处理！，如果 recordModalItem 是市价单，没有 type 字段，则返回 MARKET_ORDER
      return 'MARKET_ORDER'
    }

    return orderTypeT
  }, [orderTypeT, orderTypeRMI, recordModalItem])

  // 如果有 recordModalItem 则取 recordModalItem 的 orderPrice，否则取 trade 的 orderPrice

  const startPrice = (recordModalItem as Order.BgaOrderPageListItem)?.startPrice
  const orderPrice = useMemo(() => {
    // 优先取输入值
    if (orderPriceT) {
      return orderPriceT
    }

    // 如果有开仓价，取开仓价
    if (startPrice) {
      return startPrice
    }

    // 如果有停损价或限价，取停损价或限价
    if (orderPriceRMI) {
      return orderPriceRMI
    }

    return orderPriceT
  }, [orderPriceRMI, orderPriceT, startPrice])

  // 如果有 recordModalItem 则取 recordModalItem 的 marginType，否则取 trade 的 marginType
  const marginType = useMemo(() => {
    if (marginTypeRMI) {
      return marginTypeRMI
    }
    return marginTypeT
  }, [marginTypeRMI, marginTypeT])

  const isStopLossLimit = useMemo(() => {
    return (
      orderType === 'STOP_LOSS_LIMIT_BUY_ORDER' ||
      orderType === 'STOP_LOSS_LIMIT_SELL_ORDER' ||
      orderType === 'STOP_LIMIT_ORDER' ||
      orderType === 'STOP_LOSS_MARKET_BUY_ORDER' ||
      orderType === 'STOP_LOSS_MARKET_SELL_ORDER'
    )
  }, [orderType])

  const isLimit = useMemo(() => {
    return orderType === 'LIMIT_ORDER' || orderType === 'LIMIT_BUY_ORDER' || orderType === 'LIMIT_SELL_ORDER'
  }, [orderType])

  // const slValue = useMemo(() => {
  //   if (slValueRMI) {
  //     return slValueRMI
  //   }
  //   return slValueT
  // }, [slValueRMI, slValueT])

  // const spValue = useMemo(() => {
  //   if (spValueRMI) {
  //     return spValueRMI
  //   }
  //   return spValueT
  // }, [spValueRMI, spValueT])

  return {
    symbol,
    quoteInfo,
    symbolConf,
    d,
    orderVolume,
    buySell,
    bid,
    ask,
    vmax,
    vmin,
    countPrecision,
    step,
    step2,
    isBuy,
    stopl,
    getInitPriceValue,
    hasQuote,
    leverageMultiple,
    currentPrice,
    orderType,
    orderPrice,
    marginType,
    isStopLossLimit,
    isLimit,
    // slValue,
    // spValue
  }
}
