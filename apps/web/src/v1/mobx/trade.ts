// import { getIntl } from '@umijs/max'
import { keyBy } from 'lodash-es'
import { action, computed, configure, makeAutoObservable, makeObservable, observable, runInAction } from 'mobx'

import { getTradeSymbolCategory } from '@/v1/services/api/common'
import { getTradeSymbolList } from '@/v1/services/api/tradeCore/account'
import { getAccountGroupList } from '@/v1/services/api/tradeCore/accountGroup'
import {
  cancelOrder,
  createOrder,
  getBgaOrderPage,
  getOrderMargin,
  getOrderPage,
  modifyPendingOrder,
  modifyStopProfitLoss,
} from '@/v1/services/api/tradeCore/order'
import { getAllSymbols } from '@/v1/services/api/tradeCore/symbol'
import { isPCByWidth } from '@/v1/utils'
import mitt from '@/v1/utils/mitt'
// import { push } from '@/utils/navigator'
import {
  STORAGE_GET_CONF_INFO,
  STORAGE_GET_HISTORY_SEARCH,
  STORAGE_GET_ORDER_CONFIRM_CHECKED,
  STORAGE_GET_POSITION_CONFIRM_CHECKED,
  STORAGE_GET_QUICK_PLACE_ORDER_CHECKED,
  STORAGE_GET_TOKEN,
  STORAGE_REMOVE_HISTORY_SEARCH,
  STORAGE_SET_CONF_INFO,
  STORAGE_SET_HISTORY_SEARCH,
  STORAGE_SET_ORDER_CONFIRM_CHECKED,
  STORAGE_SET_POSITION_CONFIRM_CHECKED,
  STORAGE_SET_QUICK_PLACE_ORDER_CHECKED,
} from '@/v1/utils/storage'

import { getEnv } from '@/v1/env/index'
import { getSymbolTicker } from '@/v1/services/api/market/symbol'
import { getSymbolIsHoliday } from '@/v1/services/api/tradeCore/holiday'
// import klineStore from './kline'
import ws, { SymbolWSItem } from './ws'
import { IPositionListSymbolCalcInfo, MarginReteInfo } from './ws.types'
import { toast } from '@mullet/ui/toast'

export type UserConfInfo = Record<
  string,
  {
    /**自选列表 */
    favoriteList?: Account.TradeSymbolListItem[]
    /**激活的品种名称 */
    activeSymbolName?: string
    /**打开的品种名称列表 */
    openSymbolNameList?: Account.TradeSymbolListItem[]
    /**当前切换的账户信息 */
    currentAccountInfo?: User.AccountItem
  }
>

// 底部Tabs交易记录类型
export type IRecordTabKey =
  /**持仓单 */
  | 'POSITION'
  /**挂单 */
  | 'PENDING'
  /**历史挂单(历史委托) */
  | 'HISTORY_PENDING'
  /**历史成交 */
  | 'HISTORY_CLOSE'
  /**历史仓位 */
  | 'HISTORY_POSITION'
  /**资金流水 */
  | 'FUND_RECORD'

// 交易区订单类型
export type ITradeTabsOrderType =
  /**市价单 */
  | 'MARKET_ORDER'
  /**限价单 */
  | 'LIMIT_ORDER'
  /**停损单 */
  | 'STOP_LIMIT_ORDER'

// 禁用 MobX 严格模式
configure({ enforceActions: 'never' })

type AccountBalanceInfo = {
  /**占用保证金 */
  occupyMargin: any
  /**可用保证金 */
  availableMargin: any
  /**账户净值 */
  balance: any
  /**账户总浮动盈亏 */
  totalProfit: any
  /** */
  currentAccountInfo: any
  money: any
}

export type IPriceOrAmountType = 'PRICE' | 'AMOUNT'

export type RecordModalItem = Order.BgaOrderPageListItem | Order.OrderPageListItem

class TradeStore {
  constructor() {
    makeObservable(this) // 使用 makeObservable mobx6.0 才会更新视图
  }
  @observable socket: any = null
  @observable symbolCategory: API.KEYVALUE[] = [] // 品种分类
  @observable symbolListLoading = true
  @observable symbolList: Account.TradeSymbolListItem[] = []
  @observable symbolListAll: Account.TradeSymbolListItem[] = [] // 首次查询的全部品种列表，不按条件查询
  @observable symbolMapAll = {} as { [key: string]: Account.TradeSymbolListItem } // 首次查询的全部品种列表，不按条件查询

  @observable userConfInfo = {} as UserConfInfo // 记录用户设置的品种名称、打开的品种列表、自选信息，按accountId储存
  // 当前accountId的配置信息从userConfInfo展开，切换accountId时，重新设置更新
  @observable activeSymbolName = '' // 当前激活的品种名
  @observable openSymbolNameList = [] as Account.TradeSymbolListItem[] // 记录打开的品种名称列表
  @observable favoriteList = [] as Account.TradeSymbolListItem[] // 自选列表

  @observable currentAccountInfo = {} as User.AccountItem // 当前切换的账户信息
  @observable showBalanceEmptyModal = false // 余额为空弹窗
  @observable accountBalanceInfo = {} as AccountBalanceInfo // 账户余额信息

