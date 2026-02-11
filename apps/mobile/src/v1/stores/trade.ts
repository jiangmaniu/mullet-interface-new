import { cloneDeep, keyBy } from 'lodash-es'
import { action, computed, configure, makeObservable, observable, runInAction } from 'mobx'

import { stores } from '@/v1/provider/mobxProvider'
import { t } from '@lingui/core/macro'
import { getTradeSymbolCategory } from '@/v1/services/common'
import { getTradeSymbolList } from '@/v1/services/tradeCore/account'
import { getAccountGroupList } from '@/v1/services/tradeCore/accountGroup'
import {
  cancelOrder,
  createOrder,
  getBgaOrderPage,
  getOrderMargin,
  getOrderPage,
  modifyPendingOrder,
  modifyStopProfitLoss,
} from '@/v1/services/tradeCore/order'
import { getAllSymbols } from '@/v1/services/tradeCore/symbol'
import { toFixed, uniqueObjectArray } from '@/v1/utils'
import { message } from '@/v1/utils/message'
import { push } from '@/v1/utils/navigation'
import {
  STORAGE_GET_CONF_INFO,
  STORAGE_GET_HISTORY_SEARCH,
  STORAGE_GET_ORDER_CONFIRM_CHECKED,
  STORAGE_GET_POSITION_CONFIRM_CHECKED,
  STORAGE_GET_QUICK_PLACE_ORDER_CHECKED,
  STORAGE_GET_TOKEN,
  STORAGE_GET_USER_INFO,
  STORAGE_REMOVE_HISTORY_SEARCH,
  STORAGE_SET_CONF_INFO,
  STORAGE_SET_HISTORY_SEARCH,
  STORAGE_SET_ORDER_CONFIRM_CHECKED,
  STORAGE_SET_POSITION_CONFIRM_CHECKED,
  STORAGE_SET_QUICK_PLACE_ORDER_CHECKED,
} from '@/v1/utils/storage'
import {
  subscribePendingSymbol,
  subscribePositionSymbol,
  useCovertProfitCallback,
  useGetAccountBalanceCallback,
} from '@/v1/utils/wsUtil'

import klineStore from './kline'
import { getSymbolIsHoliday } from '@/v1/services/tradeCore/holiday'
import { DEFAULT_LEVERAGE_MULTIPLE } from '@/v1/constants'
import { getSymbolTicker } from '@/v1/services/market/symbol'

export type UserConfInfo = Record<
  string,
  {
    /** 自选列表 */
    favoriteList?: Account.TradeSymbolListItem[]
    /** 激活的品种名称 */
    activeSymbolName?: string
    /** 打开的品种名称列表 */
    openSymbolNameList?: Account.TradeSymbolListItem[]
    /** 当前切换的账户信息 */
    currentAccountInfo?: User.AccountItem
  }
>

// 底部Tabs交易记录类型
export type IRecordTabKey =
  /** 持仓单 */
  | 'POSITION'
  /** 挂单 */
  | 'PENDING'
  /** 历史挂单(历史委托) */
  | 'HISTORY_PENDING'
  /** 历史成交 */
  | 'HISTORY_CLOSE'
  /** 历史仓位 */
  | 'HISTORY_POSITION'
  /** 资金流水 */
  | 'FUND_RECORD'

// 交易区订单类型
export type ITradeTabsOrderType =
  /** 市价单 */
  | 'MARKET_ORDER'
  /** 限价单 */
  | 'LIMIT_ORDER'
  /** 停损单 */
  | 'STOP_LIMIT_ORDER'

export type IPriceOrAmountType = 'PRICE' | 'AMOUNT'

export type RecordModalItem = Order.BgaOrderPageListItem | Order.OrderPageListItem

// 禁用 MobX 严格模式
configure({ enforceActions: 'never' })

