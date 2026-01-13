import { groupBy } from 'lodash-es'
import ReconnectingWebSocket from 'reconnecting-websocket'

import {
  IDepth,
  IExpectedMargin,
  IMessage,
  IPositionListSymbolCalcInfo,
  IQuoteItem,
  ITradeType,
  MarginReteInfo,
  MessageType,
  WorkerType,
} from './ws.types'

type TradeAction = {
  leverageMultiple: number
  currentLiquidationSelectBgaId: string
  marginType: API.MarginType
} & IExpectedMargin

type UserConf = {
  /**连接地址 */
  websocketUrl: string
  token: string
  userInfo: User.UserInfo
  /**是否是手机端 */
  isMobile?: boolean
}

// 从主线程同步过来的公共基础数据
let userConf = {} as UserConf // 用户配置
let userInfo = {} as User.UserInfo // 用户信息
let currentAccountInfo = {} as User.AccountItem // 当前选择的账户信息
let positionList = [] as Order.BgaOrderPageListItem[] // 持仓单列表
let allSimpleSymbolsMap = {} as { [key: string]: Symbol.AllSymbolItem } // 全部品种列表map，校验汇率品种用到
let activeSymbolName = '' // 当前激活的品种名称
let symbolListAll = [] as Account.TradeSymbolListItem[] // 当前账户所有品种列表
let tradeActions = {
  currentLiquidationSelectBgaId: 'CROSS_MARGIN', // 默认全仓，右下角爆仓选择逐仓、全仓切换
} as TradeAction // 交易相关操作

// websocket数据
let socket: any = null
let heartbeatInterval: any = null
let heartbeatTimeout = 20000 // 心跳间隔，单位毫秒
let quotesCache = [] as any[] // 行情缓存区
let depthCache = [] as any[] // 深度缓存区
let quotes = new Map<string, IQuoteItem>() // 当前行情
let depth = new Map<string, IDepth>() // 当前深度

let subscribeDepthTimer: any = null
let lastQuoteUpdateTime = 0
let lastDepthUpdateTime = 0
const THROTTLE_QUOTE_INTERVAL = 300
const THROTTLE_QUOTE_MOBILE_INTERVAL = 300
const THROTTLE_DEPTH_INTERVAL = 200
const MAX_CACHE_SIZE = 150 // 设置最大缓存限制
let quoteCount = 0 // 首次加载用到

// ============ 接收主线程消息 start ==============
self.addEventListener('message', (event) => {
  const { data } = event.data
  const type = event.data?.type as WorkerType

  // console.log('接收主线程发送的消息', type, data)

  switch (type) {
    // 初始化连接
    case 'INIT_CONNECT':
      userInfo = data?.userInfo
      userConf = data
      connect()
      break
    // 订阅行情
    case 'SUBSCRIBE_QUOTE':
      batchSubscribeSymbol(data)
      break
    // 订阅深度
    case 'SUBSCRIBE_DEPTH':
      subscribeDepth(data)
      break
    // 订阅交易
    case 'SUBSCRIBE_TRADE':
      subscribeTrade(data)
      break
    // 订阅系统消息
    case 'SUBSCRIBE_MESSAGE':
      subscribeMessage(data)
      break
    // 订阅需要响应处理的消息
    case 'SUBSCRIBE_NOTIFY':
      subscribeNotify(data)
      break
    // ========== 处理同步数据 =========
    // 当前激活品种名称
    case 'SYNC_ACTIVE_SYMBOL_NAME':
      activeSymbolName = data?.activeSymbolName || ''
      break
    // 当前选择的账户信息
    case 'SYNC_CURRENT_ACCOUNT_INFO':
      currentAccountInfo = data?.currentAccountInfo || {}
      break
    // 持仓单列表
    case 'SYNC_POSITION_LIST':
      positionList = data?.positionList || []
      break
    // 全部品种列表map，校验汇率品种用到
    case 'SYNC_ALL_SYMBOL_MAP':
      allSimpleSymbolsMap = data?.allSimpleSymbolsMap || {}
      break
    // 当前账户所有品种列表
    case 'SYNC_ALL_SYMBOL_LIST':
      symbolListAll = data?.symbolListAll || []
      break
    // 交易区操作数据
    case 'SYNC_TRADE_ACTIONS':
      tradeActions = {
        ...tradeActions,
        ...(data || {}),
      }
      syncCalcData()
      break
    // 关闭连接
    case 'CLOSE':
      close()
      break
  }
})

// ============ 接收主线程消息 end ==============

// 向主线程发送消息
type ISendParam = { type: WorkerType; data?: any }
function sendMessage({ type, data }: ISendParam) {
  self.postMessage({
    type,
    data,
  })
}

// 连接socket
function connect() {
  const { websocketUrl, token } = userConf
  socket = new ReconnectingWebSocket(websocketUrl, ['WebSocket', token ? token : 'visitor'], {
    minReconnectionDelay: 1,
    connectionTimeout: 5000, // 重连时间
    maxEnqueuedMessages: 0, // 不缓存发送失败的指令
    maxRetries: 10000000, // 最大重连次数
    // debug: process.env.NODE_ENV === 'development' // 测试环境打开调试
  })
  socket.addEventListener('open', handleOpenCallback)
  socket.addEventListener('message', handleMessageCallback)
  socket.addEventListener('close', () => {
    sendMessage({ type: 'CLOSE' })
  })
  socket.addEventListener('error', () => {
    sendMessage({ type: 'CLOSE' })
  })
}

