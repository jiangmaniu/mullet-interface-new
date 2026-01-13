// @ts-nocheck
import { getEnv } from '@/v1/env'
import { ChartingLibraryWidgetOptions, DatafeedConfiguration, LibrarySymbolInfo } from '@/v1/libs/charting_library'
import { stores } from '@/v1/provider/mobxProvider'
import { getSymbolIcon } from '@/v1/utils/business'
import mitt from '@/v1/utils/mitt'
import { STORAGE_GET_TRADINGVIEW_RESOLUTION } from '@/v1/utils/storage'

// https://www.tradingview.com/charting-library-docs/latest/tutorials/implement_datafeed_tutorial/Widget-Setup
class DataFeedBase {
  constructor(props: Partial<ChartingLibraryWidgetOptions>) {
    // https://www.tradingview.com/charting-library-docs/latest/connecting_data/Datafeed-API
    this.configuration = {
      supports_time: true, // 如果您的数据源提供服务器时间（unix 时间），请将此设置为 true 。它用于调整价格范围内的倒计时
      supports_timescale_marks: true, // 数据馈送是否支持时间刻度上的标记
      supports_marks: true, // 是否支持条形标记
      // 1分钟、5分钟、15分钟、30分钟、1小时、4小时、1天、1周、1月
      // https://www.tradingview.com/charting-library-docs/latest/connecting_data/Symbology
      supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M'],
      // 数据源直接支持的一系列分辨率（以分钟为单位）。每个此类决议都可以传递给 getBars 并由 getBars 执行。默认值 [] 表示数据源支持按任意分钟数聚合
      intraday_multipliers: ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M'],
    } as DatafeedConfiguration

    this.setActiveSymbolInfo = props.setActiveSymbolInfo // 记录当前的symbol
    this.removeActiveSymbol = props.removeActiveSymbol // 取消订阅移除symbol
    this.getDataFeedBarCallback = props.getDataFeedBarCallback // 获取k线柱数据回调
    this.isZh = props.locale === 'zh_TW'
  }

  /**
   * onReady在图表Widget初始化之后立即调用，此方法可以设置图表库支持的图表配置
   * 初始化图表时，库会调用 onReady 方法。此方法为库提供数据馈送配置数据，例如支持的符号类型、交换、时间间隔（分辨率）、货币代码等。调用 OnReadyCallback 并传递 DatafeedConfiguration 对象作为参数
   * @param callback 回调函数
   */
  onReady(callback) {
    // console.log('=============onready running')
    setTimeout(() => {
      callback(this.configuration)
    }, 0)
  }