  //  ========= 交易区操作 =========
  @observable marginType: API.MarginType = 'CROSS_MARGIN' // 交易区保证金类型
  @observable buySell: API.TradeBuySell = 'BUY' // 交易区买卖类型
  @observable isBuy = true // 交易区买卖类型
  @observable orderType: ITradeTabsOrderType = 'MARKET_ORDER' // 交易区订单类型
  @observable leverageMultiple = 1 // 浮动杠杆倍数，默认1
  @observable leverageMultipleMaxOpenVolume = 0 // 浮动杠杆模式点击弹窗确认后，最大可开仓量，显示在可开的位置
  @observable orderQuickPlaceOrderChecked = false // 快速下单默认选择
  @observable orderConfirmChecked = true // 下单二次确认弹窗
  @observable positionConfirmChecked = true // 平仓二次确认弹窗
  @observable orderVolume = '0.01' // 交易区下单数量
  @observable orderVolumeTag = '' // 手数标签快速选择
  @observable orderSpslChecked = false // 是否选中止盈止损
  @observable orderPrice = '' // 交易区下单价格
  @observable spValue = '' // 止盈输入框-按价格
  @observable slValue = '' // 止损输入框-按价格
  @observable spAmount = '' // 止盈输入框-按金额
  @observable slAmount = '' // 止损输入框-按金额
  @observable spPercent = '' // 止盈输入框-按百分比
  @observable slPercent = '' // 止损输入框-按百分比
  @observable spPriceOrAmountType: IPriceOrAmountType = 'PRICE' // 止盈，下单时，按价格还是按金额计算
  @observable slPriceOrAmountType: IPriceOrAmountType = 'PRICE' // 止损，下单时，按价格还是按金额计算
  @observable isPosition = false // 是否是持仓单/挂单
  // ============================

  // ====== 历史交易记录 ===========
  @observable positionList = [] as Order.BgaOrderPageListItem[] // 持仓列表
  @observable positionListCalcCache = [] as Order.BgaOrderPageListItem[] // 持仓列表-计算处理过浮动盈亏的
  @observable pendingList = [] as Order.OrderPageListItem[] // 挂单列表
  @observable stopLossProfitList = [] as Order.OrderPageListItem[] // 止盈止损列表
  @observable recordTabKey: IRecordTabKey = 'POSITION' // 交易记录切换
  @observable showActiveSymbol = false // 是否展示当前，根据当前激活的品种，搜索交易历史记录
  @observable recordModalItem = {} as RecordModalItem // 持仓单、挂单弹窗item赋值
  @observable pendingListLoading = true // 挂单列表loading
  @observable positionListLoading = true // 持仓列表loading
  // ============================

  @observable currentLiquidationSelectBgaId = 'CROSS_MARGIN' // 默认全仓，右下角爆仓选择逐仓、全仓切换
  @observable accountGroupList = [] as AccountGroup.AccountGroupItem[] // 账户组列表
  @observable accountGroupListLoading = false // 账户组列表loading
  @observable accountGroupListInitialized = false // 账户组列表是否初始化, 用于判断是否需要全量初始化或更新

  @observable allSimpleSymbolsMap = {} as { [key: string]: Symbol.AllSymbolItem } // 全部品种列表map，校验汇率品种用到

  @observable switchAccountLoading = false // 切换账户loading效果

  @observable tradePageActive = false // 交易页窗口是否激活
  @observable positionListSymbolCalcInfo = new Map<string, IPositionListSymbolCalcInfo>() // 持仓单计算信息
  @observable rightWidgetSelectMarginInfo = {} as MarginReteInfo // 右下角选择的保证金信息
  @observable expectedMargin = 0 // 预估保证金
  @observable maxOpenVolume = 0 // 最大可开手数
  @observable positionListTotalProfit = 0 // 持仓单总浮动盈亏

  @observable historySearchList = [] as string[] // APP历史搜索记录
  @observable holidaySymbolMap = {} as any // 假期品种map true是正常交易 false是假期内暂停交易

  @observable tradeSymbolTickerMap = {} as Record<string, MarketSymbol.SymbolNewTicker> // 品种列表页面侧边栏 当前品种的ticker 高开低收

  positionListLoadingTimer: any = null // 持仓列表loading定时器
  pendingListLoadingTimer: any = null // 挂单列表loading定时器
  setSwitchAccountLoadingTimer: any = null // 切换账户loading定时器
  checkSocketReadyTimer1: any = null // 检查socket连接定时器
  checkSocketReadyTimer2: any = null // 检查socket连接定时器
  checkSocketReadyTimer3: any = null // 检查socket连接定时器
  setActiveSymbolNameTimer: any = null // 设置激活品种定时器
  getSymbolListTimer1: any = null
  getSymbolListTimer2: any = null
  timeoutTimers: Array<NodeJS.Timeout> = []

  // 初始化加载
  @action
  init = async () => {
    await Promise.all([
      // 初始化打开的品种列表
      this.initOpenSymbolNameList(),
      // 初始化自选列表
      this.initFavoriteList(),
      // 获取全部品种列表作为汇率校验
      this.getAllSimbleSymbols(),
      // 获取持仓列表
      this.getPositionList(),
    ])

    const localOrderQuickPlaceOrderChecked = await STORAGE_GET_QUICK_PLACE_ORDER_CHECKED()
    const localOrderConfirmChecked = await STORAGE_GET_ORDER_CONFIRM_CHECKED()
    const localPositionConfirmChecked = await STORAGE_GET_POSITION_CONFIRM_CHECKED()
    runInAction(() => {
      this.orderQuickPlaceOrderChecked =
        localOrderQuickPlaceOrderChecked !== null ? localOrderQuickPlaceOrderChecked : false
      this.orderConfirmChecked = localOrderConfirmChecked !== null ? localOrderConfirmChecked : true
      this.positionConfirmChecked = localPositionConfirmChecked !== null ? localPositionConfirmChecked : true
      this.historySearchList = STORAGE_GET_HISTORY_SEARCH() || []
    })
  }