class TradeStore {
  constructor() {
    makeObservable(this) // 使用 makeObservable mobx6.0 才会更新视图
    // app 启动时，初始化
    // this.init()
  }
  @observable socket: any = null
  @observable symbolCategory: API.KEYVALUE[] = [] // 品种分类
  @observable symbolListLoading = true
  @observable symbolListAll: Account.TradeSymbolListItem[] = [] // 首次查询的全部品种列表，不按条件查询
  @observable symbolMapAll = {} as { [key: string]: Account.TradeSymbolListItem } // 首次查询的全部品种列表，不按条件查询
  @observable userConfInfo = {} as UserConfInfo // 记录用户设置的品种名称、打开的品种列表、自选信息，按accountId储存
  // 当前accountId的配置信息从userConfInfo展开，切换accountId时，重新设置更新
  @observable activeSymbolName = '' // 当前激活的品种名
  @observable openSymbolNameList = [] as Account.TradeSymbolListItem[] // 记录打开的品种名称列表
  @observable favoriteList = [] as Account.TradeSymbolListItem[] // 自选列表

  @observable currentAccountInfo = {} as User.AccountItem // 当前切换的账户信息
  @observable showBalanceEmptyModal = false // 余额为空弹窗

  //  ========= 交易区操作 =========
  @observable marginType: API.MarginType = 'CROSS_MARGIN' // 交易区保证金类型
  @observable buySell: API.TradeBuySell = 'BUY' // 交易区买卖类型
  @observable isBuy = true // 交易区买卖类型
  @observable orderType: ITradeTabsOrderType = 'MARKET_ORDER' // 交易区订单类型
  @observable leverageMultiple = DEFAULT_LEVERAGE_MULTIPLE // 浮动杠杆倍数，默认1
  @observable orderSpslChecked = false // 订单止盈止损按钮是否选中
  @observable orderQuickPlaceOrderChecked = false // 快速下单默认选择
  @observable orderConfirmChecked = true // 下单二次确认弹窗
  @observable positionConfirmChecked = true // 平仓二次确认弹窗
  @observable orderVolume = '0.01' // 下单输入框手数
  @observable orderVolumeTag = '' // 手数标签快速选择
  @observable orderPrice = '' // 下单输入框价格，限价单、停损单
  @observable spValue = '' // 止盈输入框-按价格
  @observable slValue = '' // 止损输入框-按价格
  @observable spAmount = '' // 止盈输入框-按金额
  @observable slAmount = '' // 止损输入框-按金额
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
  @observable accountGroupListLoading = 0 // 账户组列表loading
  @observable accountGroupListInitialized = false // 账户组列表是否初始化, 用于判断是否需要全量初始化或更新

  @observable allSimpleSymbolsMap = {} as { [key: string]: Symbol.AllSymbolItem } // 全部品种列表map，校验汇率品种用到

  @observable switchAccountLoading = false // 切换账户loading效果
  @observable historySearchList = [] as string[] // 历史搜索记录
  @observable holidaySymbolMap = {} as any // 假期品种map true是正常交易 false是假期内暂停交易

  @observable tradeSymbolTickerMap = {} as Record<string, MarketSymbol.SymbolNewTicker> // 品种列表页面侧边栏 当前品种的ticker 高开低收

  // 初始化加载
  init = async () => {
    // 初始化打开的品种列表
    this.initOpenSymbolNameList()
    // 初始化自选列表
    this.initFavoriteList()
    // 获取全部品种列表作为汇率校验
    this.getAllSimbleSymbols()
    // debug：這裡需要獲取持倉列表，用於計算可用預付款
    this.getPositionList()

    // this.watchPositionsProfit()

    const localOrderQuickPlaceOrderChecked = await STORAGE_GET_QUICK_PLACE_ORDER_CHECKED()
    const localOrderConfirmChecked = await STORAGE_GET_ORDER_CONFIRM_CHECKED()
    const localPositionConfirmChecked = await STORAGE_GET_POSITION_CONFIRM_CHECKED()
    this.orderQuickPlaceOrderChecked =
      localOrderQuickPlaceOrderChecked !== null ? localOrderQuickPlaceOrderChecked : false
    this.orderConfirmChecked = localOrderConfirmChecked !== null ? localOrderConfirmChecked : true
    this.positionConfirmChecked = localPositionConfirmChecked !== null ? localPositionConfirmChecked : true
    this.historySearchList = (await STORAGE_GET_HISTORY_SEARCH()) || []
  }