// 发送socket消息
function send(cmd = {}, header = {}) {
  // 游客身份userId传123456789
  const userId = userInfo?.user_id || '123456789'
  if (socket && socket.readyState === 1) {
    socket.send(
      JSON.stringify({
        header: { tenantId: '000000', userId, msgId: 'subscribe', flowId: Date.now(), ...header },
        body: {
          cancel: false,
          ...cmd,
        },
      }),
    )
  }
}

// 关闭连接
function close() {
  stopHeartbeat()
  if (socket) {
    // 关闭socket指令
    socket.close?.()
    socket = null
  }
  if (heartbeatInterval) clearInterval(heartbeatInterval)
  if (subscribeDepthTimer) clearTimeout(subscribeDepthTimer)
  heartbeatInterval = null
  subscribeDepthTimer = null
}

// 连接成功回调
function handleOpenCallback() {
  sendMessage({
    type: 'CONNECT_SUCCESS',
    data: {
      readyState: socket.readyState,
    },
  })
  startHeartbeat()
}

// 解析行情body数据
function parseQuoteBodyData(body: string) {
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
      buySize: Number(buySize || 0),
    }
  }
  return quoteItem
}

// 解析深度body数据
function parseDepthBodyData(body: string) {
  // 原格式
  // {"header":{"msgId":"depth"},"body":{"symbol":"BTC","accountGroupId":"3","asks":"[{\"amount\":0.01403000,\"price\":96012.69000000},{\"amount\":0.00012000,\"price\":96012.70000000},{\"amount\":0.00012000,\"price\":96012.71000000},{\"amount\":0.00018000,\"price\":96012.73000000},{\"amount\":0.00118000,\"price\":96012.75000000},{\"amount\":0.00200000,\"price\":96012.76000000},{\"amount\":0.00178000,\"price\":96012.77000000},{\"amount\":0.00012000,\"price\":96012.78000000},{\"amount\":0.00111000,\"price\":96012.79000000},{\"amount\":0.00037000,\"price\":96012.80000000},{\"amount\":0.00012000,\"price\":96012.96000000},{\"amount\":0.00012000,\"price\":96013.05000000},{\"amount\":0.00037000,\"price\":96013.17000000},{\"amount\":0.00018000,\"price\":96013.27000000},{\"amount\":0.00198000,\"price\":96013.44000000},{\"amount\":0.00572000,\"price\":96013.45000000},{\"amount\":0.00011000,\"price\":96013.56000000},{\"amount\":0.00300000,\"price\":96013.91000000},{\"amount\":0.00006000,\"price\":96013.92000000},{\"amount\":0.00012000,\"price\":96013.93000000}]","bids":"[{\"amount\":7.99949000,\"price\":96000.00000000},{\"amount\":3.79417000,\"price\":95999.99000000},{\"amount\":0.00065000,\"price\":95999.96000000},{\"amount\":0.11040000,\"price\":95999.95000000},{\"amount\":0.00012000,\"price\":95999.90000000},{\"amount\":0.00111000,\"price\":95999.89000000},{\"amount\":0.00012000,\"price\":95999.63000000},{\"amount\":0.00012000,\"price\":95999.57000000},{\"amount\":0.00187000,\"price\":95999.56000000},{\"amount\":0.00012000,\"price\":95999.51000000},{\"amount\":0.00023000,\"price\":95999.42000000},{\"amount\":0.00012000,\"price\":95999.39000000},{\"amount\":0.00012000,\"price\":95999.34000000},{\"amount\":0.05220000,\"price\":95999.27000000},{\"amount\":0.00012000,\"price\":95999.24000000},{\"amount\":0.04170000,\"price\":95999.20000000},{\"amount\":0.22837000,\"price\":95999.04000000},{\"amount\":0.20861000,\"price\":95999.03000000},{\"amount\":0.00208000,\"price\":95999.00000000},{\"amount\":0.04167000,\"price\":95998.83000000}]","dataSource":"binance-BTCUSDT","ts":1735807767042}}
  // 新格式
  // 深度数据格式：asks(price_amount;price_amount;...),bids(price*amount;price_amount;...),dataSource,symbol,accountGroupId,ts
  // { "header": { "msgId": "depth" }, "body": "94399.495*3.40948;94400.275*0.00052;94400.895*2.06585;94400.905*0.00499;94401.005*0.19438;94401.215*0.0424;94401.915*0.0424;94402.115*0.078;94402.125*0.84533;94402.135*0.15867;94402.405*0.07399;94402.415*0.11009;94402.715*0.00774;94402.865*0.00006;94404.395*0.04126;94404.455*0.02648;94404.715*0.0424;94406.055*0.05296;94406.635*0.05296;94407.435*0.00011,94396.77*0.21542;94396.63*0.0018;94396.3*0.00006;94396.29*0.08861;94396.26*0.00011;94396*0.0072;94395*0.00008;94394.16*0.00012;94393.93*0.00008;94393.58*0.00029;94393.27*0.003;94393.12*0.00008;94392.8*0.0424;94392.28*0.00012;94392*0.00729;94390.78*0.00017;94390.24*0.00012;94389.76*0.00006;94389.24*0.00012;94389.09*0.00015,binance-BTCUSDT,BTC,1,1735634057242" }
  const depthData = {} as IDepth
  if (body && typeof body === 'string') {
    const [asks, bids, dataSource, symbol, accountGroupId, ts] = body.split(',')
    const [dataSourceCode, dataSourceSymbol] = (dataSource || '').split('-').filter((v: any) => v)
    const sbl = symbol === '0' ? dataSourceSymbol : symbol // 兼容没有使用账户组订阅情况
    // 账户组 + 品种名称作为唯一标识
    const dataSourceKey = Number(accountGroupId) ? `${accountGroupId}/${sbl}` : `${dataSourceCode}/${sbl}`
    depthData.symbol = symbol
    depthData.dataSource = dataSource
    depthData.dataSourceKey = dataSourceKey
    depthData.accountGroupId = accountGroupId
    depthData.ts = Number(ts || 0)
    depthData.asks = asks
      ? asks.split(';').map((item) => {
          const [price, amount] = (item || '').split('_')
          return {
            price: Number(price || 0),
            amount: Number(amount || 0),
          }
        })
      : []
    depthData.bids = bids
      ? bids.split(';').map((item) => {
          const [price, amount] = (item || '').split('_')
          return {
            price: Number(price || 0),
            amount: Number(amount || 0),
          }
        })
      : []
  }
  return depthData
}