  // 关闭定时器
  closeTimer = () => {
    this.timeoutTimers.forEach((timer) => {
      clearTimeout(timer)
    })
    this.timeoutTimers = []
  }

  // 右下角爆仓选择逐仓、全仓切换
  @action
  setCurrentLiquidationSelectBgaId = (value: any) => {
    this.currentLiquidationSelectBgaId = value
  }

  @action
  setSwitchAccountLoading = (loading: boolean) => {
    this.switchAccountLoading = loading
  }

  @action
  setShowActiveSymbol = (value: boolean) => {
    this.showActiveSymbol = value
  }

  @action
  setTradePageActive = (value: boolean) => {
    this.tradePageActive = value
  }

  // 同步worker计算结果
  @action
  setSycCalcRes = (data: any) => {
    runInAction(() => {
      if (data?.maxOpenVolume && data?.maxOpenVolume !== this.maxOpenVolume) {
        this.maxOpenVolume = data?.maxOpenVolume
      }
      if (this.positionListTotalProfit && data?.positionListTotalProfit !== this.positionListTotalProfit) {
        this.positionListTotalProfit = data?.positionListTotalProfit
      }
      if (data?.expectedMargin && data?.expectedMargin !== this.expectedMargin) {
        this.expectedMargin = data?.expectedMargin
      }
      this.accountBalanceInfo = data?.accountBalanceInfo
      this.positionListSymbolCalcInfo = data?.positionListSymbolCalcInfo
      this.rightWidgetSelectMarginInfo = data?.rightWidgetSelectMarginInfo
    })
  }

  // =========== APP品种历史搜索记录 ==========

  // 设置历史搜索记录
  @action
  setHistorySearch = (value: string) => {
    let newList = this.historySearchList.filter((item) => item !== value)
    newList.unshift(value)
    // 只保留最新15条
    if (newList.length > 15) {
      newList = newList.slice(0, 15)
    }
    this.historySearchList = newList
    STORAGE_SET_HISTORY_SEARCH(this.historySearchList)
  }
  // 清空搜索记录
  @action
  removeHistorySearch = () => {
    this.historySearchList = []
    STORAGE_REMOVE_HISTORY_SEARCH()
  }

  // =========== 设置交易区操作 ==========

  // 设置弹窗选择的保证金类型
  @action
  setMarginType = (marginType: API.MarginType) => {
    this.marginType = marginType
  }

  // 设置弹窗选择的浮动杠杆倍数
  @action
  setLeverageMultiple = (leverageMultiple: number) => {
    this.leverageMultiple = leverageMultiple
  }

  // 浮动杠杆模式最大可开手数
  @action
  setLeverageMultipleMaxOpenVolume = (maxOpenVolume: number) => {
    this.leverageMultipleMaxOpenVolume = maxOpenVolume
  }

  // 设置买卖类型切换
  @action
  setBuySell = (buySell: API.TradeBuySell) => {
    this.buySell = buySell
    this.isBuy = buySell === 'BUY'
  }

  // 设置订单类型Tabs切换
  @action
  setOrderType = (orderType: ITradeTabsOrderType) => {
    this.orderType = orderType
  }

  // 下单手数
  @action
  setOrderVolume = (orderVolume: any) => {
    this.orderVolume = orderVolume
  }

  // 设置订单止盈止损
  @action
  setOrderSpslChecked = (flag: boolean) => {
    this.orderSpslChecked = flag
  }

  // 限价单下单价格
  @action
  setOrderPrice = (orderPrice: any) => {
    this.orderPrice = orderPrice
  }

  // 设置手数标签快速选择
  @action
  setOrderVolumeTag = (tag: string) => {
    this.orderVolumeTag = tag
  }

  // 止盈价格输入框
  @action
  setSp = (value: any) => {
    this.spValue = value
  }
  // 止损价格输入框
  @action
  setSl = (value: any) => {
    this.slValue = value
  }

  // 止盈金额输入框
  @action
  setSpAmount = (value: any) => {
    this.spAmount = value
  }
  // 止损价格输入框
  @action
  setSlAmount = (value: any) => {
    this.slAmount = value
  }
  @action
  setSlPercent = (value: any) => {
    this.slPercent = value
  }
  @action
  setSpPercent = (value: any) => {
    this.spPercent = value
  }

  // 止盈 --- 按价格止盈、金额止盈
  @action
  setSpPriceOrAmountType = (type: IPriceOrAmountType) => {
    this.spPriceOrAmountType = type
  }
  @action
  // 止损 --- 按价格止盈、金额止盈
  setSlPriceOrAmountType = (type: IPriceOrAmountType) => {
    this.slPriceOrAmountType = type
  }

  // 设置交易记录持仓单、挂单弹窗数据
  @action
  setRecordModalItem = (item: RecordModalItem) => {
    this.recordModalItem = item
  }

  @action
  setIsPosition = (value: boolean) => {
    this.isPosition = value
  }

  // 设置订单-快速下单
  @action
  setOrderQuickPlaceOrderChecked = (flag: boolean) => {
    this.orderQuickPlaceOrderChecked = flag

    STORAGE_SET_QUICK_PLACE_ORDER_CHECKED(flag)
  }

