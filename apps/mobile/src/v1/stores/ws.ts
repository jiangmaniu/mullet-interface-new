import { action, configure, makeObservable, observable, runInAction, toJS } from 'mobx'
import ReconnectingWebSocket from 'reconnecting-websocket'

import { formaOrderList } from '@/v1/services/tradeCore/order'
import { STORAGE_GET_TOKEN, STORAGE_GET_USER_INFO } from '@/v1/utils/storage'

import trade from './trade'
// import { onDisplayNotification } from '@/components/Base/Notification'
import { debounce, groupBy } from 'lodash-es'
import { removeOrderMessageFieldNames } from '@/v1/utils/business'
import { getCurrentQuoteV2 } from '@/v1/utils/wsUtil'
import { Platform } from 'react-native'
import { getEnv } from '@/v1/env'
import { uniqueObjectArray } from '@/v1/utils'
import mitt from '@/v1/utils/mitt'

export type IQuotePriceItem = {
  /** 卖交易量 */
  sellSize: number
  /** 买 */
  buy: number
  /** 卖 */
  sell: number
  /** 这个是时间戳13位 */
  id: number
  /* 买交易量 */
  buySize: number
}
export type IQuoteItem = {
  /** 品种名称（后台创建品种，自定义填写的品种名称，唯一）通过账户组订阅的品种行情才会有symbol */
  symbol: string
  /** 账户组id */
  accountGroupId?: string
  /** 价格数据 */
  priceData: IQuotePriceItem
  /** 数据源code+数据源品种 例如huobi-btcusdt */
  dataSource: string
  /** 前端计算的 卖价 上一口报价和下一口报价对比 */
  bidDiff?: number
  /** 前端计算的 买价 上一口报价和下一口报价对比 */
  askDiff?: number
  /** 获取行情数据的key */
  dataSourceKey: string
  /** k线原始数据 */
  klineList?: Omit<IKlinePriceItem, 'symbol'>[]
}

// k线图原始数据
export type IKlinePriceItem = {
  /** 品种名称 */
  symbol: string
  /** 价格 买盘卖价（低价） 没有点差的价格 */
  price: number
  /** 13位时间戳 */
  id: number
}

export type IDepthPriceItem = {
  amount: number
  price: number
}
export type IDepth = {
  /** 品种名称（后台创建品种，自定义填写的品种名称，唯一）通过账户组订阅的品种行情才会有symbol */
  symbol: string
  /** 数据源code+数据源品种 例如huobi-btcusdt */
  dataSource: string
  asks: IDepthPriceItem[]
  bids: IDepthPriceItem[]
  /** 13位时间戳 */
  ts?: number
  /** 账户组id */
  accountGroupId?: string
  /** 数据源key */
  dataSourceKey: string
}

enum MessageType {
  /** 行情 */
  symbol = 'symbol',
  /** 深度报价 */
  depth = 'depth',
  /** 行情 */
  trade = 'trade',
  /** 消息 */
  notice = 'notice',
  /** 需要响应的消息 */
  msg = 'msg'
}
type IMessage = {
  header: {
    flowId: number
    /** 消息类型 */
    msgId: MessageType
    tenantId: string
    /** 用户ID */
    userId: string
  }
  body: any
}

// 消息推送模版
export type MessagePopupInfo = {
  messageLogId: number
  /** 消息级别 eg. WARN */
  grade: string
  isAll: string
  /** 标题 */
  title: string
  type: string
  /** 用户id */
  userId: number
  /** 内容 */
  content: string
}

type ITradeType =
  /** 限价单下单 */
  | 'LIMIT_ORDER'
  /** 订单变更 */
  | 'MARKET_ORDER'
  /** 账户变更 */
  | 'ACCOUNT'
  /** 成交记录 */
  | 'TRADING'

// WebSocket 的四个状态
// https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
export type IReadyState =
  /** 0 WebSocket 连接正在进行中 */
  | 'CONNECTING'
  /** 1 WebSocket 连接已经建立并且可以进行通信 */
  | 'OPEN'
  /** 2 WebSocket 连接正在关闭过程中。此时，客户端或服务器已经开始关闭连接，但连接还没有完全关闭，双方还可以继续发送和接收消息 */
  | 'CLOSEING'
  /** 3 WebSocket 连接已经关闭，连接断开，无法再发送或接收消息 */
  | 'CLOSED'

// 禁用 MobX 严格模式
configure({ enforceActions: 'never' })