// 接收消息回调
function handleMessageCallback(d: any) {
  try {
    const res = JSON.parse(d.data) as IMessage

    if (!res || !res.header) {
      return
    }

    const header = res?.header || {}
    const messageId = header.msgId
    const data = res?.body || {}

    switch (messageId) {
      // 行情
      case MessageType.symbol:
        // const quoteBody = parseQuoteBodyData(data)
        // 先收集起来再解析
        batchUpdateQuoteData(data)
        break
      // 深度报价
      case MessageType.depth:
        // const depthBody = parseDepthBodyData(data)
        // 先收集起来再解析
        batchUpdateDepthData(data)
        break
      // 交易信息：账户余额变动、持仓列表、挂单列表
      case MessageType.trade:
        const type = data.type as ITradeType
        // console.log('交易信息变动', data)
        sendMessage({
          type: 'TRADE_RES',
          data,
        })
        if (type === 'ACCOUNT') {
          const accountInfo = data.account || {}
          currentAccountInfo = {
            ...currentAccountInfo,
            ...accountInfo,
          }
          console.log('worker 当前账户余额变动 TRADE_RES', currentAccountInfo)
          // 在同步账户余额变动时，需要同步计算数据
          syncCalcData()
        }
        break
      case MessageType.notice:
        // console.log('消息通知', data)
        sendMessage({
          type: 'MESSAGE_RES',
          data,
        })
        break
      case MessageType.msg:
        sendMessage({
          type: 'RESOLVE_MSG',
          data,
        })
        break
    }
  } catch (e) {
    console.error('Handle message error:', e)
  }
}

// 开始心跳
function startHeartbeat() {
  stopHeartbeat()
  heartbeatInterval = setInterval(startHeartbeatCallback, heartbeatTimeout)
}
function startHeartbeatCallback() {
  send({}, { msgId: 'heartbeat' })
}

// 停止心跳
function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
}

// =========== 订阅消息 start ===========

// 订阅品种
function batchSubscribeSymbol({
  cancel = false,
  list = [],
}: {
  cancel?: boolean
  needAccountGroupId?: boolean
  list?: Array<{
    accountGroupId?: any
    symbol: string
    // dataSourceCode?: any
  }>
} = {}) {
  const symbolList = list
  if (!symbolList.length) return

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

  send({
    topic: topics,
    cancel,
  })
}

// 订阅当前打开的品种深度报价
function subscribeDepth({ cancel, symbolInfo }: { cancel?: boolean; symbolInfo: Account.TradeSymbolListItem }) {
  if (!symbolInfo?.symbol) return

  // const topicNoAccount = `/000000/depth/${symbolInfo.dataSourceCode}/${symbolInfo.symbol}`
  const topicAccount = `/000000/depth/${symbolInfo.symbol}/${symbolInfo?.accountGroupId}`
  // 区分带账户组id和不带账户组情况
  // const topic = symbolInfo?.accountGroupId ? topicAccount : topicNoAccount
  const topic = topicAccount

  if (subscribeDepthTimer) clearTimeout(subscribeDepthTimer)
  subscribeDepthTimer = setTimeout(() => {
    send({
      topic,
      cancel,
    })
  }, 300)
}

// 订阅持仓记录、挂单记录、账户余额信息
function subscribeTrade({ cancel, topic }: { cancel?: boolean; topic: string }) {
  send({
    topic,
    cancel,
  })
}

// 订阅消息
function subscribeMessage({ cancel }: { cancel?: boolean }) {
  if (!userInfo?.user_id) return

  // 公共订阅：/{租户ID}/public/1
  // 角色订阅：/{租户ID}/role/{角色ID}
  // 机构订阅：/{租户ID}/dept/{机构ID}
  // 岗位订阅：/{租户ID}/post/{岗位ID}
  // 用户订阅：/{租户ID}/user/{用户ID}
  send({
    topic: `/000000/public/1`,
    cancel,
  })
  send({
    topic: `/000000/role/${userInfo.role_id}`,
    cancel,
  })
  send({
    topic: `/000000/dept/${userInfo.dept_id}`,
    cancel,
  })
  send({
    topic: `/000000/post/${userInfo.post_id}`,
    cancel,
  })
  send({
    topic: `/000000/user/${userInfo?.user_id}`,
    cancel,
  })
}

// 订阅中消息（目前只订阅支付响应消息：20250327）
function subscribeNotify({ cancel }: { cancel?: boolean }) {
  if (!userInfo?.user_id) return

  console.log('=========订阅响应消息', `/000000/msg/${userInfo?.user_id}`, cancel)
  send({
    topic: `/000000/msg/${userInfo?.user_id}`,
    cancel,
  })
}