  // 下单二次确认弹窗-不在提醒
  @action
  setOrderConfirmChecked = (flag: boolean) => {
    this.orderConfirmChecked = flag

    STORAGE_SET_ORDER_CONFIRM_CHECKED(flag)
  }

  // 平仓二次确认弹窗-不在提醒
  @action
  setPositionConfirmChecked = (flag: boolean) => {
    this.positionConfirmChecked = flag

    STORAGE_SET_POSITION_CONFIRM_CHECKED(flag)
  }

  // 重置止盈止损
  @action
  resetSpSl = () => {
    // 将多次UI更新合并为一次
    this.spValue = ''
    this.slValue = ''
    this.spAmount = ''
    this.slAmount = ''
  }

  // 重置交易操作
  @action
  resetTradeAction = (params?: {
    orderVolume?: string
    orderPrice?: string
    orderVolumeTag?: string
    spValue?: string
    slValue?: string
    spAmount?: string
    slAmount?: string
    spPriceOrAmountType?: IPriceOrAmountType
    slPriceOrAmountType?: IPriceOrAmountType
    recordModalItem?: RecordModalItem
    isPosition?: boolean
  }) => {
    const {
      orderVolume = '0.01',
      orderPrice = '',
      orderVolumeTag = '',
      spValue = '',
      slValue = '',
      spAmount = '',
      slAmount = '',
      spPriceOrAmountType = 'PRICE',
      slPriceOrAmountType = 'PRICE',
      recordModalItem = {} as RecordModalItem,
      isPosition = false,
    } = params || {}

    this.orderVolume = orderVolume
    this.orderPrice = orderPrice
    this.orderVolumeTag = orderVolumeTag
    this.spValue = spValue
    this.slValue = slValue
    this.spAmount = spAmount
    this.slAmount = slAmount
    this.spPriceOrAmountType = spPriceOrAmountType as IPriceOrAmountType
    this.slPriceOrAmountType = slPriceOrAmountType as IPriceOrAmountType
    this.recordModalItem = recordModalItem
    this.isPosition = isPosition
  }

  // =============================

  // 获取创建账户页面-账户组列表
  @action
  getAccountGroupList = async () => {
    if (this.accountGroupListLoading) return
    this.accountGroupListLoading = true

    const res = await getAccountGroupList()
    const accountList = (res?.data || []) as AccountGroup.AccountGroupItem[]

    runInAction(() => {
      this.accountGroupList = accountList
      this.accountGroupListLoading = false
    })
    return res
  }

  // 设置账户组列表初始化状态
  setAccountGroupListInitialized = (initialized: boolean) => {
    this.accountGroupListInitialized = initialized
  }

  // 设置当前切换的账户信息
  @action
  setCurrentAccountInfo = async (info: User.AccountItem) => {
    this.currentAccountInfo = info || {}

    // 缓存当前账号
    STORAGE_SET_CONF_INFO(info, `currentAccountInfo`)

    await this.reloadAfterAccountChange()

    // 根据accountId切换本地设置的自选、打开的品种列表、激活的品种名称
    // console.log('切换账号', info)
    // this.init()
  }

  @action
  jumpTrade = () => {
    // 切换账户组关闭行情，重新连接，每个账户组行情不一样
    ws.close()
    ws.initWorker()
    this.setSwitchAccountLoading(true)

    // 需要刷新k线，否则切换不同账号加载的品种不一样
    // push('/trade')

    const timer = setTimeout(() => {
      // 停止动画播放
      this.setSwitchAccountLoading(false)
    }, 2000)
    this.timeoutTimers.push(timer)
  }

  // 使用从worker计算同步的数据
  @action
  getAccountBalance = () => {
    return this.accountBalanceInfo
  }

  // 调用接口计算保证金
  calcMargin = async (params: Order.CreateOrder) => {
    if (!params.orderVolume || !params.symbol) return
    const res = await getOrderMargin(params)
    return Math.abs(res.data || 0)
  }

  // 切换账户后，重载的接口
  @action reloadAfterAccountChange = async () => {
    // 重新加载品种列表
    await this.getSymbolList()
  }

  // ========= 设置打开的品种 =========

  // 初始化本地打开的symbol
  @action
  initOpenSymbolNameList() {
    // this.openSymbolNameList = STORAGE_GET_SYMBOL_NAME_LIST() || []
    // this.activeSymbolName = STORAGE_GET_ACTIVE_SYMBOL_NAME()

    runInAction(() => {
      const userConfInfo = (STORAGE_GET_CONF_INFO() || {}) as UserConfInfo
      this.currentAccountInfo = (userConfInfo?.currentAccountInfo || {}) as User.AccountItem
      const accountId = this.currentAccountInfo?.id
      const currentAccountConf = accountId ? userConfInfo?.[accountId] : {}

      this.userConfInfo = userConfInfo
      this.openSymbolNameList = (currentAccountConf?.openSymbolNameList || []).filter(
        (v) => v,
      ) as Account.TradeSymbolListItem[]
      this.activeSymbolName = currentAccountConf?.activeSymbolName as string
    })
  }