export type SymbolWSItem = {
  accountGroupId?: any
  symbol: string
  // dataSourceCode?: any
}
export type SymbolWSItemSemi = {
  symbol: string
  // dataSourceCode?: string
}

const THROTTLE_QUOTE_INTERVAL = Platform.OS === 'ios' ? 280 : 500 // ms
const THROTTLE_DEPTH_INTERVAL = 300 // ms
const MAX_CACHE_SIZE = 150 // 设置最大缓存限制

class WSStore {
  constructor() {
    makeObservable(this) // 使用 makeObservable mobx6.0 才会更新视图
  }

  updateLastQuoteTimer: any = null // 延迟更新最后一口报价
  updateLastDepthTimer: any = null // 延迟更新最后一口深度
  batchQuoteTimer: any = null // 定时更新行情
  batchDepthTimer: any = null // 定时更新深度
  heartbeatInterval: any = null
  heartbeatTimeout = 20000 // 心跳间隔，单位毫秒
  @observable socket: any = null
  originSend: any = null // socket 原生 send 方法
  sendingList: any[] = [] // 发送队列
  sendingSymbols = new Map<string, boolean>() // 发送队列
  toOpenSymbols = new Map<string, boolean>() // 即将打开的符号
  toCloseSymbols = new Map<string, boolean>() // 即将关闭的符号
  quotesCache = [] as any[] // 行情缓存区
  depthCache = [] as any[] // 深度缓存区
  @observable quotes = new Map<string, IQuoteItem>() // 当前行情
  @observable depth = new Map<string, IDepth>() // 当前深度
  @observable symbols = {} // 储存品种请求列表
  @observable websocketUrl = ''
  lastQuoteUpdateTime = 0
  lastDepthUpdateTime = 0
  quoteCount = 0 // 首次加载用到

  // originSend = this.socket.send.bind(this.socket)

  // 工具方法：通过符号列表，生成成品符号列表
  makeWsSymbol = (symbols: string[], _accountGroupId?: string) => {
    const symbolMap = trade.symbolMapAll
    const symbolSemis = symbols.map((symbol) => ({
      symbol
      // dataSourceCode: symbolMap?.[symbol]?.dataSourceCode
    })) as SymbolWSItemSemi[]

    const accountGroupId = _accountGroupId || trade.currentAccountInfo.accountGroupId
    return symbolSemis.map((symbolSemi) => ({ ...symbolSemi, accountGroupId })) as SymbolWSItem[]
  }

  // 工具方法：通过半成品符号列表，生成成品符号列表
  makeWsSymbolBySemi = (symbolSemis: SymbolWSItemSemi[], _accountGroupId?: string) => {
    const accountGroupId = _accountGroupId || trade.currentAccountInfo.accountGroupId
    return symbolSemis.map((symbolSemi) => ({ ...symbolSemi, accountGroupId })) as SymbolWSItem[]
  }

  // 检查socket是否连接，如果未连接，则重新连接
  checkSocketReady = (fn?: () => void) => {
    if (this.socket?.readyState !== 1) {
      // this.reconnect(fn)
      this.connect(fn)
    } else {
      fn?.()
    }
  }

  /** 符号转字符串(唯一识别) */
  symbolToString = (symbol: SymbolWSItem) => {
    // return `${symbol.symbol}-${symbol.accountGroupId}-${symbol.dataSourceCode}`
    return `${symbol.symbol}-${symbol.accountGroupId}`
  }

  stringToSymbol = (str: string): SymbolWSItem => {
    const [symbol, accountGroupId, dataSourceCode] = str.split('-')
    return {
      symbol: symbol === 'undefined' ? '' : symbol,
      accountGroupId: accountGroupId === 'undefined' ? undefined : accountGroupId
      // dataSourceCode: dataSourceCode === 'undefined' ? undefined : dataSourceCode
    }
  }

  /**
   * 打开行情订阅
   * @param symbols 需要订阅的符号列表
   * @param cover 是否取消其他历史订阅
   **/
  openSymbol = ({ symbols, cover }: { symbols: SymbolWSItem[]; cover?: boolean }) => {
    const toSend = new Map<string, boolean>()

    // 找到 symbols 中不在 [正在订阅列表] 中的符号
    symbols?.forEach((symbol) => {
      toSend.set(this.symbolToString(symbol), true)
    })

    if (toSend.size || cover) {
      this.debounceBatchSubscribeSymbol({ toSend, cover })
    }
  }