// =========== 订阅消息 end ===========

// ================ 更新深度 start ================
function updateDepthData() {
  if (depthCache.length) {
    depthCache.forEach((str) => {
      const item = parseDepthBodyData(str)
      const dataSourceKey = item.dataSourceKey
      if (dataSourceKey) {
        if (typeof item.asks === 'string') {
          item.asks = item.asks ? JSON.parse(item.asks) : []
        }
        if (typeof item.bids === 'string') {
          item.bids = item.bids ? JSON.parse(item.bids) : []
        }
        depth.set(dataSourceKey, item)
      }
    })

    const dataSourceKey = getDatasourceKey()
    const currentDepth = depth.get(dataSourceKey) as any
    const currentDepthMap = new Map()

    if (currentDepth) {
      currentDepthMap.set(dataSourceKey, currentDepth)
    }

    // 只发送当前激活品种的深度数据
    if (currentDepthMap.size) {
      sendMessage({
        type: 'DEPTH_RES',
        data: currentDepthMap,
      })
    }

    depthCache = []
    lastDepthUpdateTime = performance.now()
  }
}

function batchUpdateDepthData(data: string) {
  if (data && typeof data === 'string') {
    depthCache.push(data)

    // 如果缓存太大，强制发送
    if (depthCache.length >= MAX_CACHE_SIZE) {
      updateDepthData()
      return
    }

    const now = performance.now()
    if (now - lastDepthUpdateTime >= THROTTLE_DEPTH_INTERVAL) {
      if (depthCache.length > 0) {
        updateDepthData()
      }
    }
  }
}

// ================ 更新深度 end ================

// ================ 更新行情数据 开始 ================
function updateQuoteData() {
  if (quotesCache.length) {
    // 存储有变化的行情数据
    const changedQuotes = new Map<string, IQuoteItem>()
    // 批量解析字符串数据
    const quotesCacheItems = quotesCache.map((str) => parseQuoteBodyData(str))
    // 按symbol分组
    const symbolMap = groupBy(quotesCacheItems, 'symbol')
    quotesCacheItems.forEach((item: IQuoteItem) => {
      const dataSourceKey = item.dataSourceKey
      if (!dataSourceKey) return
      const quoteData = quotes.get(dataSourceKey)

      // 价格数据去重
      let klineList = uniqueObjectArray(
        (symbolMap[item.symbol] || []).map((item) => {
          return {
            price: item.priceData?.buy,
            id: item.priceData?.id,
          }
        }),
        'price',
      )

      // 如果之前的行情存在，则对比增量更新
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
            klineList,
          }
          changedQuotes.set(dataSourceKey, changedQuoteItem)
          quotes.set(dataSourceKey, item)
        }
      } else {
        // 新增行情
        const changedQuoteItem = {
          ...item,
          klineList,
        }
        quotes.set(dataSourceKey, item)
        changedQuotes.set(dataSourceKey, changedQuoteItem)
      }
    })

    // 只有存在变化的行情才发送到主线程
    if (changedQuotes.size > 0) {
      // 发送变化的品种行情数据
      sendMessage({
        type: 'SYMBOL_RES',
        data: changedQuotes,
      })

      // 同步计算结果到主线程
      syncCalcData()
    }

    quotesCache = []
    changedQuotes.clear()
    lastQuoteUpdateTime = performance.now()
  }
}

function batchUpdateQuoteData(data: string) {
  if (data && typeof data === 'string') {
    quotesCache.push(data)

    // 加快首次渲染时间
    if (quoteCount < 50) {
      updateQuoteData()
      quoteCount++
      return
    }

    // 如果缓存太大，强制发送
    if (quotesCache.length >= MAX_CACHE_SIZE) {
      updateQuoteData()
      return
    }

    const now = performance.now()
    const interval = userConf.isMobile ? THROTTLE_QUOTE_MOBILE_INTERVAL : THROTTLE_QUOTE_INTERVAL
    if (now - lastQuoteUpdateTime >= interval) {
      if (quotesCache.length > 0) {
        updateQuoteData()
      }
    }
  }
}

// =========  计算相关 start ============

// 计算账户余额信息： 需要订阅持仓中所有类型
function getAccountBalance() {
  const currencyDecimal = currentAccountInfo.currencyDecimal

  // 账户余额
  const money = Number(currentAccountInfo.money || 0)
  // 当前账户占用的保证金 = 逐仓保证金 + 全仓保证金（可用保证金）
  const occupyMargin = Number(
    toFixed(Number(currentAccountInfo?.margin || 0) + Number(currentAccountInfo?.isolatedMargin || 0), currencyDecimal),
  )
  // 可用保证金
  let availableMargin = Number(money || 0) - Number(occupyMargin || 0)
  // 持仓总浮动盈亏: 需要订阅持仓中所有类型
  // const totalOrderProfit = Number(getCurrentAccountFloatProfit(positionList))
  const totalProfit = Number(getCurrentAccountFloatProfit(positionList))
  // 持仓单总的库存费
  // const totalInterestFees = positionList.reduce((total, next) => total + Number(next.interestFees || 0), 0) || 0
  // 持仓单总的手续费
  // const totalHandlingFees = positionList.reduce((total, next) => total + Number(next.handlingFees || 0), 0) || 0
  // 净值 = 账户余额 + 库存费 + 手续费 + 浮动盈亏
  // const balance = Number(Number(currentAccountInfo.money || 0) + totalInterestFees + totalHandlingFees + totalOrderProfit)
  const balance = Number(Number(currentAccountInfo.money || 0) + totalProfit)

  // 账户总盈亏 = 所有订单的盈亏 + 所有订单的库存费 + 所有订单的手续费
  // const totalProfit = totalOrderProfit + totalInterestFees + totalHandlingFees

  // console.log('totalInterestFees', totalInterestFees)
  // console.log('totalHandlingFees', totalHandlingFees)
  // console.log('totalOrderProfit', totalOrderProfit)
  // console.log('totalProfit', totalProfit)
  // console.log('balance', balance)

  // 账户组设置“可用计算未实现盈亏”时
  // 新可用预付款=原来的可用预付款+账户的持仓盈亏
  if (currentAccountInfo?.usableAdvanceCharge === 'PROFIT_LOSS') {
    availableMargin = availableMargin + totalProfit
  }

  return {
    occupyMargin,
    availableMargin: toFixed(availableMargin, currencyDecimal),
    balance,
    totalProfit: toFixed(totalProfit, currencyDecimal),
    money: toFixed(money, currencyDecimal),
  }
}

