// @ts-nocheck
import dayjs from 'dayjs'
import { action, makeAutoObservable, observable, runInAction } from 'mobx'
import NP from 'number-precision'

// import { IChartingLibraryWidget } from '@/libs/charting_library'
import { request } from '@/v1/utils/request'
import type { IQuoteItem } from './ws'

NP.enableBoundaryChecking(false)

const isDev = process.env.NODE_ENV === 'development'

function log(...args) {
  const timestamp = new Date().toISOString()
  if (isDev) {
    console.log(`[${timestamp}]`, ...args)
  }
}

class KlineStore {
  constructor() {
    makeAutoObservable(this)
  }
  heartbeatInterval: any = null
  heartbeatTimeout = 20000 // 心跳间隔，单位毫秒
  socket: any = null
  tvWidget = null
  // tvWidget = null as IChartingLibraryWidget
  @observable socketState = 0
  @observable bars = []
  @observable activeSymbolInfo = {
    symbolInfo: {}
  }
  @observable loading = true
  @observable switchSymbolLoading = false // 切换品种状态
  @observable lastbar = {} // 最后一条k线数据
  @observable datafeedBarCallbackObj = {} // 记录getbars回调的参数
  @observable lastBarTime = '' // 记录最后一次时间，用于作为请求k线的截止时间

  @action
  setSwitchSymbolLoading = (flag: boolean) => {
    this.switchSymbolLoading = flag
  }

  updateKlineData(quotes: Map<string, IQuoteItem>) {
    const symbolInfo = this.activeSymbolInfo.symbolInfo
    if (symbolInfo && quotes.size) {
      const symbol = symbolInfo.name
      // const dataSourceCode = symbolInfo.dataSourceCode
      const accountGroupId = symbolInfo.accountGroupId
      const data = quotes.get(`${accountGroupId}/${symbol}`)
      if (data && data.symbol === symbol) {
        const resolution = this.activeSymbolInfo.resolution
        const precision = symbolInfo.precision
        // 通过ws更新k线数据
        const newLastBar = this.updateBar(data, { resolution, precision, symbolInfo })
        if (newLastBar) {
          // 实时更新k线数据，通过datefeed subscribeBars提供的onRealtimeCallback方法更新
          this.activeSymbolInfo.onRealtimeCallback?.(newLastBar)
          // 更新最后一条k线
          this.lastbar = newLastBar
        }
      }
    }
  }