  // 监听 positionList 中任何 profit 的变化
  // watchPositionsProfit = () => {
  //   this.positionList.forEach((item) => {
  //     reaction(
  //       () => item.profit, // 追踪每个 item 的 value
  //       (newValue, oldValue) => {
  //         // console.log(`Item ${item.id}: value changed from ${oldValue} to ${newValue}`)
  //       }
  //     )
  //   })
  // }

  // 右下角爆仓选择逐仓、全仓切换
  setCurrentLiquidationSelectBgaId = (value: any) => {
    this.currentLiquidationSelectBgaId = value
  }

  setSwitchAccountLoading = (loading: boolean) => {
    this.switchAccountLoading = loading
  }

  setShowActiveSymbol = (value: boolean) => {
    this.showActiveSymbol = value
  }

  // 设置交易记录持仓单、挂单弹窗数据
  setRecordModalItem = (item: RecordModalItem) => {
    this.recordModalItem = item
  }

  // 设置历史搜索记录
  setHistorySearch = (value: string) => {
    let list = this.historySearchList.filter((v) => v !== value)
    list.unshift(value)
    // 只保留最新15条
    if (list.length > 15) {
      list = list.slice(0, 15)
    }
    this.historySearchList = list
    STORAGE_SET_HISTORY_SEARCH(list)
  }
  // 清空搜索记录
  removeHistorySearch = () => {
    this.historySearchList = []
    STORAGE_REMOVE_HISTORY_SEARCH()
  }

  // =========== 设置交易区操作 ==========

  // 设置弹窗选择的保证金类型
  setMarginType = (marginType: API.MarginType) => {
    this.marginType = marginType
  }

  // 设置弹窗选择的浮动杠杆倍数
  setLeverageMultiple = (leverageMultiple: number) => {
    this.leverageMultiple = leverageMultiple
  }

  // 设置买卖类型切换
  setBuySell = (buySell: API.TradeBuySell) => {
    this.buySell = buySell
    this.isBuy = buySell === 'BUY'
  }

  // 设置订单类型Tabs切换
  setOrderType = (orderType: ITradeTabsOrderType) => {
    this.orderType = orderType
  }

  // 设置订单止盈止损
  setOrderSpslChecked = (flag: boolean) => {
    this.orderSpslChecked = flag

    // 重置止盈止损输入框
    this.resetSpSl()
  }

  // 设置订单手数
  setOrderVolume = (orderVolume: any) => {
    this.orderVolume = orderVolume
  }

  // 设置订单价格：限价、停损单价格
  setOrderPrice = (price: any) => {
    this.orderPrice = price
  }

  // 设置手数标签快速选择
  setOrderVolumeTag = (tag: string) => {
    this.orderVolumeTag = tag
  }

  // 止盈价格输入框
  @action
  setSp = (value: string) => {
    this.spValue = value
  }
  // 止损价格输入框
  @action
  setSl = (value: string) => {
    this.slValue = value
  }

  // 止盈金额输入框
  @action
  setSpAmount = (value: string) => {
    this.spAmount = value
  }
  // 止损价格输入框
  @action
  setSlAmount = (value: string) => {
    this.slAmount = value
  }

  // 设置订单-快速下单
  setOrderQuickPlaceOrderChecked = (flag: boolean) => {
    this.orderQuickPlaceOrderChecked = flag

    STORAGE_SET_QUICK_PLACE_ORDER_CHECKED(flag)
  }

  // 下单二次确认弹窗-不在提醒
  setOrderConfirmChecked = (flag: boolean) => {
    this.orderConfirmChecked = flag

    STORAGE_SET_ORDER_CONFIRM_CHECKED(flag)
  }