  /**
   * 批量订阅行情(查询symbol列表后)【先标记后订阅】
   * @param cancel 是否取消订阅
   * @param list 需要订阅的符号列表
   * @param cover 是否取消其他历史订阅
   */
  batchSubscribeSymbol = ({
    cancel = false,
    list = [],
    cover = false
  }: {
    cancel?: boolean
    needAccountGroupId?: boolean
    list?: SymbolWSItem[]
    cover?: boolean
  }) => {
    if (!list?.length) return

    const symbolList = toJS(list)

    console.log(' ')
    console.log(`--- start: 批量${cancel ? '取消' : '订阅'}行情${cover ? '[并取消其他历史订阅]' : ''}:`, symbolList.length)
    // 先打标记
    this.setSendingSymbols({ symbolList, cancel, cover })
  }

  // 弃用 openTrade & closeTrade：20250207， 使用 openPosition & closePosition 代替

  /**
   * 打开仓位订阅
   * @param symbols 需要订阅的符号列表
   * @param cover 是否取消其他历史订阅
   */
  openPosition = ({ symbols, cover = true }: { symbols: SymbolWSItem[]; cover?: boolean }) => {
    this.openSymbol({
      symbols,
      cover
    })
    this.subscribePosition()
  }

  /** 注意：离开仓位页面时，请主动取消订阅 */
  closePosition = () => {
    this.debounceBatchCloseSymbol()
    this.subscribePosition(true)
  }

  @action
  async connect(resolve?: () => void) {
    const token = await STORAGE_GET_TOKEN()
    const { ws: websocketUrl } = await getEnv()
    // token不要传bear前缀
    // 游客传WebSocket:visitor
    this.socket = new ReconnectingWebSocket(websocketUrl, ['WebSocket', token ? token : 'visitor'], {
      minReconnectionDelay: 1,
      connectionTimeout: 3000, // 重连时间
      maxEnqueuedMessages: 0, // 不缓存发送失败的指令
      maxRetries: 10000000 // 最大重连次数
      // debug: process.env.NODE_ENV === 'development' // 测试环境打开调试
    })
    const regex = /"body":\s*(\{.*?\})/

    this.originSend = this.socket.send.bind(this.socket)
    this.socket.send = (cmd?: {}, header?: {}) => {
      // 重写 socket 的 send 方法，记录发送的指令
      // @ts-ignore
      // console.log('cmd', cmd.match(regex)?.[1])
      this.originSend(cmd, header)
    }

    // 监听socket打开事件，开启时打开心跳发送和系统消息监听
    this.socket.addEventListener('open', () => {
      this.startHeartbeat()
      this.subscribeMessage()
      console.log('=============== open ================', this.socket.readyState)
      resolve?.()
    })

    this.socket.addEventListener('message', (d: any) => {
      const res = JSON.parse(d.data)
      this.message(res)
    })
    this.socket.addEventListener('close', () => {})
    this.socket.addEventListener('error', () => {})
  }

  // 订阅消息
  subscribeMessage = async (cancel?: boolean) => {
    const userInfo = (await STORAGE_GET_USER_INFO()) as User.UserInfo
    if (!userInfo?.user_id) return

    // 公共订阅：/{租户ID}/public/1
    // 角色订阅：/{租户ID}/role/{角色ID}
    // 机构订阅：/{租户ID}/dept/{机构ID}
    // 岗位订阅：/{租户ID}/post/{岗位ID}
    // 用户订阅：/{租户ID}/user/{用户ID}
    this.send({
      topic: `/000000/public/1`,
      cancel
    })
    this.send({
      topic: `/000000/role/${userInfo.role_id}`,
      cancel
    })
    this.send({
      topic: `/000000/dept/${userInfo.dept_id}`,
      cancel
    })
    this.send({
      topic: `/000000/post/${userInfo.post_id}`,
      cancel
    })
    this.send({
      topic: `/000000/user/${userInfo?.user_id}`,
      cancel
    })
  }

  // 订阅中消息（目前只订阅支付响应消息：20250327）
  subscribeNotify = async (cancel?: boolean) => {
    const userInfo = (await STORAGE_GET_USER_INFO()) as User.UserInfo
    if (!userInfo?.user_id) return

    console.log('=========订阅响应消息', `/000000/msg/${userInfo?.user_id}`, cancel)
    this.send({
      topic: `/000000/msg/${userInfo?.user_id}`,
      cancel
    })
  }