  /**
   * 订阅当前选中及持仓列表品种的行情, 打开页面或切换品种时调用
   * @param cover 是否自动取消其他历史订阅
   */
  @action
  subscribeCurrentAndPositionSymbol = ({ cover = false }: { cover?: boolean }) => {
    const activeSymbolInfo = this.getActiveSymbolInfo()
    // const symbolList = toJS(this.positionList).map((item) => item.symbol) as string[]
    // const symbolList = [activeSymbolInfo, ...this.positionList]
    // const symbolNames = Array.from(new Set(symbolList.map((item) => item.symbol))) as string[]
    const symbolList = this.positionList
    const symbols = Array.from(
      new Set(
        symbolList.map((item) =>
          JSON.stringify({
            accountGroupId: item?.accountGroupId,
            symbol: item.symbol,
            // dataSourceCode: item.dataSourceCode,
            conf: {
              profitCurrency: item.conf?.profitCurrency,
            },
          }),
        ),
      ),
    ).map((str) => JSON.parse(str))

    const timer = setTimeout(() => {
      ws.checkSocketReady(() => {
        console.log('订阅当前选中及持仓列表品种的行情', cover ? '【并取消其他历史订阅】' : '', [
          activeSymbolInfo,
          ...symbols,
        ])
        // 打开行情订阅
        ws.openPosition({
          symbols: ws.makeWsSymbolBySemi([activeSymbolInfo, ...symbols]),
          cover,
        })

        /** 动态订阅汇率品种行情，用于计算下单时保证金等 */

        // 1. 持仓列表品种
        symbols.forEach((item) => {
          if (item?.conf) {
            ws.subscribeExchangeRateQuote(item.conf, item.symbol)
          }
        })
        // 2. 当前选中品种
        ws.subscribeExchangeRateQuote()
      })
    })
    this.timeoutTimers.push(timer)
  }

  @action
  subscribePositionSymbol = ({ cover = true }: { cover?: boolean }) => {
    const symbolList = this.positionList
    const symbols = Array.from(
      new Set(
        symbolList.map((item) =>
          JSON.stringify({
            accountGroupId: item?.accountGroupId,
            symbol: item.symbol,
            // dataSourceCode: item.dataSourceCode,
            conf: {
              profitCurrency: item.conf?.profitCurrency,
            },
          }),
        ),
      ),
    ).map((str) => JSON.parse(str))

    const timer = setTimeout(() => {
      ws.checkSocketReady(() => {
        console.log('订阅当前持仓列表品种的行情', cover ? '【并取消其他历史订阅】' : '', symbols)
        // 打开行情订阅
        ws.openPosition({
          symbols: ws.makeWsSymbolBySemi(symbols as SymbolWSItem[]),
          cover,
        })

        // 动态订阅汇率品种行情，用于计算下单时保证金等
        symbols.forEach((item) => {
          if (item?.conf) {
            ws.subscribeExchangeRateQuote(item.conf, item.symbol)
          }
        })
      })
    })
    this.timeoutTimers.push(timer)
  }

  @action
  subscribePendingSymbol = ({ cover = false }: { cover?: boolean }) => {
    const accountGroupId = this.currentAccountInfo.accountGroupId
    const symbolList = this.pendingList
    const symbols = Array.from(
      new Set(
        symbolList.map((item) =>
          JSON.stringify({
            accountGroupId: accountGroupId,
            symbol: item.symbol,
            // dataSourceCode: item.dataSourceCode,
            conf: {
              profitCurrency: item.conf?.profitCurrency,
            },
          }),
        ),
      ),
    ).map((str) => JSON.parse(str))

    const timer = setTimeout(() => {
      ws.checkSocketReady(() => {
        console.log('订阅当前挂单列表品种的行情', cover ? '【并取消其他历史订阅】' : '', symbols)
        // 打开行情订阅
        ws.openPosition({
          symbols: ws.makeWsSymbolBySemi(symbols as SymbolWSItem[]),
          cover,
        })

        // 动态订阅汇率品种行情，用于计算下单时保证金等
        symbols.forEach((item) => {
          if (item?.conf) {
            ws.subscribeExchangeRateQuote(item.conf, item.symbol)
          }
        })
      })
    })
    this.timeoutTimers.push(timer)
  }

  // 切换交易品种
  @action
  switchSymbol = (symbol: string) => {
    // 切换k线时如果处于loading状态，在切换其他则不可以点击，等切换成功后再点击，否则会出现跳空问题
    // if (klineStore.switchSymbolLoading) {
    //   return
    // }
    // 记录打开的symbol
    this.setOpenSymbolNameList(symbol)
    // 设置当前当前的symbol
    this.setActiveSymbolName(symbol)
    // 切换品种事件
    mitt.emit('symbol_change')
  }

  // 获取打开的品种完整信息
  @action
  getActiveSymbolInfo = (currentSymbolName?: string, list?: Account.TradeSymbolListItem[]) => {
    const symbol = currentSymbolName || this.activeSymbolName
    const info = this.symbolMapAll?.[symbol] || {}
    return info as Account.TradeSymbolListItem
  }

  // 获取激活品种的dataSourceSymbol，用于获取websocket品种对应的行情
  getActiveDataSourceSymbol = () => {
    const symbolInfo = this.getActiveSymbolInfo()
    return symbolInfo?.dataSourceSymbol || ''
  }

  // 记录打开的symbol
  @action
  setOpenSymbolNameList(name: string) {
    this.setActiveSymbolName(name)
    if (this.openSymbolNameList.some((item) => item.symbol === name)) return
    const symbolItem = this.symbolMapAll?.[name]
    if (symbolItem) {
      this.openSymbolNameList.push(symbolItem)
    }

    this.updateLocalOpenSymbolNameList()
  }