// 计算当前账户总的浮动盈亏
function getCurrentAccountFloatProfit(data: any) {
  const precision = currentAccountInfo?.currencyDecimal || 2

  // 持仓总浮动盈亏
  let totalProfit = 0
  if (positionList.length) {
    positionList.forEach((item: Order.BgaOrderPageListItem) => {
      const profit = covertProfit(item, true) // 浮动盈亏
      // item.profit = profit
      // totalProfit += Number(profit || 0)
      // 先截取在计算，否则跟页面上截取后的值累加对不上
      totalProfit += Number(profit || 0)
    })
  }
  return totalProfit
}

/**
 * 计算汇率
 * @param value 转换的值
 * @param unit 盈利货币单位
 * @param buySell 买卖方向
 * @returns
 */
type IExchangeRateParams = {
  /**需要转化的值 */
  value: any
  /**盈利货币单位 */
  unit: any
  /**买卖方向 */
  buySell: API.TradeBuySell | undefined
}
function calcExchangeRate({ value, unit, buySell }: IExchangeRateParams) {
  // 检查货币是否是外汇/指数，并且不是以 USD 为单位，比如AUDNZD => 这里单位是NZD，找到NZDUSD或者USDNZD的指数取值即可
  // 数字货币、商品黄金石油这些以美元结算的，单位都是USD不需要参与转化直接返回
  // 非USD单位的产品都要转化为美元
  let qb: any = {}
  let profit = value || 0
  const isBuy = buySell === 'BUY' // 是否买入
  const isSell = buySell === 'SELL' // 是否卖出

  // 交易品种配置的盈利货币单位和账户组配置的货币单位不一致时，需要转换
  if (currentAccountInfo?.currencyUnit !== unit) {
    // USD开头是除法，USD结尾是乘法
    // 除法
    const divName = ('USD' + unit).toUpperCase() // 如 USDNZD
    // 乘法
    const mulName = (unit + 'USD').toUpperCase() // 如 NZDUSD

    // 使用汇率品种的dataSourceCode去获取行情
    // const dataSourceCode = (allSimpleSymbolsMap[divName] || allSimpleSymbolsMap[mulName] || {})?.dataSourceCode
    const symbol = (allSimpleSymbolsMap[divName] || allSimpleSymbolsMap[mulName] || {})?.symbol
    const accountGroupId = currentAccountInfo?.accountGroupId
    const divNameKey = symbol ? `${accountGroupId}/${divName}` : ''
    const mulNameKey = symbol ? `${accountGroupId}/${mulName}` : ''

    const divNameQuote = quotes.get(divNameKey)
    const mulNameQuote = quotes.get(mulNameKey)

    // 检查是否存在 divName 对应的报价信息
    if (divNameQuote) {
      qb = divNameQuote

      // 检查交易指令是否是买入，如果是，则获取 divName 对应的报价信息，并用其 bid 除以 profit
      if (isBuy) {
        profit = profit / Number(qb?.priceData?.buy)
      }
      // 检查交易指令是否是卖出，如果是，则获取 divName 对应的报价信息，并用其 ask 除以 profit
      else if (isSell) {
        profit = profit / Number(qb?.priceData?.sell)
      }
    }
    // 如果 divName 对应的报价信息不存在，则检查 mulName 对应的报价信息
    else if (mulNameQuote) {
      qb = mulNameQuote
      // 检查交易指令是否是买入，如果是，则获取 mulName 对应的报价信息，并用其 bid 乘以 profit
      if (isBuy) {
        profit = profit * Number(qb?.priceData?.buy)
      }
      // 检查交易指令是否是卖出，如果是，则获取 mulName 对应的报价信息，并用其 ask 乘以 profit
      else if (isSell) {
        profit = profit * Number(qb?.priceData?.sell)
      }
    }
  }

  return Number(profit)
}

/**
 * 将计算的浮动盈亏转化为美元单位
 * @param dataSourceSymbol 数据源品种名称
 * @param positionItem 持仓item
 * @returns
 */