  // 开始心跳
  startHeartbeat() {
    if (!STORAGE_GET_TOKEN()) return
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      this.send({}, { msgId: 'heartbeat' })
    }, this.heartbeatTimeout)
  }

  // 停止心跳
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // ============ 订阅相关 start ============
  setSendingSymbols = ({ symbolList, cancel, cover }: { symbolList: SymbolWSItem[]; cancel: boolean; cover?: boolean }) => {
    symbolList?.forEach((item) => {
      // 记录当前正在订阅的符号
      if (cancel) {
        this.sendingSymbols.delete(this.symbolToString(item))
        this.toCloseSymbols.set(this.symbolToString(item), true)
      } else {
        this.sendingSymbols.set(this.symbolToString(item), true)
        this.toCloseSymbols.delete(this.symbolToString(item))
      }
    })

    // 如果 cover, 则订阅的同时，关闭未订阅的符号连接
    if (cover) {
      // 将 sendingSymbols 中存在于 _symbolList 以外的 symbol 添加到 toCloseSymbols
      this.sendingSymbols.forEach((_, key) => {
        const exists = symbolList.some((item) => this.symbolToString(item) === key)

        if (!exists) {
          this.toCloseSymbols.set(key, true)
          this.sendingSymbols.delete(key)
        }
      })
    }

    console.log('正在订阅的符号：', this.sendingSymbols.size)
    // console.log('即将关闭的符号：', this.toCloseSymbols)

    // 订阅操作立即执行，取消操作延迟执行
    !cancel && this.subscribeSymbol(symbolList, cancel)

    // 延迟取消订阅
    this.debounceBatchCloseSymbol()

    console.log('--- end -----------------')
  }

  // 订阅或取消订阅行情
  subscribeSymbol = (symbolList: SymbolWSItem[], cancel: boolean) => {
    // console.log(' ===================== ws状态 ===================== ', this.socket?.readyState)
    // 一次性订阅
    const topics = symbolList
      .map((item) => {
        // const topicNoAccount = `/000000/symbol/${item.dataSourceCode}/${item.symbol}`
        const topicAccount = `/000000/symbol/${item.symbol}/${item.accountGroupId}`
        // 如果有账户id，订阅该账户组下的行情，此时行情会加上点差
        // return item.accountGroupId ? topicAccount : topicNoAccount
        return topicAccount
      })
      .join(',')

    console.log('topics', cancel ? '[取消]' : '', symbolList.length)

    this.send({
      topic: topics,
      cancel
    })
  }

  // 动态订阅汇率品种行情
  subscribeExchangeRateQuote = (symbolConf?: Symbol.SymbolConf, symbolName?: string) => {
    const activeSymbolName = symbolName || trade.activeSymbolName
    const quote = getCurrentQuoteV2(this.quotes, activeSymbolName, trade.symbolMapAll)
    // 如果不传，使用当前激活的品种配置
    const conf = symbolConf || quote?.symbolConf
    if (!conf) return

    const allSimpleSymbolsMap = trade.allSimpleSymbolsMap
    const unit = conf?.profitCurrency // 货币单位
    // 乘法
    const divName = ('USD' + unit).toUpperCase() // 如 USDNZD
    // 除法
    const mulName = (unit + 'USD').toUpperCase() // 如 NZDUSD

    const symbolInfo = allSimpleSymbolsMap[divName] || allSimpleSymbolsMap[mulName]

    if (!symbolInfo) return

    const toSend = new Map<string, boolean>()
    toSend.set(
      ws.symbolToString({
        accountGroupId: trade.currentAccountInfo.accountGroupId,
        symbol: symbolInfo.symbol
      }),
      true
    )
    ws.debounceBatchSubscribeSymbol({ toSend })
  }

  // 订阅当前打开的品种深度报价
  subscribeDepth = (symbolInfo?: Account.TradeSymbolListItem, cancel?: boolean) => {
    // const symbolInfo = trade.getActiveSymbolInfo()
    // 深度为0 不需要订阅深度
    if (!symbolInfo?.symbol || symbolInfo.symbolConf?.depthOfMarket === 0) return

    // const topicNoAccount = `/000000/depth/${symbolInfo.dataSourceCode}/${symbolInfo.symbol}`
    const topicAccount = `/000000/depth/${symbolInfo.symbol}/${symbolInfo?.accountGroupId}`
    // 区分带账户组id和不带账户组情况
    // const topic = symbolInfo?.accountGroupId ? topicAccount : topicNoAccount
    const topic = topicAccount

    setTimeout(() => {
      this.send({
        topic,
        cancel
      })
    }, 300)
  }

  // 订阅持仓记录、挂单记录、账户余额信息
  subscribePosition = (cancel?: boolean) => {
    const currentAccountInfo = trade.currentAccountInfo
    const accountId = currentAccountInfo?.id
    if (!accountId) return
    this.send({
      topic: `/000000/trade/${accountId}`,
      cancel
    })
  }

  // 发送socket指令
  @action
  async send(cmd = {}, header = {}) {
    const userInfo = (await STORAGE_GET_USER_INFO()) as User.UserInfo
    // 游客身份userId传123456789
    const userId = userInfo?.user_id || '123456789'
    if (this.socket && this.socket.readyState === 1) {
      this.socket.send(
        JSON.stringify({
          header: { tenantId: '000000', userId, msgId: 'subscribe', flowId: Date.now(), ...header },
          body: {
            cancel: false,
            ...cmd
          }
        })
      )
    }
  }

  @action
  close = () => {
    // 关闭socket指令
    this.socket?.close?.()
    this.stopHeartbeat()
    console.log(' ===================== 关闭socket ===================== ')
  }

  resetData = () => {
    // 清空行情缓存
    this.quotes = new Map()
    // 清空深度缓存
    this.depth = new Map()
  }

  @action
  reconnect(cb?: () => void) {
    // 中断连接再重连
    // console.log(store.account+store.pwd)
    this.close()
    // 重新连接
    setTimeout(() => {
      this.connect(cb)
    }, 500)
  }

  // ================ 更新行情数据 开始 ================
  @action
  updateQuoteData = () => {
    runInAction(() => {
      if (this.quotesCache.length) {
        // 批量解析字符串数据
        const quotesCacheItems = this.quotesCache.map((str) => this.parseQuoteBodyData(str))
        // 按symbol分组
        const symbolMap = groupBy(quotesCacheItems, 'symbol')
        quotesCacheItems.forEach((item: IQuoteItem) => {
          const dataSourceKey = item.dataSourceKey

          if (!dataSourceKey) return

          const quoteData = this.quotes.get(dataSourceKey)

          // 价格数据去重
          let klineList = uniqueObjectArray(
            (symbolMap[item.symbol] || []).map((item) => {
              return {
                price: item.priceData?.buy,
                id: item.priceData?.id
              }
            }),
            'price'
          )

          if (quoteData) {
            const prevSell = quoteData?.priceData?.sell || 0
            const prevBuy = quoteData?.priceData?.buy || 0
            const buy = item.priceData?.buy
            const sell = item.priceData?.sell
            const flag = buy && sell // 买卖都存在，才跳动
            item.bidDiff = flag ? buy - prevBuy : 0 // bid使用买盘的
            item.askDiff = flag ? sell - prevSell : 0 // ask使用卖盘的

            if (item.priceData) {
              // 如果没有最新报价，获取上一口报价
              item.priceData.buy = item.priceData.buy || prevBuy
              item.priceData.sell = item.priceData.sell || prevSell
            }

            // 增量更新有变化的数据
            if (flag && (buy !== prevBuy || sell !== prevSell)) {
              const changedQuoteItem = {
                ...item,
                // 储存原始数据 ，用于K线图播放走一遍全部报价，避免数据过滤丢失绘制的k线跟后台历史数据不一样
                klineList
              }
              this.quotes.set(dataSourceKey, changedQuoteItem)
            }
          } else {
            // 新增行情
            const changedQuoteItem = {
              ...item,
              klineList
            }
            this.quotes.set(dataSourceKey, changedQuoteItem)
          }
        })

        this.quotesCache = []
        this.lastQuoteUpdateTime = Date.now()
      }
    })
  }

  @action
  batchUpdateQuoteData = (data: string) => {
    if (data && typeof data === 'string') {
      this.quotesCache.push(data)

      // 加快首次渲染时间
      if (this.quoteCount < MAX_CACHE_SIZE) {
        this.updateQuoteData()
        this.quoteCount = this.quoteCount + 1
        return
      }

      // 如果缓存太大，强制发送
      if (this.quotesCache.length >= MAX_CACHE_SIZE) {
        this.updateQuoteData()
        return
      }

      const now = Date.now()
      if (now - this.lastQuoteUpdateTime >= THROTTLE_QUOTE_INTERVAL) {
        if (this.quotesCache.length > 0) {
          this.updateQuoteData()
        }
      }
    }
  }

  // ================ 更新行情数据 结束 ================

  // ================ 更新深度 开始 ================
  @action
  updateDepthData = () => {
    runInAction(() => {
      if (this.depthCache.length) {
        this.depthCache.forEach((str) => {
          const item = this.parseDepthBodyData(str)
          const dataSourceKey = item.dataSourceKey
          if (dataSourceKey) {
            if (typeof item.asks === 'string') {
              item.asks = item.asks ? JSON.parse(item.asks) : []
            }
            if (typeof item.bids === 'string') {
              item.bids = item.bids ? JSON.parse(item.bids) : []
            }
            this.depth.set(dataSourceKey, item)
          }
        })

        this.depthCache = []
        this.lastDepthUpdateTime = Date.now()
      }
    })
  }

  // 批量更新深度数据，通过指定数量
  @action
  batchUpdateDepthData = (data: string) => {
    if (data && typeof data === 'string') {
      this.depthCache.push(data)

      // 如果缓存太大，强制发送
      if (this.depthCache.length >= MAX_CACHE_SIZE) {
        this.updateDepthData()
        return
      }

      const now = Date.now()
      if (now - this.lastDepthUpdateTime >= THROTTLE_DEPTH_INTERVAL) {
        if (this.depthCache.length > 0) {
          this.updateDepthData()
        }
      }
    }
  }

  // ================ 更新深度 结束 ================
  // 解析行情body数据
  parseQuoteBodyData = (body: string) => {
    // 原格式
    // {"header":{"msgId":"symbol"},"body":{"dataSource":"binance-SOLUSDT","priceData":{"sellSize":"63.38200000","sell":206.61200000,"buy":"206.61000000","id":1735807731722,"buySize":"61.67900000"},"symbol":"SOL","accountGroupId":"3"}}
    // 新格式
    // 报价数据格式：id,buy,buySize,sell,sellSize,dataSource,symbol,accountGroupId
    // 使用账户组订阅数据格式
    // { "header": { "msgId": "symbol" }, "body": "1735636763941,94044.6,0,94047.325,0,mt5-BTCUSD,BTC,1826081893542576129" }
    // 没有使用账户组订阅数据格式，最后两个为0占位。比如管理端数据源列表不能使用账户组订阅
    // { "header": { "msgId": "symbol" }, "body": "1735636763941,94044.6,0,94047.325,0,mt5-BTCUSD,0,0" }
    const quoteItem = {} as IQuoteItem
    if (body && typeof body === 'string') {
      const [id, buy, buySize, sell, sellSize, dataSource, symbol, accountGroupId] = body.split(',')
      const [dataSourceCode, dataSourceSymbol] = String(dataSource || '')
        .split('-')
        .filter((v: any) => v)
      const sbl = symbol === '0' ? dataSourceSymbol : symbol // 兼容没有使用账户组订阅情况
      // 1.数据源 + 品种名称作为唯一标识 通过该方式订阅的没有账户组 const topicNoAccount = `/000000/symbol/${item.dataSourceCode}/${item.symbol}`
      // 2.账户组 + 品种名称作为唯一标识 通过该方式订阅的有账户组 const topicAccount = `/000000/symbol/${item.symbol}/${item.accountGroupId}`
      const dataSourceKey = Number(accountGroupId) ? `${accountGroupId}/${sbl}` : `${dataSourceCode}/${sbl}`

      quoteItem.symbol = sbl
      quoteItem.dataSource = dataSource
      quoteItem.dataSourceKey = dataSourceKey
      quoteItem.accountGroupId = accountGroupId
      quoteItem.priceData = {
        sellSize: Number(sellSize || 0),
        buy: Number(buy || 0),
        sell: Number(sell || 0),
        id: Number(id || 0),
        buySize: Number(buySize || 0)
      }
    }
    return quoteItem
  }

  // 解析深度body数据
  parseDepthBodyData = (body: string) => {
    // 原格式
    // {"header":{"msgId":"depth"},"body":{"symbol":"BTC","accountGroupId":"3","asks":"[{\"amount\":0.01403000,\"price\":96012.69000000},{\"amount\":0.00012000,\"price\":96012.70000000},{\"amount\":0.00012000,\"price\":96012.71000000},{\"amount\":0.00018000,\"price\":96012.73000000},{\"amount\":0.00118000,\"price\":96012.75000000},{\"amount\":0.00200000,\"price\":96012.76000000},{\"amount\":0.00178000,\"price\":96012.77000000},{\"amount\":0.00012000,\"price\":96012.78000000},{\"amount\":0.00111000,\"price\":96012.79000000},{\"amount\":0.00037000,\"price\":96012.80000000},{\"amount\":0.00012000,\"price\":96012.96000000},{\"amount\":0.00012000,\"price\":96013.05000000},{\"amount\":0.00037000,\"price\":96013.17000000},{\"amount\":0.00018000,\"price\":96013.27000000},{\"amount\":0.00198000,\"price\":96013.44000000},{\"amount\":0.00572000,\"price\":96013.45000000},{\"amount\":0.00011000,\"price\":96013.56000000},{\"amount\":0.00300000,\"price\":96013.91000000},{\"amount\":0.00006000,\"price\":96013.92000000},{\"amount\":0.00012000,\"price\":96013.93000000}]","bids":"[{\"amount\":7.99949000,\"price\":96000.00000000},{\"amount\":3.79417000,\"price\":95999.99000000},{\"amount\":0.00065000,\"price\":95999.96000000},{\"amount\":0.11040000,\"price\":95999.95000000},{\"amount\":0.00012000,\"price\":95999.90000000},{\"amount\":0.00111000,\"price\":95999.89000000},{\"amount\":0.00012000,\"price\":95999.63000000},{\"amount\":0.00012000,\"price\":95999.57000000},{\"amount\":0.00187000,\"price\":95999.56000000},{\"amount\":0.00012000,\"price\":95999.51000000},{\"amount\":0.00023000,\"price\":95999.42000000},{\"amount\":0.00012000,\"price\":95999.39000000},{\"amount\":0.00012000,\"price\":95999.34000000},{\"amount\":0.05220000,\"price\":95999.27000000},{\"amount\":0.00012000,\"price\":95999.24000000},{\"amount\":0.04170000,\"price\":95999.20000000},{\"amount\":0.22837000,\"price\":95999.04000000},{\"amount\":0.20861000,\"price\":95999.03000000},{\"amount\":0.00208000,\"price\":95999.00000000},{\"amount\":0.04167000,\"price\":95998.83000000}]","dataSource":"binance-BTCUSDT","ts":1735807767042}}
    // 新格式
    // 深度数据格式：asks(price_amount;price_amount;...),bids(price_amount;price_amount;...),dataSource,symbol,accountGroupId,ts
    // { "header": { "msgId": "depth" }, "body": "94399.495*3.40948;94400.275*0.00052;94400.895*2.06585;94400.905*0.00499;94401.005*0.19438;94401.215*0.0424;94401.915*0.0424;94402.115*0.078;94402.125*0.84533;94402.135*0.15867;94402.405*0.07399;94402.415*0.11009;94402.715*0.00774;94402.865*0.00006;94404.395*0.04126;94404.455*0.02648;94404.715*0.0424;94406.055*0.05296;94406.635*0.05296;94407.435*0.00011,94396.77*0.21542;94396.63*0.0018;94396.3*0.00006;94396.29*0.08861;94396.26*0.00011;94396*0.0072;94395*0.00008;94394.16*0.00012;94393.93*0.00008;94393.58*0.00029;94393.27*0.003;94393.12*0.00008;94392.8*0.0424;94392.28*0.00012;94392*0.00729;94390.78*0.00017;94390.24*0.00012;94389.76*0.00006;94389.24*0.00012;94389.09*0.00015,binance-BTCUSDT,BTC,1,1735634057242" }
    const depthData = {} as IDepth
    if (body && typeof body === 'string') {
      const [asks, bids, dataSource, symbol, accountGroupId, ts] = body.split(',')
      const [dataSourceCode, dataSourceSymbol] = (dataSource || '').split('-').filter((v: any) => v)
      const sbl = symbol || dataSourceSymbol // 如果有symbol，说明是通过账户组订阅的品种行情
      // 账户组 + 品种名称作为唯一标识
      const dataSourceKey = Number(accountGroupId) ? `${accountGroupId}/${sbl}` : `${dataSourceCode}/${sbl}`
      depthData.symbol = sbl
      depthData.dataSource = dataSource
      depthData.dataSourceKey = dataSourceKey
      depthData.accountGroupId = accountGroupId
      depthData.ts = Number(ts || 0)
      depthData.asks = asks
        ? asks.split(';').map((item) => {
            const [price, amount] = (item || '').split('_')
            return {
              price: Number(price || 0),
              amount: Number(amount || 0)
            }
          })
        : []
      depthData.bids = bids
        ? bids.split(';').map((item) => {
            const [price, amount] = (item || '').split('_')
            return {
              price: Number(price || 0),
              amount: Number(amount || 0)
            }
          })
        : []
    }
    return depthData
  }

  // 处理ws消息
  @action
  message(res: IMessage) {
    const header = res?.header
    const messageId = header?.msgId
    const data = res?.body || {}

    // console.log('message data', data)
    switch (messageId) {
      // 行情
      case MessageType.symbol:
        // const quoteBody = this.parseQuoteBodyData(data)
        // 先收集起来再解析
        this.batchUpdateQuoteData(data)
        // 推入缓冲区

        // console.log('行情信息', toJS(this.quotes))
        break
      // 深度报价
      case MessageType.depth:
        // if (symbol) {
        //   const asks = data.asks ? JSON.parse(data.asks) : []
        //   const bids = data.bids ? JSON.parse(data.bids) : []
        //   this.depth[symbol] = {
        //     ...data,
        //     asks,
        //     bids
        //   }
        // }
        // const depthBody = this.parseDepthBodyData(data)
        // 先收集起来再解析
        this.batchUpdateDepthData(data)

        // 推入缓冲区
        // this.depthCacheArr.push(data)

        // console.log('深度报价', toJS(this.depth))
        break
      // 交易信息：账户余额变动、持仓列表、挂单列表
      case MessageType.trade:
        const type = data.type as ITradeType
        // 账户余额变动
        if (type === 'ACCOUNT') {
          const accountInfo = data.account || {}
          runInAction(() => {
            trade.currentAccountInfo = {
              ...trade.currentAccountInfo,
              ...accountInfo
            }
          })
        }
        // 持仓列表
        else if (type === 'MARKET_ORDER') {
          const positionList = data.bagOrderList || []
          runInAction(() => {
            trade.positionList = formaOrderList(positionList)
          })
        }
        // 挂单列表
        else if (type === 'LIMIT_ORDER') {
          const pendingList = data.limiteOrderList || []
          runInAction(() => {
            trade.pendingList = formaOrderList(pendingList)
          })
        }
        // 历史成交记录,用不到
        else if (type === 'TRADING') {
          // TODO: 更新 margin (预付款/占用保证金) 等信息
          try {
            // trade.currentAccountInfo.margin =
          } catch (error) {}
        }
        break
      case MessageType.notice:
        console.log('消息通知', data)
        // const info = data as MessagePopupInfo
        // onDisplayNotification({
        //   title: info.title,
        //   body: removeOrderMessageFieldNames(info.content || '')
        // })
        break
      case MessageType.msg:
        console.log('消息响应', data)
        // 派发消息响应事件
        mitt.emit('RESOLVE_MSG', data)
        break
    }
  }

  /**
   * 延迟批量订阅行情
   * @param toSend 需要订阅的符号列表
   * @param cover 是否取消其他历史订阅
   */
  debounceBatchSubscribeSymbol = ({ toSend, cover }: { toSend: Map<string, boolean>; cover?: boolean }) => {
    // 1. 找到 this.toSendSymbols 中不在 this.sendingSymbols 中的符号，这些符号是即将要打开的符号
    const toOpen = new Map<string, boolean>()
    toSend?.forEach((value, key) => {
      if (!this.sendingSymbols.get(key)) {
        toOpen.set(key, true)
      }
    })

    // 3. 打开即将要打开的符号
    const list = Array.from(toOpen.keys()).map((key) => this.stringToSymbol(key)) as SymbolWSItem[]

    if (cover) {
      console.log('==== 覆盖订阅，并订阅列表 ====》', list.length)
      // 订阅列表，并取消其他历史订阅
      const listToSend = Array.from(toSend.keys()).map((key) => this.stringToSymbol(key)) as SymbolWSItem[]
      this.batchSubscribeSymbol({ list: listToSend, cover })
    } else if (toOpen?.size) {
      console.log('==== 打开订阅，无需关闭订阅 ====》', toOpen.size)
      this.batchSubscribeSymbol({ list })
    } else {
      console.log('==== 重复订阅，无需关闭订阅 ====》', toSend.size)
      toSend.forEach((value, key) => {
        // 已经订阅，如果【待停止订阅】列表中存在，则移除
        this.toCloseSymbols.delete(key)
      })
    }
  }

  // 封装一个延迟执行的取消订阅方法
  debounceBatchCloseSymbol = debounce(() => {
    const list = Array.from(this.toCloseSymbols.keys()).map((key) => this.stringToSymbol(key)) as SymbolWSItem[]

    if (list.length) {
      // console.log('取消订阅的符号：', list)
      // 取消订阅
      this.subscribeSymbol(list, true)
    }

    // console.log('正在订阅的符号：', this.sendingSymbols)
    this.toCloseSymbols.clear()
  }, 8000)
}

const ws = new WSStore()

export default ws