  // 平仓二次确认弹窗-不在提醒
  setPositionConfirmChecked = (flag: boolean) => {
    this.positionConfirmChecked = flag

    STORAGE_SET_POSITION_CONFIRM_CHECKED(flag)
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

  setIsPosition = (value: boolean) => {
    this.isPosition = value
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

  // 重置止盈止损
  resetSpSl = () => {
    this.spValue = ''
    this.slValue = ''
    this.spAmount = ''
    this.slAmount = ''
    this.spPriceOrAmountType = 'PRICE'
  }

  // =============================

  // 获取创建账户页面-账户组列表
  getAccountGroupList = async () => {
    let now = Date.now()
    // 30秒内只请求一次
    if (this.accountGroupListLoading && now - this.accountGroupListLoading < 1000 * 30) return
    this.accountGroupListLoading = now

    const res = await getAccountGroupList()
    const accountList = (res?.data || []) as AccountGroup.AccountGroupItem[]
    runInAction(() => {
      this.accountGroupList = accountList
      // this.accountGroupListLoading = false
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
    await STORAGE_SET_CONF_INFO(info, `currentAccountInfo`)

    this.reloadAfterAccountChange()

    // 根据accountId切换本地设置的自选、打开的品种列表、激活的品种名称1
    this.init()
  }

  @action
  jumpTrade = () => {
    this.setSwitchAccountLoading(true)

    // 需要刷新k线，否则切换不同账号加载的品种不一样
    push('Trade')
    // @ts-ignore
    klineStore.tvWidget = null // 非交易页面跳转需要重置trandview实例，否则报错

    setTimeout(() => {
      // 停止动画播放
      this.setSwitchAccountLoading(false)
    }, 2000)
  }

  // // 获取当前账户账户余额、保证金信息
  // @action
  // getAccountBalance = () => {
  //   const currentAccountInfo = this.currentAccountInfo
  //   const currencyDecimal = currentAccountInfo.currencyDecimal

  // 账户余额
  // const money = Number(toFixed(currentAccountInfo.money || 0, currencyDecimal))
  // // 当前账户占用的保证金 = 逐仓保证金 + 全仓保证金（可用保证金）
  // const occupyMargin = Number(
  //   toFixed(Number(currentAccountInfo?.margin || 0) + Number(currentAccountInfo?.isolatedMargin || 0), currencyDecimal)
  // )
  // // 可用保证金
  // let availableMargin = Number(toFixed(money - occupyMargin, currencyDecimal))
  // // 持仓总浮动盈亏
  // const totalOrderProfit = Number(toFixed(getCurrentAccountFloatProfit(positionList), currencyDecimal))
  // // 持仓单总的库存费
  // const totalInterestFees = positionList.reduce((total, next) => total + Number(next.interestFees || 0), 0) || 0
  // // 持仓单总的手续费
  // const totalHandlingFees = positionList.reduce((total, next) => total + Number(next.handlingFees || 0), 0) || 0
  // // 净值 = 账户余额 + 库存费 + 手续费 + 浮动盈亏
  // const balance = Number(Number(currentAccountInfo.money || 0) + totalInterestFees - totalHandlingFees + totalOrderProfit)

  // // 账户总盈亏 = 所有订单的盈亏 + 所有订单的库存费 + 所有订单的手续费
  // const totalProfit = totalOrderProfit + totalInterestFees + totalHandlingFees

  // // 账户组设置“可用计算未实现盈亏”时
  // // 新可用预付款=原来的可用预付款+账户的持仓盈亏
  // if (currentAccountInfo?.usableAdvanceCharge === 'PROFIT_LOSS') {
  //   availableMargin = availableMargin + totalProfit
  // }

  // return {
  //   occupyMargin,
  //   availableMargin,
  //   balance,
  //   totalProfit,
  //   currentAccountInfo,
  //   money
  // }
  // }

  // 计算逐仓保证金信息
  @action
  calcIsolatedMarginRateInfo = (filterPositionList: Order.BgaOrderPageListItem[]) => {
    let compelCloseRatio = this.currentAccountInfo.compelCloseRatio || 0 // 强制平仓比例(订单列表都是一样的，同一个账户组)
    let orderMargin = 0 // 订单总的保证金
    let orderBaseMargin = 0 // 基础保证金
    let handlingFees = 0 // 订单总的手续费
    let interestFees = 0 // 订单总的库存费
    let profit = 0 // 订单总的浮动盈亏
    const covertProfit = useCovertProfitCallback()
    const precision = this.currentAccountInfo.currencyDecimal || 2
    filterPositionList.map((item) => {
      const orderProfit = toFixed(covertProfit(item), precision) as any
      orderMargin += Number(item.orderMargin || 0)
      orderBaseMargin += Number(item.orderBaseMargin || 0)
      handlingFees += Number(item.handlingFees || 0)
      interestFees += Number(item.interestFees || 0)
      if (orderProfit) {
        profit += orderProfit
      }
    })
    // 逐仓净值=账户余额（单笔或多笔交易保证金）+ 库存费 + 手续费+浮动盈亏
    const isolatedBalance = Number(
      orderMargin + Number(interestFees || 0) + Number(handlingFees || 0) + Number(profit || 0),
    )
    // 逐仓保证金率：当前逐仓净值 / 当前逐仓订单占用 = 保证金率
    // const marginRate = orderMargin && isolatedBalance ? toFixed((isolatedBalance / orderMargin) * 100) : 0
    // // 新公式：逐仓保证金率 = 订单净值(订单保证金+浮动盈亏) / 基础保证金。
    const marginRate = orderMargin && isolatedBalance ? toFixed((isolatedBalance / orderBaseMargin) * 100) : 0
    const margin = Number(orderMargin * (compelCloseRatio / 100))
    const balance = toFixed(isolatedBalance, 2)

    return {
      marginRate,
      margin,
      balance,
    }
  }

  /**
   *
   * @param item
   * @returns
   */
  /**
   * 计算全仓/逐仓：保证金率、维持保证金
   * @param item 持仓单item
   * @returns
   */
  @action
  getMarginRateInfo = (item?: Order.BgaOrderPageListItem) => {
    const currentLiquidationSelectBgaId = this.currentLiquidationSelectBgaId
    // const getCurrentQuote = useGetCurrentQuoteCallback()
    // const quote = getCurrentQuote()
    // const conf = item?.conf || quote?.symbolConf // 品种配置信息
    // const buySell = this.buySell
    const isCrossMargin =
      item?.marginType === 'CROSS_MARGIN' || (!item && currentLiquidationSelectBgaId === 'CROSS_MARGIN') // 全仓
    // 全仓保证金率：全仓净值/占用 = 保证金率
    // 全仓净值 = 全仓净值 - 逐仓单净值(单笔或多笔)
    // 逐仓保证金率：当前逐仓净值 / 当前逐仓订单占用 = 保证金率
    // 净值=账户余额+库存费+手续费+浮动盈亏
    const getAccountBalance = useGetAccountBalanceCallback()
    let { balance, currentAccountInfo } = getAccountBalance()

    let marginRate = 0
    let margin = 0 // 维持保证金 = 占用保证金 * 强制平仓比例
    const positionList = this.positionList // 注意这里外部传递过来的list是处理过汇率 浮动盈亏的
    let compelCloseRatio = positionList?.[0]?.compelCloseRatio || 0 // 强制平仓比例(订单列表都是一样的，同一个账户组)
    compelCloseRatio = compelCloseRatio ? compelCloseRatio / 100 : 0
    if (isCrossMargin) {
      // 全仓占用的保证金
      const occupyMargin = Number(toFixed(Number(currentAccountInfo.margin || 0), 2))
      // 判断是否存在全仓单
      const hasCrossMarginOrder = positionList.some((item) => item.marginType === 'CROSS_MARGIN')
      if (hasCrossMarginOrder) {
        // 逐仓保证金信息
        const marginInfo = this.calcIsolatedMarginRateInfo(
          this.positionList.filter((item) => item.marginType === 'ISOLATED_MARGIN'),
        )
        // 全仓净值：全仓净值 - 逐仓净值
        const crossBalance = Number(toFixed(balance - marginInfo.balance, 2))
        balance = crossBalance
        marginRate = occupyMargin ? toFixed((balance / occupyMargin) * 100) : 0
        margin = Number(occupyMargin * compelCloseRatio)

        // console.log('逐仓净值', marginInfo.balance)
        // console.log('计算后的全仓净值', balance)
        // console.log('全仓occupyMargin', occupyMargin)
        // console.log('marginRate', marginRate)
      }
    } else {
      let filterPositionList = [item] as Order.BgaOrderPageListItem[]
      // 逐仓模式保证金
      const marginInfo = this.calcIsolatedMarginRateInfo(filterPositionList)
      return marginInfo
    }

    return {
      marginRate,
      margin,
      balance,
    }
  }

  // 计算当前账户总的浮动盈亏
  // @action
  // getCurrentAccountFloatProfit = () => {
  //   const covertProfit = useCovertProfitCallback()
  //   return useCallback(
  //     (list: Order.BgaOrderPageListItem[]) => {
  //       const data = cloneDeep(list)
  //       // 持仓总浮动盈亏
  //       let totalProfit = 0
  //       if (data.length) {
  //         data.forEach((item: Order.BgaOrderPageListItem) => {
  //           // const precision = item?.symbolDecimal || 2
  //           const profit = covertProfit(item) // 浮动盈亏
  //           item.profit = profit
  //           totalProfit += Number(item.profit || 0)
  //         })
  //       }
  //       return totalProfit
  //     },
  //     [covertProfit]
  //   )
  // }

  // 调用接口计算保证金
  calcMargin = async (params: Order.CreateOrder) => {
    if (!params.orderVolume || !params.symbol) return
    const res = await getOrderMargin(params)
    return Math.abs(res.data || 0)
  }

  // 切换账户后，重载的接口
  @action reloadAfterAccountChange = () => {
    // 重新加载品种列表
    this.getSymbolList()
  }

  // ========= 设置打开的品种 =========

  // 初始化本地打开的symbol
  @action
  async initOpenSymbolNameList() {
    // this.openSymbolNameList = STORAGE_GET_SYMBOL_NAME_LIST() || []
    // this.activeSymbolName = STORAGE_GET_ACTIVE_SYMBOL_NAME()

    const userConfInfo = ((await STORAGE_GET_CONF_INFO()) || {}) as UserConfInfo
    this.currentAccountInfo = (userConfInfo?.currentAccountInfo || {}) as User.AccountItem
    const accountId = this.currentAccountInfo?.id
    const currentAccountConf = accountId ? userConfInfo?.[accountId] : {}

    this.userConfInfo = userConfInfo
    this.openSymbolNameList = (currentAccountConf?.openSymbolNameList || []).filter(
      (v) => v,
    ) as Account.TradeSymbolListItem[]
    console.log('切换accountId后请求的品种列表可能不一致，设置第一个默认的品种名称')
    this.activeSymbolName = currentAccountConf?.activeSymbolName as string
  }

  // 切换交易品种
  @action
  switchSymbol = (symbol: string) => {
    // 切换k线时如果处于loading状态，在切换其他则不可以点击，等切换成功后再点击，否则会出现跳空问题
    // if (klineStore.switchSymbolLoading) return
    // 记录打开的symbol
    this.setOpenSymbolNameList(symbol)
    // 设置当前当前的symbol
    this.setActiveSymbolName(symbol)

    // 切换品种事件
    // mitt.emit('symbol_change')
    // 重置止盈止损输入框
    this.resetSpSl()
  }

  // 获取打开的品种完整信息
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
    this.openSymbolNameList.push(symbolItem)
    this.updateLocalOpenSymbolNameList()
  }

  // 移除打开的symbol
  @action
  removeOpenSymbolNameList(name: string, removeIndex: number) {
    const originList = cloneDeep(this.openSymbolNameList)
    const newList = this.openSymbolNameList.filter((item) => item.symbol !== name)

    this.openSymbolNameList = newList
    this.updateLocalOpenSymbolNameList()

    if (this.activeSymbolName === name) {
      // 更新激活的索引
      const nextActiveItem = originList[removeIndex - 1] || originList[removeIndex + 1]
      // @ts-ignore
      this.setActiveSymbolName(nextActiveItem)
    }
  }

  // 切换当前打开的symbol
  @action
  setActiveSymbolName = async (key: string) => {
    console.log('切换当前打开的symbol', key)
    this.activeSymbolName = key
    // STORAGE_SET_ACTIVE_SYMBOL_NAME(key)
    await STORAGE_SET_CONF_INFO(key, `${this.currentAccountInfo?.id}.activeSymbolName`)

    // 重新订阅深度
    stores.ws.subscribeDepth(this.symbolMapAll?.[key])
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

  // 获取本地自选
  @action async initFavoriteList() {
    // const data = await STORAGE_GET_FAVORITE()
    const data = (await STORAGE_GET_CONF_INFO(`${this.currentAccountInfo?.id}.favoriteList`)) || []
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
    // 删除
    if (index !== -1) {
      // this.favoriteList.splice(index, 1)
      // 直接 splice ， mobx 监听失效
      this.favoriteList = this.favoriteList.filter((v) => v.symbol !== symbolName)

      message.info(t`Favorite Cancel Success`)
    } else {
      // 添加到已选列表
      item.checked = true
      // this.favoriteList.push(item)
      // 直接 push ， mobx 监听失效
      this.favoriteList = [...this.favoriteList, item]
      message.info(t`Favorite Success`)
    }
    this.setSymbolFavoriteToLocal(this.favoriteList)
  }

  // ============================
  // 查询品种分类
  @action
  getSymbolCategory = async () => {
    const res = await getTradeSymbolCategory()
    if (res.success) {
      runInAction(() => {
        this.symbolCategory = [{ value: '0', key: '0', label: t`All` }, ...(res?.data || [])]
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
    try {
      // 判断是否登录
      const userInfo = await STORAGE_GET_USER_INFO()
      if (!userInfo) {
        return
      }

      const res = await getAllSymbols()
      runInAction(() => {
        const data = res.data as Symbol.AllSymbolItem[]
        this.allSimpleSymbolsMap = keyBy(data, 'symbol')
      })
    } catch (error) {
      console.log('getAllSimbleSymbols error', error)
    }
  }

  // 是否是大宗商品
  @action
  getIsCommodities = () => {
    // return this.symbolCategory.find((item: any) => item.value === 'Commodities')
    return true
  }

  // 根据账户id查询侧边栏菜单交易品种列表
  @action
  getSymbolList = async (params = {} as Partial<Account.TradeSymbolListParams>) => {
    const accountId = params?.accountId || this.currentAccountInfo?.id

    if (!accountId) {
      this.symbolListLoading = false
      return
    }
    // 查询全部
    if (params.classify === '0') {
      delete params.classify
    }
    const cacheSymbolList = (await STORAGE_GET_CONF_INFO(`${this.currentAccountInfo?.id}.symbolList`)) || []
    // 如果缓存有优先取一次缓存的展示
    if (
      cacheSymbolList?.length &&
      (!this.symbolListAll.length || this.symbolListAll.length !== cacheSymbolList.length)
    ) {
      runInAction(() => {
        this.symbolListAll = cacheSymbolList
        this.symbolMapAll = keyBy(cacheSymbolList, 'symbol') // 存一份 map
        setTimeout(() => {
          this.symbolListLoading = false
        }, 800)
      })

      return
    }

    try {
      const res = await getTradeSymbolList({ ...params, accountId }).catch((e) => e)
      runInAction(() => {
        setTimeout(() => {
          this.symbolListLoading = false
        }, 800)
      })
      if (res.success) {
        const resSymbolList = (res.data || []) as Account.TradeSymbolListItem[]
        runInAction(() => {
          // 查询全部的品种列表
          if (!params.classify) {
            this.symbolListAll = resSymbolList
            this.symbolMapAll = keyBy(resSymbolList, 'symbol') // 缓存全部品种列表的map

            // 缓存当前账号的品种列表
            STORAGE_SET_CONF_INFO(resSymbolList, `${this.currentAccountInfo?.id}.symbolList`)
          }

          // 切换accountId后请求的品种列表可能不一致，设置第一个默认的品种名称
          const firstSymbolName = this.symbolListAll[0]?.symbol
          // 如果当前激活的品种名称不在返回的列表中，则重新设置第一个为激活
          if (firstSymbolName && !this.symbolListAll.some((item) => item.symbol === this.activeSymbolName)) {
            this.activeSymbolName = firstSymbolName
          }
          // 设置默认的
          if (!this.openSymbolNameList.length) {
            this.setOpenSymbolNameList(firstSymbolName)
          }
        })

        // 获取品种后，动态订阅品种
        if (stores.ws.socket?.readyState === 1) {
          // TODO: 这里需要优化，如果切换之后是持仓页面或交易页面，只需要订阅当前品种和持仓列表品种
          setTimeout(() => {
            stores.ws.checkSocketReady(() => {
              // 打开行情订阅
              stores.ws.openSymbol({
                // 构建参数
                symbols: stores.ws.makeWsSymbolBySemi(this.symbolListAll),
              })
            })
          }, 400)
        }

        // 判断品种是否在假期内
        this.getSymbolIsHoliday()
      }
    } finally {
      runInAction(() => {
        this.symbolListLoading = false
      })
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
      // this.getPositionList() // 改到组件中调用
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
      setTimeout(() => {
        this.positionListLoading = false
      }, 300)
    })

    if (res.success) {
      const data = (res.data?.records || []) as Order.BgaOrderPageListItem[]
      runInAction(() => {
        this.positionList = data
      })

      // 动态订阅汇率品种行情, 初始化持仓列表时，不主动取消其他历史订阅
      subscribePositionSymbol({ cover })
    }

    return res
  }

  @action
  setPositionListCalcCache = (list: Order.BgaOrderPageListItem[]) => {
    runInAction(() => {
      this.positionListCalcCache = uniqueObjectArray([...this.positionListCalcCache, ...list], 'id')
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
      setTimeout(() => {
        this.pendingListLoading = false
      }, 300)
    })

    if (res.success) {
      runInAction(() => {
        this.pendingList = (res.data?.records || []) as Order.OrderPageListItem[]
      })

      // 动态订阅汇率品种行情, 初始化持仓列表时，不主动取消其他历史订阅
      subscribePendingSymbol({ cover: false })
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

    let state = -1
    if (res.success) {
      // 市价单：买入卖出单
      if (['MARKET_ORDER'].includes(orderType)) {
        // 更新持仓列表,通过ws推送更新
        this.getPositionList()
        // 携带持仓订单号则为平仓单
        if (params.executeOrderId) {
          state = 1
          // message.info(i18n.t('pages.trade.Close Position Success'))
        } else {
          state = 0
          // message.info(i18n.t('pages.trade.Open Position Success'))
          // notification.success({
          //   message: i18n.t('pages.trade.Close Position Success'),
          //   description: `${isBuy ? intl.formatMessage({ id: 'mt.mairu' }) : intl.formatMessage({ id: 'mt.maichu' })} ${
          //     params.orderVolume
          //   }${intl.formatMessage({ id: 'mt.lot' })} ${intl.formatMessage({ id: 'mt.jiage' })}:${params.limitPrice}`,
          //   placement: 'bottomLeft',
          //   duration: 5000
          // })
        }
        // 激活Tab
        trade.setTabKey('POSITION')
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

        state = 2

        // message.info(t`Pending Success`)
        // 激活Tab
        trade.setTabKey('PENDING')
      }
    }
    return {
      ...res,
      state,
    }
  }
  // 修改止盈止损
  modifyStopProfitLoss = async (params: Order.ModifyStopProfitLossParams) => {
    const res = await modifyStopProfitLoss(params)
    if (res.success) {
      // 更新持仓列表
      this.getPositionList(true) // 改到组件中调用
      // 更新止盈止损列表
      // this.getStopLossProfitList()

      message.info(t`Modify Spsl Success`)
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

      message.info(t`Pending Success`)
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
      message.info(t`Cancel Success`)
    }
    return res
  }
}

const trade = new TradeStore()

export default trade