  // 移除打开的symbol
  @action
  removeOpenSymbolNameList(name: string, removeIndex: number) {
    const originList = JSON.parse(JSON.stringify(this.openSymbolNameList))
    const newList = this.openSymbolNameList.filter((item) => item.symbol !== name)

    this.openSymbolNameList = newList
    this.updateLocalOpenSymbolNameList()

    if (this.activeSymbolName === name) {
      // 更新激活的索引
      const nextActiveItem = originList[removeIndex - 1] || originList[removeIndex + 1]
      this.setActiveSymbolName(nextActiveItem)
    }
  }

  // 切换当前打开的symbol
  @action
  setActiveSymbolName(key: string) {
    // 取消订阅上一个的深度报价
    ws.subscribeDepth(true)
    this.activeSymbolName = key

    const timer = setTimeout(() => {
      // STORAGE_SET_ACTIVE_SYMBOL_NAME(key)
      STORAGE_SET_CONF_INFO(key, `${this.currentAccountInfo?.id}.activeSymbolName`)
      // 重新订阅深度
      ws.subscribeDepth()
    }, 50)
    this.timeoutTimers.push(timer)
  }

  // 更新本地缓存的symbol列表
  @action updateLocalOpenSymbolNameList = () => {
    // STORAGE_SET_SYMBOL_NAME_LIST(this.openSymbolNameList)
    STORAGE_SET_CONF_INFO(
      this.openSymbolNameList.filter((v) => v),
      `${this.currentAccountInfo?.id}.openSymbolNameList`,
    )
  }

  // =========== 收藏、取消收藏 ==============

  // 是否收藏品种
  @computed get isFavoriteSymbol() {
    return this.favoriteList.some((item) => item.symbol === this.activeSymbolName && item.checked)
  }

  // 当前激活品种的完整信息
  @computed get activeSymbolInfo() {
    return (
      this.symbolListAll.find((item) => item.symbol === this.activeSymbolName) || ({} as Account.TradeSymbolListItem)
    )
  }

  // 获取本地自选
  @action async initFavoriteList() {
    // const data = await STORAGE_GET_FAVORITE()
    const data = STORAGE_GET_CONF_INFO(`${this.currentAccountInfo?.id}.favoriteList`) || []
    if (Array.isArray(data) && data.length) {
      runInAction(() => {
        this.favoriteList = data
      })
    } else {
      // 重置
      this.favoriteList = []
      this.setDefaultFavorite()
    }
  }

  // 设置默认自选
  @action setDefaultFavorite() {
    // 设置本地默认自选 @TODO 品种动态加载的，先不加默认
    // this.setSymbolFavoriteToLocal(DEFAULT_QUOTE_FAVORITES_CURRENCY)
  }

  // 设置本地自选
  @action async setSymbolFavoriteToLocal(data: any) {
    // if (Array.isArray(data) && data.length) {
    this.favoriteList = data
    // STORAGE_SET_FAVORITE(data)
    STORAGE_SET_CONF_INFO(data, `${this.currentAccountInfo?.id}.favoriteList`)
    // } else {
    // this.setDefaultFavorite()
    // }
  }

  // 切换收藏选中状态
  @action toggleSymbolFavorite(name?: string) {
    const symbolName = name || this.activeSymbolName // 不传name，使用当前激活的
    const index = this.favoriteList.findIndex((v) => v.symbol === symbolName)
    const item = this.symbolMapAll?.[symbolName]

    let newFavoriteList: Account.TradeSymbolListItem[]
    // 删除
    if (index !== -1) {
      newFavoriteList = this.favoriteList.filter((v) => v.symbol !== symbolName)
    } else {
      // 添加到已选列表
      // @ts-ignore
      item.checked = true
      // @ts-ignore
      newFavoriteList = [...this.favoriteList, item]
    }
    this.setSymbolFavoriteToLocal(newFavoriteList)
  }

  // ============================
  // 查询品种分类
  @action
  getSymbolCategory = async () => {
    const ENV = getEnv()
    const res = await getTradeSymbolCategory()
    if (res.success) {
      runInAction(() => {
        const data = res?.data || []
        this.symbolCategory = ENV.SHOW_QUOTE_CATEGORY_ALL_TAB
          ? [{ value: '0', key: '0', label: '全部' }, ...data]
          : [...data.slice(0, -1)]
      })
    }
  }

  // 判断本地收藏的品种是否禁用被下架的
  @action
  disabledSymbol = () => {
    return !this.symbolListAll.some((item) => item.symbol === this.activeSymbolName)
  }

  // 禁用交易
  @action
  disabledTrade = () => {
    // enableConnect 启用禁用账户组
    // isTrade 启用禁用账户交易
    return this.disabledSymbol() || !this.currentAccountInfo.enableTrade || !this.currentAccountInfo.isTrade
  }

  // 禁用切换账户
  @action
  disabledConect = (accountItem?: User.AccountItem) => {
    // enableConnect 启用禁用账户组
    // status 启用禁用账号
    const item = accountItem || this.currentAccountInfo
    return !item.enableConnect || item?.status === 'DISABLED'
  }

  // 禁用交易区操作
  @action
  disabledTradeAction = () => {
    // 账户禁用或者是休市状态
    return this.disabledTrade() || !this.isMarketOpen()
  }