  /**
   * 解析商品：获取交易品种信息，例如交易所、时区、交易时间等：
   * 返回的数据格式参数：https://www.tradingview.com/charting-library-docs/latest/connecting_data/Datafeed-API#resolvesymbol
   * @param {*String} symbolName  商品名称或ticker
   * @param {*Function} onSymbolResolvedCallback 成功回调
   * @param {*Function} onResolveErrorCallback   失败回调
   */
  async resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback, extension) {
    const resolution = String(STORAGE_GET_TRADINGVIEW_RESOLUTION() || '')

    const ENV = getEnv()
    // 减少接口请求
    // const res = await request(`/api/trade-core/coreApi/symbols/symbol/detail?symbol=${symbolName}`).catch((e) => e)
    // const symbolInfo = res?.data || {}
    const info = stores.trade.getActiveSymbolInfo()
    const symbolInfo = {
      symbol: info.symbol,
      alias: info.alias,
      symbolGroupId: info.symbolGroupId,
      dataSourceCode: info.dataSourceCode,
      dataSourceSymbol: info.dataSourceSymbol,
      accountGroupId: info.accountGroupId,
      symbolDecimal: info.symbolDecimal,
      classify: info.classify,
      imgUrl: getSymbolIcon(info.imgUrl),
      remark: info.remark,
    }

    const currentSymbol = {
      ...symbolInfo,
      precision: symbolInfo?.symbolDecimal || 2,
      description: symbolInfo?.remark || '',
      exchange: ENV.name, // 交易所名称
      session: '24x7',
      name: symbolInfo.symbol, // 展示的自定义名称
      dataSourceCode: symbolInfo.dataSourceCode, // 数据源名称
    }
    // https://www.tradingview.com/charting-library-docs/latest/api/interfaces/Charting_Library.LibrarySymbolInfo
    const commonSymbolInfo = {
      // 显示商品是否具有日内（分钟）历史数据
      // 如果是 false ，则该特定交易品种的所有日内解析按钮都将被禁用。如果设置为 true ，则数据源直接提供的所有日内分辨率必须在 intraday_multipliers 数组中提供。
      has_intraday: true,
      // 显示商品是否具有以日为单位的历史数据
      // 如果 has_daily 设置为 false ，则针对该特定符号禁用包含天数的所有分辨率按钮。否则，库会从数据源中请求每日条形图。数据源提供的所有每日分辨率必须包含在 daily_multipliers 数组中
      has_daily: true,
      // 显示商品是否具有以W和M为单位的历史数据
      // 如果 has_weekly_and_monthly = false ，则库将自行使用每日柱线构建相应的分辨率。如果没有，那么它将使用 weekly_multipliers 或 monthly_multipliers （如果指定）从数据源请求这些柱。如果分辨率不在任一列表中，则会出现错误
      has_weekly_and_monthly: true,
      // 数据源直接支持的一系列分辨率（以分钟为单位）。每个此类决议都可以传递给 getBars 并由 getBars 执行。默认值 [] 表示数据源支持按任意分钟数聚合。
      intraday_multipliers: this.configuration.intraday_multipliers,
      // 支持的分辨率
      supported_resolutions: this.configuration.supported_resolutions,
      // 具有该符号的系列的状态代码。这可以表示为图例中的图标，位于 delayed_streaming 和 endofday 数据类型的市场状态图标旁边。声明 delayed_streaming 时，您还必须指定其延迟（以秒为单位）。
      data_status: 'streaming',
      // 交易成交量
      // visible_plots_set: 'ohlcv',
      // volume_precision: 2,
      // 价格刻度上显示标签的格式： "price" | "volume"
      format: 'price',
      // 构成一个刻度的单位数 最小波动
      minmov: 1,
      // 价格精度 小数位
      pricescale: Math.pow(10, currentSymbol.precision),
      ticker: currentSymbol?.name, // 唯一标识
    } as LibrarySymbolInfo

    const currentSymbolInfo = {
      ...commonSymbolInfo,
      ...currentSymbol,
      description: this.isZh ? currentSymbol.description : currentSymbol?.name, // 商品说明
      exchange: currentSymbol?.exchange,
      // 该交易品种的交易时间
      // 写法参考：https://www.tradingview.com/charting-library-docs/latest/connecting_data/Trading-Sessions
      // 在线验证写法是否正确：http://tradingview.github.io/checksession.html
      // Mo-Fr 00:00-24:00 或 Su-Sa 00:00-24:00 表示交易所在一周七天的全天（24小时）都有交易，并且在非交易时间段也显示数据
      session: '0000-0000|0000-0000:1234567;1',
      // 该交易品种的时区 数据库中存的全部都是零时区的数据
      // timezone: 'Etc/UTC' // 交易所的时区 @TODO 后期做时区处理本地化
      timezone: ['D', 'W', 'M', 'Y'].some((item) => resolution.endsWith(item)) ? 'Etc/UTC' : 'Asia/Shanghai', // 交易所的时区
    } as LibrarySymbolInfo

    setTimeout(() => {
      onSymbolResolvedCallback(currentSymbolInfo)
    }, 0)
  }

  /**
   * 返回的数据格式参数：https://www.tradingview.com/charting-library-docs/latest/connecting_data/Datafeed-API#searchsymbols
   * 该库调用 searchSymbols 方法来请求与某些用户输入匹配的符号。将生成的符号数组作为参数传递给 SearchSymbolsCallback
   * @param userInput
   * @param exchange
   * @param symbolType
   * @param onResultReadyCallback
   */
  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
    const keyword = userInput || ''
    const symbolInfoArr = [] // 获取品种列表
    const resultArr = symbolInfoArr
      .filter((item) => item.name.includes(keyword))
      .map((item) => {
        return {
          symbol: item.name,
          'name:': item.name,
          full_name: `${item.name}`,
          description: item.description,
          exchange: item.exchange, // 交易所名称
          description: this.isZh ? item.description : item.name,
          exchange: this.isZh ? item.exchange : '',
          type: item.type,
          ticker: item.name, // 唯一标识
        }
      })
    setTimeout(() => {
      onResultReadyCallback(resultArr)
    }, 0)
  }

  /**
   *数据格式：https://www.tradingview.com/charting-library-docs/latest/connecting_data/Datafeed-API#getbars
   * https://www.tradingview.com/charting-library-docs/latest/connecting_data/Symbology
   * 获取k线数据：这个接口专门用于获取历史数据，即当前时刻之前的数据。TradingView 会根据 Resolution 从当前时刻开始往前划定一个时间范围，尝试获取这个时间范围内，指定 Symbol 指定 Resolution 的数据。出于性能考虑，TradingView 只获取可见范围内的数据，超出可见范围的数据会随着图表的拖拽、缩放而分段延迟加载。
   *
   * getBars 被调用多次​：如果提供的数据量少于请求的数据量，则库会多次调用 getBars 要调试此问题，请启用控制台日志
   *
   * 为了避免多个 getBars 请求，您可以在 from 日期之前返回柱形，直到它们的数量与 countBack 值匹配。
   *
   * 多次调用 getBars 以获取丢失的数据。这可能会导致潜在的问题。为了避免它们，请考虑以下建议
   *
   * 如果请求范围内的柱数小于 countBack 值，您应该包括较早的柱，直到达到 countBack 计数。例如，图表请求 [2019-06-01T00:00:00..2020-01-01T00:00:00) 范围内的 300 个柱形图，而您的后端在请求的时间段内只有 250 个柱形图。返回 2019-06-01T00:00:00 之前的这 250 个柱和 50 个柱
   * 在不太可能发生的情况下，请求范围内的柱数大于 countBack 值，那么您应该返回该范围内的所有柱，而不是将其截断为 countBack 长度。
   * 如果没有剩余数据（换句话说，当前响应返回空数组，并且服务器上没有较旧的数据），则将 noData 设置为 true 以阻止进一步的请求。
   *
   * @param symbolInfo 商品信息对象
   * @param resolution string （周期）
   * @param periodParams from: unix 时间戳, 最左边请求的K线时间, to:unix 时间戳, 最右边请求的K线时间, firstDataRequest: 布尔值，以标识是否第一次调用此商品/周期的历史记录, countBack: 加载所需的条数
   * @param onHistoryCallback 历史数据的回调函数。每次请求只应被调用一次。
   * @param onErrorCallback 错误的回调函数。
   */
  getBars(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) {
    const { from, to, firstDataRequest, countBack } = periodParams
    this.setActiveSymbolInfo({ symbolInfo, resolution })
    this.getDataFeedBarCallback({
      symbolInfo,
      resolution,
      from,
      to,
      countBack,
      onHistoryCallback,
      onErrorCallback,
      firstDataRequest,
    })
  }

  /**
   * 订阅K线数据。图表库将调用onRealtimeCallback方法以更新实时数据。这里只有一个订阅者，不对多个订阅者做处理，简化操作
   *
   * 这里只是增加一个订阅者，把添加更新数据的回调函数存到外层，回调函数的调用实际是在前面 getBars() 里完成的。相当于这个函数只是排个队，所有数据的获取和分发都在 getBars() 里进行
   * @param symbolInfo 商品信息
   * @param resolution 分辨率
   * @param onRealtimeCallback 实时更新的回调函数
   * @param subscriberUID 监听的唯一标识符
   * @param onResetCacheNeededCallback 将在bars数据发生变化时执行
   */
  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
    this.setActiveSymbolInfo({
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
    })

    mitt.on('symbol_change', () => {
      // tvWidget.activeChart().resetData()
      // 使图表重新请求 datafeed 中的数据。 通常你需要在图表数据发生变化时调用它。 在调用这个函数之前，你应该从 subscribeBars 调用 onResetCacheNeededCallback
      onResetCacheNeededCallback()
    })
  }

  /**
   * 取消订阅，不做处理
   * @param subscriberUID
   */
  unsubscribeBars(subscriberUID) {
    this.removeActiveSymbol(subscriberUID)
  }
}

export default DataFeedBase