function covertProfit(positionItem: Order.BgaOrderPageListItem, includeFee?: boolean) {
  const symbol = positionItem?.symbol
  const precision = currentAccountInfo?.currencyDecimal || 2
  if (!symbol) return
  const quoteInfo = getCurrentQuote(symbol)
  const symbolConf = positionItem?.conf
  const bid = Number(quoteInfo?.bid || 0)
  const ask = Number(quoteInfo?.ask || 0)
  const unit = symbolConf?.profitCurrency // 盈利货币单位
  const number = Number(positionItem.orderVolume || 0) // 手数
  const consize = Number(symbolConf?.contractSize || 1) // 合约量
  const openPrice = Number(positionItem.startPrice || 0) // 开仓价

  // 浮动盈亏  (买入价-卖出价) x 合约单位 x 交易手数
  let profit =
    bid && ask
      ? positionItem.buySell === 'BUY'
        ? (bid - openPrice) * number * consize
        : (openPrice - ask) * number * consize
      : 0

  // 转换汇率
  profit = calcExchangeRate({
    value: profit,
    unit,
    buySell: positionItem.buySell,
  })

  // 浮动盈亏 包含手续费 + 库存费
  if (includeFee) {
    profit = Number(profit) + Number(positionItem.handlingFees || 0) + Number(positionItem.interestFees || 0)
  }

  // 返回转化后的 profit
  return Number(toFixed(profit || 0, precision))
}

// 计算收益率
function calcYieldRate(item: Order.BgaOrderPageListItem, precision: any, profitValue?: number) {
  const conf = item.conf as Symbol.SymbolConf
  const orderMargin = Number(item.orderMargin || 0) // 开仓保证金
  // 收益率 = 浮动盈亏 / 保证金
  const profit = profitValue || item.profit || 0
  const value = toFixed((profit / orderMargin) * 100, precision)
  return profit && orderMargin ? (value > 0 ? '+' + value : value) + '%' : ''
}