  // 判断是否休市状态，根据当前时间判断是否在交易时间段内
  @action
  isMarketOpen = (symbol?: string) => {
    const symbolInfo = this.getActiveSymbolInfo(symbol)
    const tradeTimeConf = symbolInfo?.symbolConf?.tradeTimeConf || []

    if (this.isSymbolInHoliday(symbol)) return false
    if (!symbolInfo.id) return false

    const now = new Date()
    const currentDay = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][now.getDay()]
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    // @ts-ignore
    const dayConfig = tradeTimeConf.find((config: any) => config.weekDay === currentDay)
    if (!dayConfig) return false

    // 每隔两个值表示一个时间段，第一个值表示开始时间，第二个值表示结束时间。时间按分钟计算
    for (let i = 0; i < dayConfig.trade.length; i += 2) {
      const start = dayConfig.trade[i]
      const end = dayConfig.trade[i + 1]
      if (currentMinutes >= start && currentMinutes <= end) {
        return true
      }
    }

    return false
  }

  // 获取全部品种列表
  @action
  getAllSimbleSymbols = async () => {
    const res = await getAllSymbols()
    runInAction(() => {
      const data = res.data as Symbol.AllSymbolItem[]
      this.allSimpleSymbolsMap = keyBy(data, 'symbol')
    })
  }

  // 根据账户id查询侧边栏菜单交易品种列表
  @action
  getSymbolList = async (params = {} as Partial<Account.TradeSymbolListParams>) => {
    const isPc = isPCByWidth()
    const accountId = params?.accountId || this.currentAccountInfo?.id
    if (!accountId) return
    // 查询全部
    if (params.classify === '0') {
      delete params.classify
    }
    const cacheSymbolList = STORAGE_GET_CONF_INFO(`${this.currentAccountInfo?.id}.symbolList`) || []
    // 如果缓存有优先取一次缓存的展示
    if (cacheSymbolList?.length) {
      this.symbolList = cacheSymbolList
      this.symbolListAll = cacheSymbolList
      this.symbolMapAll = keyBy(cacheSymbolList, 'symbol') // 存一份 map

      runInAction(() => {
        const timer = setTimeout(
          () => {
            this.symbolListLoading = false
          },
          isPc ? 0 : 800,
        )
        this.timeoutTimers.push(timer)
      })
    }
    const res = await getTradeSymbolList({ ...params, accountId }).catch((e) => e)
    runInAction(() => {
      const timer = setTimeout(
        () => {
          this.symbolListLoading = false
        },
        isPc ? 0 : 800,
      )
      this.timeoutTimers.push(timer)
    })
    if (res.success) {
      const symbolList = (res.data || []) as Account.TradeSymbolListItem[]
      runInAction(() => {
        this.symbolList = symbolList
        // 查询全部的品种列表
        if (!params.classify) {
          this.symbolListAll = symbolList
          this.symbolMapAll = keyBy(symbolList, 'symbol') // 缓存全部品种列表的map

          // 缓存当前账号的品种列表
          STORAGE_SET_CONF_INFO(symbolList, `${this.currentAccountInfo?.id}.symbolList`)
        }

        // 切换accountId后请求的品种列表可能不一致，设置第一个默认的品种名称
        const firstSymbolName = this.symbolListAll[0]?.symbol
        // 如果当前激活的品种名称不在返回的列表中，则重新设置第一个为激活
        if (firstSymbolName && !this.symbolListAll.some((item) => item.symbol === this.activeSymbolName)) {
          this.activeSymbolName = firstSymbolName
        }
        // 设置默认的
        if (!this.openSymbolNameList.length) {
          // @ts-ignore
          this.setOpenSymbolNameList(firstSymbolName)
        }
      })

      // 获取品种后，动态订阅品种
      ws.checkSocketReady(() => {
        // 打开行情订阅
        ws.openSymbol({
          // 构建参数
          symbols: ws.makeWsSymbolBySemi(this.symbolListAll),
        })
      })

      // 判断品种是否在假期内
      this.getSymbolIsHoliday()
    }
  }

  // new 选择品种后，查询品种的高开低收信息
  @action
  queryTradeSymbolTicker = async (symbol: string) => {
    const res = await getSymbolTicker({ symbol })
    const data = (res?.data || {}) as MarketSymbol.SymbolNewTicker
    runInAction(() => {
      this.tradeSymbolTickerMap = {
        ...this.tradeSymbolTickerMap,
        [symbol]: data,
      }
    })
  }

  @action
  getSymbolIsHoliday = async () => {
    const res = await getSymbolIsHoliday({ symbols: this.symbolListAll.map((item) => item.symbol).join(',') })
    const data = res?.data || ({} as any)
    runInAction(() => {
      if (res.success) {
        this.holidaySymbolMap = data
      }
    })
  }

  // 判断品种是否在假期内
  @action
  isSymbolInHoliday = (symbol: any) => {
    const keys = Object.keys(this.holidaySymbolMap)
    // holidaySymbolMap[symbol] true 正常交易 false在假期内
    return keys.includes(symbol) && this.holidaySymbolMap[symbol] === false
  }

  // 切换交易记录TabKey
  setTabKey = (tabKey: IRecordTabKey) => {
    this.recordTabKey = tabKey

    if (tabKey === 'POSITION') {
      // 持仓
      this.getPositionList(false)
    } else if (tabKey === 'PENDING') {
      // 挂单
      this.getPendingList()
    }
    // else if (tabKey === 'STOPLOSS_PROFIT') {
    // 止盈止损
    // this.getStopLossProfitList()
    // }
  }

  // 查询持仓列表
  @action
  getPositionList = async (cover = false) => {
    const token = await STORAGE_GET_TOKEN()
    if (!token) {
      return
    }

    // 查询进行中的订单
    const res = await getBgaOrderPage({ current: 1, size: 999, status: 'BAG', accountId: this.currentAccountInfo?.id })

    runInAction(() => {
      const timer = setTimeout(() => {
        this.positionListLoading = false
      }, 300)
      this.timeoutTimers.push(timer)
    })

    if (res.success) {
      const data = (res.data?.records || []) as Order.BgaOrderPageListItem[]
      runInAction(() => {
        this.positionList = data
      })

      // h5 动态订阅汇率品种行情, 初始化持仓列表时，不主动取消其他历史订阅
      if (!isPCByWidth()) {
        this.subscribePositionSymbol({ cover })
      }
    }
    return res
  }

  @action
  setPositionListCalcCache = (list: Order.BgaOrderPageListItem[]) => {
    runInAction(() => {
      // this.positionListCalcCache = uniqueObjectArray([...this.positionListCalcCache, ...list], 'id')
      this.positionListCalcCache = list
    })
  }

  // 查询挂单列表
  @action
  getPendingList = async () => {
    const res = await getOrderPage({
      current: 1,
      size: 999,
      status: 'ENTRUST',
      type: 'LIMIT_BUY_ORDER,LIMIT_SELL_ORDER,STOP_LOSS_LIMIT_BUY_ORDER,STOP_LOSS_LIMIT_SELL_ORDER,STOP_LOSS_MARKET_BUY_ORDER,STOP_LOSS_MARKET_SELL_ORDER',
      accountId: this.currentAccountInfo?.id,
    })

    runInAction(() => {
      const timer = setTimeout(() => {
        this.pendingListLoading = false
      }, 300)
      this.timeoutTimers.push(timer)
    })

    if (res.success) {
      runInAction(() => {
        this.pendingList = (res.data?.records || []) as Order.OrderPageListItem[]
      })

      // 动态订阅汇率品种行情, 初始化持仓列表时，不主动取消其他历史订阅
      if (!isPCByWidth()) {
        this.subscribePendingSymbol({ cover: false })
      }
    }
  }
  // 查询止盈止损列表
  @action
  getStopLossProfitList = async () => {
    const res = await getOrderPage({
      current: 1,
      size: 999,
      status: 'ENTRUST',
      type: 'STOP_LOSS_ORDER,TAKE_PROFIT_ORDER',
      accountId: this.currentAccountInfo?.id,
    })
    if (res.success) {
      runInAction(() => {
        this.stopLossProfitList = (res.data?.records || []) as Order.OrderPageListItem[]
      })
    }
  }
  // 下单操作
  // 携带持仓订单号则为平仓单，只需要传递持仓单号、交易账户ID、订单数量、订单类型和反向订单方向，其他参数无效
  createOrder = async (params: Order.CreateOrder) => {
    const orderType = params.type
    // const isBuy = params.buySell === 'BUY'
    const res = await createOrder(params)
    if (res.success) {
      // 市价单：买入卖出单
      if (['MARKET_ORDER'].includes(orderType)) {
        // 更新持仓列表,通过ws推送更新
        // this.getPositionList()
        // 携带持仓订单号则为平仓单
        if (params.executeOrderId) {
          toast.success('平仓成功')
        } else {
          // message.info(intl.formatMessage({ id: 'mt.kaicangchenggong' }))
        }
        // 激活Tab
        tradeMobxStore.setTabKey('POSITION')
      }
      // 限价买入卖出单、停损买入卖出单
      else if (
        [
          'LIMIT_BUY_ORDER',
          'LIMIT_SELL_ORDER',
          'STOP_LOSS_LIMIT_BUY_ORDER',
          'STOP_LOSS_LIMIT_SELL_ORDER',
          'STOP_LOSS_MARKET_BUY_ORDER',
          'STOP_LOSS_MARKET_SELL_ORDER',
        ].includes(orderType)
      ) {
        // 更新挂单列表,通过ws推送更新
        // this.getPendingList()
        toast.success('挂单成功')
        // 激活Tab
        tradeMobxStore.setTabKey('PENDING')
      }
    }
    return res
  }
  // 修改止盈止损
  modifyStopProfitLoss = async (params: Order.ModifyStopProfitLossParams) => {
    const res = await modifyStopProfitLoss(params)
    if (res.success) {
      // 更新持仓列表
      this.getPositionList(false)
      // 更新止盈止损列表
      // this.getStopLossProfitList()

      toast.success('修改止盈止损成功')
      // 激活Tab
      // trade.setTabKey('STOPLOSS_PROFIT')
    }
    return res
  }
  // 修改挂单
  modifyPendingOrder = async (params: Order.UpdatePendingOrderParams) => {
    const res = await modifyPendingOrder(params)
    if (res.success) {
      // 更新挂单列表
      this.getPendingList()

      toast.success('修改挂单成功')
    }
    return res
  }
  // 取消挂单
  cancelOrder = async (params: API.IdParam) => {
    const res = await cancelOrder(params)
    if (res.success) {
      // 更新挂单列表
      this.getPendingList()
      // 更新止盈止损列表
      // this.getStopLossProfitList()
      toast.success('取消挂单成功')
    }
    return res
  }
}

export const tradeMobxStore = new TradeStore()

export default tradeMobxStore