  // 更新最后一条k线段
  @action
  updateBar = (socketData, currentSymbol) => {
    let newLastBar
    const precision = currentSymbol.precision
    const lastBar = this.lastbar
    if (!lastBar) return
    let resolution = currentSymbol.resolution
    const serverTime = socketData?.priceData?.id / 1000 // 服务器返回的时间戳

    let rounded = serverTime
    const ask = socketData?.priceData?.buy // 卖价

    if (!resolution) return

    if (!isNaN(resolution) || resolution.includes('D')) {
      if (resolution.includes('D')) {
        resolution = 1440
      }
      const coeff = resolution * 60
      rounded = Math.floor(serverTime / coeff) * coeff // 确保时间戳被正确舍入到对应的时间段
    } else if (resolution.includes('W')) {
      rounded =
        dayjs(serverTime * 1000)
          .day(0) // 将时间舍入到该周的开始（星期天的凌晨 12 点）
          .hour(0)
          .minute(0)
          .second(0)
          .millisecond(0)
          .valueOf() / 1000
    } else if (resolution.includes('M')) {
      rounded =
        dayjs(serverTime * 1000)
          .date(1) // 将时间舍入到该月的第一天的凌晨 12 点
          .hour(0)
          .minute(0)
          .second(0)
          .millisecond(0)
          .valueOf() / 1000
    }
    const lastBarSec = lastBar.time / 1000

    if (rounded > lastBarSec) {
      newLastBar = {
        time: rounded * 1000,
        open: NP.round(ask, precision),
        high: NP.round(ask, precision),
        low: NP.round(ask, precision),
        close: NP.round(ask, precision)
      }
      // log('新建k线', newLastBar)
    } else {
      newLastBar = {
        time: lastBar.time,
        open: lastBar.open,
        high: NP.round(Math.max(lastBar.high, ask), precision),
        low: NP.round(Math.min(lastBar.low, ask), precision),
        close: NP.round(ask, precision)
      }
      // log('更新k线', newLastBar)
    }
    return newLastBar
  }
  /**
   *通过http获取k线历史数据
   * @param symbolInfo 品种信息
   * @param resolution 分辨率
   * @param from 开始时间戳
   * @param to 结束时间戳
   * @param countBack
   * @returns
   */
  getHttpHistoryBars = async (symbolInfo, resolution, from, to, countBack) => {
    const precision = symbolInfo.precision
    const klineType =
      {
        1: '1min',
        5: '5min',
        15: '15min',
        30: '30min',
        60: '60min',
        240: '4hour',
        '1D': '1day',
        '1W': '1week',
        '1M': '1mon',
        '1Y': '1year'
      }[resolution] || '1min'

    // const symbolName = [
    //   ...stringToBin(symbolInfo.name, 12),
    //   ...intToBin(resolutionToMin),
    //   ...intToBin(300), // 请求返回多少个数据
    //   ...intToBin(0),
    //   ...intToBin(to + 8 * 60 * 60)
    // ]
    // const b = Base64.btoa(
    //   quoteUtil.stringToBin(symbolInfo.mtName || symbolInfo.name, 12) + // 品种
    //     quoteUtil.intToBin(resolutionToMin) + // K线周期
    //     quoteUtil.intToBin(countBack) + // 请求返回多少个数据
    //     quoteUtil.timeToBin(to + 8 * 60 * 60) +
    //     quoteUtil.timeToBin(0)
    // )
    try {
      const res = await request('/api/trade-market/marketApi/kline/symbol/klineList', {
        params: {
          symbol: symbolInfo.symbol, // 品种
          first: firstDataRequest, // 标识是否首次请求
          current: 1,
          size: 200, // 条数
          klineType, // 时间类型
          // klineTime: to + 8 * 60 * 60 // 查询截止时间之前的k线数据
          klineTime: to * 1000 // 数据库存的都是零时区的，查询参数也必须是零时区
        }
      })
        .catch((e) => e)
        .finally(() => {
          runInAction(() => {
            this.loading = false
          })
        })
      const list = res?.data || []
      if (list?.length) {
        const bars = list
          .map((item) => {
            // 时间,开,高,低,收
            const [klineTime, open, high, low, close] = (item || '').split(',')
            const timeStamp = Number(klineTime)
            return {
              open: NP.round(open, precision),
              close: NP.round(close, precision),
              high: NP.round(high, precision),
              low: NP.round(low, precision),
              // volume: NP.round(vol, precision),
              time: timeStamp,
              mytime: dayjs(timeStamp).format('YYYY-MM-DD HH:mm:ss')
            }
          })
          .reverse() // 反转数据，按时间从大到小排序
        this.barList = bars
        return bars
      } else {
        return []
      }
    } catch (err) {
      console.log(err)
      // 请求加载出问题返回上一次有数据的
      return this.barList || []
    }
  }
  // datafeed getBars回调处理
  // 首次加载/切换分辨率/左右移动时间轴触发，http方式获取k线柱历史数据
  @action
  getDataFeedBarCallback = (obj = {}) => {
    const { symbolInfo, resolution, firstDataRequest, from, to, countBack } = obj
    this.datafeedBarCallbackObj = obj

    // 首次请求
    if (firstDataRequest) {
      this.getHttpHistoryBars(symbolInfo, resolution, from, to, countBack).then((bars) => {
        if (bars?.length) {
          this.datafeedBarCallbackObj.onHistoryCallback(bars, { noData: false })
          runInAction(() => {
            const lastbar = bars.at(-1) // 最后一个数据
            this.lastBarTime = bars[0]?.time / 1000 - 8 * 60 * 60 // 记录最后一次时间，用于作为请求k线的截止时间
            this.lastbar = lastbar
          })
        } else {
          this.datafeedBarCallbackObj.onHistoryCallback(bars, { noData: true })
        }
      })
    } else {
      this.getHttpHistoryBars(symbolInfo, resolution, from, this.lastBarTime, countBack).then((bars) => {
        if (bars?.length) {
          if (this.lastBarTime === bars[0]?.time / 1000 - 8 * 60 * 60) {
            this.datafeedBarCallbackObj.onHistoryCallback([], { noData: true })
          } else if (bars.length) {
            this.datafeedBarCallbackObj.onHistoryCallback(bars, { noData: false })
          }
          runInAction(() => {
            this.lastBarTime = bars[0]?.time / 1000 - 8 * 60 * 60 // 记录最后一次时间，用于作为请求k线的截止时间
          })
        } else {
          this.datafeedBarCallbackObj.onHistoryCallback(bars, { noData: true })
        }
      })
    }
  }

  // 记录tvWidget初始化实例
  @action
  // setTvWidget = (tvWidget: IChartingLibraryWidget) => {
  setTvWidget = (tvWidget: any) => {
    this.tvWidget = tvWidget
  }

  // 记录当前的symbol
  @action
  setActiveSymbolInfo = (data) => {
    this.activeSymbolInfo = {
      ...this.activeSymbolInfo,
      ...data
    }
  }

  // 取消订阅，暂不处理
  removeActiveSymbol = (subscriberUID) => {
    if (this.activeSymbolInfo.subscriberUID === subscriberUID) {
    }
  }
}

const klineStore = new KlineStore()
export default klineStore