// 计算逐仓保证金信息
function calcIsolatedMarginRateInfo(filterPositionList: Order.BgaOrderPageListItem[]) {
  let compelCloseRatio = currentAccountInfo.compelCloseRatio || 0 // 强制平仓比例(订单列表都是一样的，同一个账户组)
  let orderMargin = 0 // 订单总的保证金
  let orderBaseMargin = 0 // 基础保证金
  let handlingFees = 0 // 订单总的手续费
  let interestFees = 0 // 订单总的库存费
  let profit = 0 // 订单总的浮动盈亏
  filterPositionList.map((item) => {
    const orderProfit = covertProfit(item, false) as any
    orderMargin += Number(item.orderMargin || 0)
    orderBaseMargin += Number(item.orderBaseMargin || 0)
    // handlingFees += Number(item.handlingFees || 0)
    // interestFees += Number(item.interestFees || 0)
    if (orderProfit) {
      profit += orderProfit
    }
  })

  // 逐仓净值=账户余额（单笔或多笔交易保证金）+ 库存费 + 手续费 + 浮动盈亏
  // const isolatedBalance = Number(orderMargin + Number(interestFees || 0) + Number(handlingFees || 0) + Number(profit || 0))
  const isolatedBalance = Number(orderMargin + Number(profit || 0))
  // 逐仓保证金率：当前逐仓净值 / 当前逐仓订单占用 = 保证金率
  // const marginRate = orderMargin && isolatedBalance ? toFixed((isolatedBalance / orderMargin) * 100) : 0
  // 新公式：逐仓保证金率 = 订单净值(订单保证金+浮动盈亏) / 基础保证金。
  const marginRate = orderMargin && isolatedBalance ? toFixed((isolatedBalance / orderBaseMargin) * 100) : 0
  const margin = Number(orderMargin * (compelCloseRatio / 100))
  const balance = toFixed(isolatedBalance, 2)

  // console.log('orderMargin', orderMargin)
  // console.log('compelCloseRatio', compelCloseRatio)
  // console.log('维持保证金margin', margin)

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
function getMarginRateInfo(item?: Order.BgaOrderPageListItem) {
  const isCrossMargin =
    item?.marginType === 'CROSS_MARGIN' || (!item && tradeActions?.currentLiquidationSelectBgaId === 'CROSS_MARGIN') // 全仓
  // 全仓保证金率：全仓净值/占用 = 保证金率
  // 全仓净值 = 全仓净值 - 逐仓单净值(单笔或多笔)
  // 逐仓保证金率：当前逐仓净值 / 当前逐仓订单占用 = 保证金率
  // 净值=账户余额+库存费+手续费+浮动盈亏
  let { balance } = getAccountBalance()

  let marginRate = 0
  let margin = 0 // 维持保证金 = 占用保证金 * 强制平仓比例
  let compelCloseRatio = positionList?.[0]?.compelCloseRatio || 0 // 强制平仓比例(订单列表都是一样的，同一个账户组)
  compelCloseRatio = compelCloseRatio ? compelCloseRatio / 100 : 0
  if (isCrossMargin) {
    // 全仓占用的保证金
    const occupyMargin = Number(toFixed(Number(currentAccountInfo.margin || 0), 2))
    // 判断是否存在全仓单
    const hasCrossMarginOrder = positionList.some((item) => item.marginType === 'CROSS_MARGIN')
    if (hasCrossMarginOrder) {
      // 逐仓保证金信息
      const marginInfo = calcIsolatedMarginRateInfo(
        positionList.filter((item) => item.marginType === 'ISOLATED_MARGIN'),
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
    const marginInfo = calcIsolatedMarginRateInfo(filterPositionList)
    return marginInfo
  }

  return {
    marginRate,
    margin,
    balance,
  }
}

// 右下角选择的保证金信息
function calcRightWidgetSelectMarginInfo() {
  // 当前筛选的逐仓单订单信息
  const currentLiquidationSelectItem = positionList.find(
    (item) => item.id === tradeActions?.currentLiquidationSelectBgaId,
  )
  const currentLiquidationSelectSymbol = currentLiquidationSelectItem?.symbol // 当前选择的品种
  const isLockedMode = currentAccountInfo.orderMode === 'LOCKED_POSITION' // 锁仓模式

  let marginRateInfo = {} as MarginReteInfo
  if (tradeActions?.currentLiquidationSelectBgaId === 'CROSS_MARGIN') {
    marginRateInfo = getMarginRateInfo()
  } else {
    let filterPositionList: any = []
    // 逐仓单，订单是锁仓模式下，有多个相同品种，单独筛选展示，不需要合并同名品种
    if (isLockedMode && currentLiquidationSelectItem) {
      filterPositionList = [currentLiquidationSelectItem]
    } else {
      // 合并同名品种展示
      filterPositionList = positionList.filter((item) => item.symbol === currentLiquidationSelectSymbol)
    }
    if (filterPositionList.length) {
      filterPositionList.forEach((item: any) => {
        const profit = covertProfit(item, false) as number // 浮动盈亏
        item.profit = profit
      })
    }

    marginRateInfo = calcIsolatedMarginRateInfo(filterPositionList)
  }
  return marginRateInfo
}

function calcPositionListSymbol() {
  const positionListSymbolCalcInfo = new Map<string, IPositionListSymbolCalcInfo>()
  const precision = currentAccountInfo.currencyDecimal || 2
  let totalProfit = 0
  for (let item of positionList) {
    const isCrossMargin = item.marginType === 'CROSS_MARGIN'

    // 全仓使用基础保证金
    if (isCrossMargin) {
      item.orderMargin = item.orderBaseMargin
    }

    const profit = covertProfit(item, false) as number // 浮动盈亏
    totalProfit += Number(profit)
    // const calcProfit = Number(profit) + Number(item.handlingFees || 0) + Number(item.interestFees || 0)
    const yieldRate = calcYieldRate(item, precision, profit) // 收益率
    const marginRateInfo = getMarginRateInfo(item)
    // 缓存全部的计算结果返回主线程在持仓单使用
    positionListSymbolCalcInfo.set(item.id, {
      profit,
      yieldRate,
      marginRateInfo,
    })
  }
  return {
    positionListSymbolCalcInfo,
    totalProfit: toFixed(totalProfit, precision),
  }
}

/**
 * 实时计算下单时预估保证金
 * @param param0
 * @returns
 */
function calcExpectedMargin() {
  let { buySell, orderType, orderVolume, price, leverageMultiple } = tradeActions
  const quote = getCurrentQuote()

  orderVolume = Number(orderVolume || 0) // 手数

  const conf = quote?.symbolConf
  const prepaymentConf = quote?.prepaymentConf
  const contractSize = Number(conf?.contractSize || 0) // 合约大小
  const currentPrice = buySell === 'BUY' ? quote?.ask : quote?.bid // 现价

  let compelCloseRatio = currentAccountInfo?.compelCloseRatio || 0 // 强平比例
  compelCloseRatio = compelCloseRatio ? compelCloseRatio / 100 : 0

  price = Number(orderType === 'MARKET_ORDER' ? currentPrice : price) // 区分市价单和限价单价格

  // 交易品种选择外汇类型，计算预付款不需要加上价格。设置价格为1
  if (conf?.calculationType === 'FOREIGN_CURRENCY') {
    price = 1
  }

  let leverage = 1
  if (prepaymentConf?.mode === 'fixed_leverage') {
    // 固定杠杆
    leverage = Number(prepaymentConf?.fixed_leverage?.leverage_multiple)
  } else if (prepaymentConf?.mode === 'float_leverage') {
    // 浮动杠杆，获取用户设置的值
    leverage = leverageMultiple
  }

  let expectedMargin = 0 // 预估保证金

  // 固定预付款模式：占用保证金 = 固定预付款 * 手数
  if (prepaymentConf?.mode === 'fixed_margin') {
    expectedMargin = (prepaymentConf.fixed_margin?.initial_margin || 0) * orderVolume
  } else {
    // 杠杆模式：占用保证金 = 合约大小 * 手数 * 价格(买或卖) / 杠杆
    expectedMargin = (contractSize * orderVolume * price) / leverage
  }

  // 转化汇率
  return calcExchangeRate({
    value: expectedMargin,
    unit: conf?.prepaymentCurrency,
    buySell,
  })
}

/**
 * 计算可开仓手数
 * @param param0
 * @returns
 */
function getMaxOpenVolume() {
  const { availableMargin } = getAccountBalance()
  const quote = getCurrentQuote()
  const prepaymentConf = quote?.prepaymentConf
  const consize = quote.consize
  const mode = prepaymentConf?.mode
  const buySell = tradeActions.buySell
  const currentPrice = buySell === 'SELL' ? quote?.bid : quote?.ask
  let volume = 0

  const getExchangeValue = (value: number) => {
    return calcExchangeRate({
      value,
      // 计算保证金使用预付款货币单位
      unit: quote?.symbolConf?.prepaymentCurrency,
      buySell,
    })
  }

  const exchangeValue = getExchangeValue(currentPrice * consize || 0)

  if (availableMargin) {
    if (mode === 'fixed_margin') {
      // 可用/固定预付款

      // 需要换汇处理
      const marginExchangeValue = getExchangeValue(prepaymentConf?.fixed_margin?.initial_margin || 0)
      const initial_margin = Number(marginExchangeValue)
      volume = initial_margin ? Number(availableMargin / initial_margin) : 0
    } else if (mode === 'fixed_leverage') {
      // 固定杠杆：可用 /（价格*合约大小*手数x/固定杠杆）
      // 手数x = 可用 * 固定杠杆 / (价格*合约大小)*汇率
      const fixed_leverage = Number(prepaymentConf?.fixed_leverage?.leverage_multiple || 0)
      if (fixed_leverage && exchangeValue) {
        volume = (availableMargin * fixed_leverage) / exchangeValue
      }
    } else if (mode === 'float_leverage') {
      // 浮动杠杆：可用 /（价格*合约大小*手数x/浮动杠杆）
      // 手数x = 可用 * 固定杠杆 / (价格*合约大小)*汇率
      const float_leverage = Number(tradeActions.leverageMultiple || 1)
      if (float_leverage && exchangeValue) {
        volume = (availableMargin * float_leverage) / exchangeValue
      }
    }
  }

  return volume > 0 ? toFixed(volume) : '0.00'
}

// =========  计算相关 end ============

// ========  向主线程定时同步计算的数据 start ============
function syncCalcData() {
  if (!quotes.size) return
  const accountBalanceInfo = getAccountBalance()
  const { positionListSymbolCalcInfo, totalProfit: positionListTotalProfit } = calcPositionListSymbol() // 持仓单计算缓存
  const rightWidgetSelectMarginInfo = calcRightWidgetSelectMarginInfo() // 右下角选择的保证金信息
  const expectedMargin = calcExpectedMargin() // 预估保证金
  const maxOpenVolume = getMaxOpenVolume() // 最大可开仓手数

  sendMessage({
    type: 'SYNC_CALCA_RES',
    data: {
      accountBalanceInfo,
      positionListSymbolCalcInfo,
      positionListTotalProfit,
      rightWidgetSelectMarginInfo,
      expectedMargin,
      maxOpenVolume,
    },
  })
}
// ========  向主线程定时同步计算的数据 end ============

// =========  公共方法 start ============
/**
 * 获取当前激活打开的品种行情简化版
 * @param {*} currentSymbol 当前传入的symbolName
 * @returns
 */
export function getCurrentQuote(currentSymbolName?: string) {
  let symbol = currentSymbolName || activeSymbolName // 后台自定义的品种名称，symbol是唯一的

  // 当前品种的详细信息
  const currentSymbol = getActiveSymbolInfo(symbol)
  const dataSourceSymbol = currentSymbol?.dataSourceSymbol
  const dataSourceCode = currentSymbol?.dataSourceCode
  const accountGroupId = currentSymbol?.accountGroupId
  // const dataSourceKey = `${dataSourceCode}/${symbol}` // 获取行情的KEY，数据源+品种名称去获取
  const dataSourceKey = `${accountGroupId}/${symbol}` // 获取行情的KEY，账户组ID+品种名称去获取

  const currentQuote = quotes.get(dataSourceKey) // 行情信息
  const symbolConf = currentSymbol.symbolConf // 当前品种配置
  const prepaymentConf = currentSymbol?.symbolConf?.prepaymentConf // 当前品种预付款配置
  const consize = symbolConf?.contractSize || 1 // 合约单位

  const digits = Number(currentSymbol?.symbolDecimal || 2) // 小数位，默认2
  let ask = Number(currentQuote?.priceData?.sell || 0) // ask是买价，切记ask买价一般都比bid卖价高
  let bid = Number(currentQuote?.priceData?.buy || 0) // bid是卖价

  return {
    symbol, // 用于展示的symbol自定义名称
    dataSourceSymbol, // 数据源品种
    dataSourceKey, // 获取行情源的key
    digits,
    currentQuote,
    currentSymbol, // 当前品种信息
    quotes,
    ask: toFixed(ask, digits, false),
    bid: toFixed(bid, digits, false),
    symbolConf,
    prepaymentConf,
    consize,
  }
}

// 获取打开的品种完整信息
function getActiveSymbolInfo(currentSymbolName?: string) {
  const symbol = currentSymbolName || activeSymbolName
  const info = symbolListAll.find((item) => item.symbol === symbol) || {}
  return info as Account.TradeSymbolListItem
}

// 获取深度的key
function getDatasourceKey() {
  const info = getActiveSymbolInfo()
  return `${info.accountGroupId}/${info.symbol}`
}

/**
 * 格式化小数位
 * @param val
 * @param num 小数位
 * @param isTruncateDecimal 是否截取小数位
 * @returns
 */
function toFixed(val: any, num = 2, isTruncateDecimal = true) {
  let value = val || 0
  value = parseFloat(value)
  if (isNaN(value)) {
    value = 0
  }
  // 截取小数点展示
  if (isTruncateDecimal) {
    return truncateDecimal(value, num)
  }
  // 四舍五入
  return value.toFixed(num)
}

/**
 * 保留指定小数位，不做截取
 * @param number
 * @param digits
 * @returns
 */
function truncateDecimal(number: any, digits?: number) {
  const precision = digits || 2
  // 将数字转换为字符串
  const numStr = number.toString()
  // 找到小数点位置
  const decimalIndex = numStr.indexOf('.')
  // 如果没有小数点，直接返回
  if (decimalIndex === -1) return number
  // 截取指定小数位
  const truncatedStr = numStr.substring(0, decimalIndex + precision + 1)
  // 转换回数字
  return parseFloat(truncatedStr)
}

/**
 * 对象数组去重
 * @param arr 数组
 * @param key 对象的key唯一
 * @returns
 */
function uniqueObjectArray(arr: any, key: string) {
  if (!arr?.length) return []
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i][key] === arr[j][key]) {
        arr.splice(j, 1)
        j--
      }
    }
  }
  return arr
}
// =========  公共方法 end ============
