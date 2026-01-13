import { debounce } from 'lodash-es'
import { action, configure, makeAutoObservable, makeObservable, observable, runInAction, toJS } from 'mobx'

import { formaOrderList } from '@/v1/services/api/tradeCore/order'
import { STORAGE_GET_TOKEN, STORAGE_GET_USER_INFO } from '@/v1/utils/storage'
import { getCurrentQuoteV2 } from '@/v1/utils/wsUtil'

import { getEnv } from '@/v1/env'
import { isPCByWidth } from '@/v1/utils'
import mitt from '@/v1/utils/mitt'
// import klineStore from './kline'
import tradeMobxStore from './trade'
import { IDepth, IQuoteItem, ITradeType, MessagePopupInfo, WorkerType } from './ws.types'

// WebSocket 的四个状态
// https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
export type IReadyState =
  /**0 WebSocket 连接正在进行中 */
  | 'CONNECTING'
  /**1 WebSocket 连接已经建立并且可以进行通信 */
  | 'OPEN'
  /**2 WebSocket 连接正在关闭过程中。此时，客户端或服务器已经开始关闭连接，但连接还没有完全关闭，双方还可以继续发送和接收消息 */
  | 'CLOSEING'
  /**3 WebSocket 连接已经关闭，连接断开，无法再发送或接收消息 */
  | 'CLOSED'

export type SymbolWSItem = {
  accountGroupId?: any
  symbol: string
  // dataSourceCode?: any
}
export type SymbolWSItemSemi = {
  symbol: string
  // dataSourceCode?: string
}

// 禁用 MobX 严格模式
configure({ enforceActions: 'never' })

class WSStore {
  constructor() {
    makeObservable(this)
  }
  initConnectTimer: any = null
  reconnectTimer: any = null
  worker: Worker | null = null
  @observable readyState = 0 // ws连接状态
  @observable socket: any = null
  @observable quotes = new Map<string, IQuoteItem>() // 当前行情
  @observable depth = new Map<string, IDepth>() // 当前行情
  @observable symbols = {} // 储存品种请求列表

  originSend: any = null // socket 原生 send 方法
  sendingList: any[] = [] // 发送队列
  sendingSymbols = new Map<string, boolean>() // 发送队列
  toOpenSymbols = new Map<string, boolean>() // 即将打开的符号
  toCloseSymbols = new Map<string, boolean>() // 即将关闭的符号

  // ========== 连接相关 start ==========
  @action
  async connect(resolve?: () => void) {
    const ENV = getEnv()
    const token = await STORAGE_GET_TOKEN()
    const userInfo = (await STORAGE_GET_USER_INFO()) as User.UserInfo

    // 开发环境通过本地代理连接，生产环境直接连接远程服务器
    let websocketUrl = ENV?.ws
    if (process.env.NODE_ENV === 'development' && websocketUrl && typeof window !== 'undefined') {
      try {
        const url = new URL(websocketUrl)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        websocketUrl = `${protocol}//${window.location.host}${url.pathname}`
      } catch {
        // 解析失败时使用原始 URL
      }
    }

    if (!token) return

    // debugger
    console.log('connect')

    this.initWorker(resolve)
    if (this.readyState !== 1) {
      // 向worker线程发送连接指令
      this.initConnectTimer = setTimeout(
        () => {
          this.sendWorkerMessage({
            type: 'INIT_CONNECT',
            data: {
              token,
              userInfo,
              websocketUrl,
              isMobile: !isPCByWidth(),
            },
          })
        },
        this.worker ? 30 : 300,
      )
    }
  }

  @action
  close = () => {
    this.readyState = 0
    this.sendWorkerMessage({
      type: 'CLOSE',
    })
    this.closeWorker()
    if (this.initConnectTimer) clearTimeout(this.initConnectTimer)
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.resetData()
    tradeMobxStore.closeTimer()
  }

  resetData = () => {
    // 清空行情缓存
    this.quotes.clear()
    // 清空深度缓存
    this.depth.clear()
    // 清空发送队列
    this.sendingSymbols.clear()
  }

  // 关闭worker线程
  closeWorker = () => {
    if (this.worker) {
      // 在主线程中关闭worker，避免资源浪费
      this.worker.terminate()
      this.worker = null
    }
  }

  // 中断连接再重连
  @action
  reconnect(cb?: () => void) {
    this.close()
    // 重新连接
    this.reconnectTimer = setTimeout(() => {
      this.connect(cb)
    }, 1000)
  }

  // 初始化worker线程
  initWorker(resolve?: () => void) {
    this.worker = this.worker || new Worker(new URL('./ws.worker.ts', import.meta.url))
    this.worker.onmessage = (event: MessageEvent) => {
      this.handleWorkerMessage(event, resolve)
    }
  }

  resolveMsg(data: Record<string, string>) {
    // 广播一个 event RESOLVE
    const resolveMsgEvent = new CustomEvent('RESOLVE_MSG', {
      detail: {
        ...data,
      },
    })

    window.dispatchEvent(resolveMsgEvent)
  }

  // 接收worker线程消息
  @action
  handleWorkerMessage = (event: MessageEvent, resolve?: () => void) => {
    const { data } = event.data
    const type = event.data?.type as WorkerType

    switch (type) {
      case 'CONNECT_SUCCESS':
        this.handleOpenCallback()
        runInAction(() => {
          this.readyState = data?.readyState
        })
        resolve?.()
        break
      case 'SYMBOL_RES':
        // 增量更新行情
        runInAction(() => {
          if (data && data.size) {
            data.forEach((item: IQuoteItem, dataSourceKey: string) => {
              this.quotes.set(dataSourceKey, item)
            })
            // 更新k线数据
            // klineStore.updateKlineData(this.quotes)
          }
        })
        break
      case 'DEPTH_RES':
        // 更新深度
        runInAction(() => {
          if (data && data.size) {
            data.forEach((item: IDepth, dataSourceKey: string) => {
              this.depth.set(dataSourceKey, item)
            })
          }
        })
        break
      case 'TRADE_RES':
        // 更新交易信息
        this.receiveTradeMessage(data)
        break
      case 'MESSAGE_RES':
        // 派发一个消息事件
        mitt.emit('ws-message-popup', data as MessagePopupInfo)
        // console.log('消息通知', data)
        break
      // 同步计算的结果返回
      case 'SYNC_CALCA_RES':
        tradeMobxStore.setSycCalcRes(data)
        break
      case 'RESOLVE_MSG':
        this.resolveMsg(data)
        break
      case 'CLOSE':
        break
    }
  }

  // 向worker线程发送消息
  sendWorkerMessage = ({ type, data }: { type: WorkerType; data?: any }) => {
    if (this.worker) {
      // console.log('向worker线程发送消息', type, data)
      this.worker.postMessage({
        type,
        data,
      })
    }
  }

  // 连接socket成功回调
  handleOpenCallback = () => {
    this.subscribeMessage()
    this.subscribeTrade()

    if (isPCByWidth()) {
      // this.openSymbol({
      //   symbols: this.makeWsSymbolBySemi(trade.symbolListAll)
      // })

      // PC 订阅所有品种, 跳过标记环节
      this.subscribeSymbol(this.makeWsSymbolBySemi(toJS(tradeMobxStore.symbolListAll)), false)

      this.subscribeDepth()
    }
  }

  // ========== 连接相关 end ===============

  // ============ 订阅相关 start ============
  setSendingSymbols = ({
    symbolList,
    cancel,
    cover,
  }: {
    symbolList: SymbolWSItem[]
    cancel: boolean
    cover?: boolean
  }) => {
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

    console.log('正在订阅的符号：', this.sendingSymbols)
    console.log('即将关闭的符号：', this.toCloseSymbols)

    // 订阅操作立即执行，取消操作延迟执行
    !cancel && this.subscribeSymbol(symbolList, cancel)

    // 延迟取消订阅
    this.debounceBatchCloseSymbol()

    console.log('--- end -----------------')
  }

  // 订阅或取消订阅行情
  subscribeSymbol = (symbolList: SymbolWSItem[], cancel: boolean) => {
    this.sendWorkerMessage({
      type: 'SUBSCRIBE_QUOTE',
      data: {
        cancel,
        list: symbolList,
      },
    })
  }

  // 订阅需要响应处理的消息
  subscribeNotify = (cancel: boolean) => {
    this.sendWorkerMessage({
      type: 'SUBSCRIBE_NOTIFY',
      data: { cancel },
    })
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
    cover = false,
  }: {
    cancel?: boolean
    needAccountGroupId?: boolean
    list?: SymbolWSItem[]
    cover?: boolean
  }) => {
    if (!list?.length) return

    const symbolList = toJS(list)

    console.log(' ')
    console.log(
      `--- start: 批量${cancel ? '取消' : '订阅'}行情${cover ? '[并取消其他历史订阅]' : ''}:`,
      symbolList.length,
    )
    // 先打标记
    this.setSendingSymbols({ symbolList, cancel, cover })
  }

  // 动态订阅汇率品种行情
  subscribeExchangeRateQuote = (symbolConf?: Symbol.SymbolConf, symbolName?: string) => {
    const activeSymbolName = symbolName || tradeMobxStore.activeSymbolName
    const quote = getCurrentQuoteV2(this.quotes, activeSymbolName, tradeMobxStore.symbolMapAll)
    // 如果不传，使用当前激活的品种配置
    const conf = symbolConf || quote?.symbolConf
    if (!conf) return

    const allSimpleSymbolsMap = tradeMobxStore.allSimpleSymbolsMap
    const unit = conf?.profitCurrency // 货币单位
    // 乘法
    const divName = ('USD' + unit).toUpperCase() // 如 USDNZD
    // 除法
    const mulName = (unit + 'USD').toUpperCase() // 如 NZDUSD

    const symbolInfo = allSimpleSymbolsMap[divName] || allSimpleSymbolsMap[mulName]

    if (!symbolInfo) return

    const toSend = new Map<string, boolean>()
    toSend.set(
      this.symbolToString({
        accountGroupId: tradeMobxStore.currentAccountInfo.accountGroupId,
        symbol: symbolInfo.symbol,
      }),
      true,
    )

    this.debounceBatchSubscribeSymbol({ toSend })
  }

  // 订阅当前打开的品种深度报价
  subscribeDepth = (cancel?: boolean) => {
    const symbolInfo = tradeMobxStore.getActiveSymbolInfo(tradeMobxStore.activeSymbolName, tradeMobxStore.symbolListAll)

    // 深度为0 不需要订阅深度
    if (!symbolInfo?.symbol || symbolInfo.symbolConf?.depthOfMarket === 0) return

    this.sendWorkerMessage({
      type: 'SUBSCRIBE_DEPTH',
      data: {
        cancel,
        symbolInfo: toJS(symbolInfo),
      },
    })
  }

  // 订阅持仓记录、挂单记录、账户余额信息
  subscribeTrade = (cancel?: boolean) => {
    const currentAccountInfo = tradeMobxStore.currentAccountInfo
    const accountId = currentAccountInfo?.id
    if (!accountId) return
    this.sendWorkerMessage({
      type: 'SUBSCRIBE_TRADE',
      data: {
        topic: `/000000/trade/${accountId}`,
        cancel,
      },
    })
  }

  // 订阅消息
  subscribeMessage = async (cancel?: boolean) => {
    this.sendWorkerMessage({
      type: 'SUBSCRIBE_MESSAGE',
      data: {
        cancel,
      },
    })
  }

  // ============ 订阅相关 end ============

  // ========== H5订阅相关 start ============
  // 工具方法：通过符号列表，生成成品符号列表
  makeWsSymbol = (symbols: string[], _accountGroupId?: string) => {
    const symbolMap = tradeMobxStore.symbolMapAll
    const symbolSemis = symbols.map((symbol) => ({
      symbol,
      // dataSourceCode: symbolMap?.[symbol]?.dataSourceCode
    })) as SymbolWSItemSemi[]

    const accountGroupId = _accountGroupId || tradeMobxStore.currentAccountInfo.accountGroupId
    return symbolSemis.map((symbolSemi) => ({ ...symbolSemi, accountGroupId })) as SymbolWSItem[]
  }

  // 工具方法：通过半成品符号列表，生成成品符号列表
  makeWsSymbolBySemi = (symbolSemis: SymbolWSItemSemi[], _accountGroupId?: string) => {
    const accountGroupId = _accountGroupId || tradeMobxStore.currentAccountInfo.accountGroupId
    return symbolSemis.map((symbolSemi) => ({ ...symbolSemi, accountGroupId })) as SymbolWSItem[]
  }

  // 检查socket是否连接，如果未连接，则重新连接
  checkSocketReady = (fn?: () => void) => {
    if (this.readyState !== 1) {
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

  stringToSymbol = (str: string) => {
    const [symbol, accountGroupId, dataSourceCode] = str.split('-')
    return {
      symbol: symbol === 'undefined' ? undefined : symbol,
      accountGroupId: accountGroupId === 'undefined' ? undefined : accountGroupId,
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

  // 弃用 openTrade & closeTrade：20250207， 使用 openPosition & closePosition 代替

  /**
   * 打开仓位订阅
   * @param symbols 需要订阅的符号列表
   * @param cover 是否取消其他历史订阅
   */
  openPosition = ({ symbols, cover = true }: { symbols: SymbolWSItem[]; cover?: boolean }) => {
    this.openSymbol({
      symbols,
      cover,
    })
    this.subscribePosition()
  }

  /** 注意：离开仓位页面时，请主动取消订阅 */
  closePosition = () => {
    this.debounceBatchCloseSymbol()
    this.subscribePosition(true)
  }

  // 订阅持仓记录、挂单记录、账户余额信息
  subscribePosition = (cancel?: boolean) => {
    this.subscribeTrade(cancel)
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
      // 订阅列表，并取消其他历史订阅
      const listToSend = Array.from(toSend.keys()).map((key) => this.stringToSymbol(key)) as SymbolWSItem[]
      this.batchSubscribeSymbol({ list: listToSend, cover })
    } else if (toOpen?.size) {
      this.batchSubscribeSymbol({ list })
    } else {
      console.log('==== 重复订阅，无需关闭订阅 ====》', toSend)
      toSend.forEach((value, key) => {
        // 已经订阅，如果【待停止订阅】列表中存在，则移除
        this.toCloseSymbols.delete(key)
      })
    }
  }

  // 封装一个延迟执行的取消订阅方法
  debounceBatchCloseSymbol = debounce(
    ({}: // list = []
    {
      // list?: Array<SymbolWSItem>
      source?: string
    } = {}) => {
      console.log('取消订阅的符号：', JSON.stringify(this.toCloseSymbols))
      const list = Array.from(this.toCloseSymbols.keys()).map((key) => this.stringToSymbol(key)) as SymbolWSItem[]
      // 取消订阅
      this.subscribeSymbol(list, true)

      console.log('正在订阅的符号：', this.sendingSymbols)
      this.toCloseSymbols.clear()
    },
    8000,
  )
  // ========== H5 订阅相关 end ============

  // 处理交易消息
  @action
  receiveTradeMessage = (data: any) => {
    // console.log('ws交易消息', data)
    const type = data.type as ITradeType
    // 账户余额变动
    if (type === 'ACCOUNT') {
      const accountInfo = data.account || {}
      runInAction(() => {
        tradeMobxStore.currentAccountInfo = {
          ...tradeMobxStore.currentAccountInfo,
          ...accountInfo,
        }
      })
      console.log('账户余额变动', tradeMobxStore.currentAccountInfo)
      console.log('余额money', tradeMobxStore.currentAccountInfo.money)
      console.log('占用保证金margin', tradeMobxStore.currentAccountInfo.margin)
    }
    // 持仓列表
    else if (type === 'MARKET_ORDER') {
      const positionList = data.bagOrderList || []
      runInAction(() => {
        tradeMobxStore.positionList = formaOrderList(positionList)
      })
    }
    // 挂单列表
    else if (type === 'LIMIT_ORDER') {
      const pendingList = data.limiteOrderList || []
      runInAction(() => {
        tradeMobxStore.pendingList = formaOrderList(pendingList)
      })
    }
    // 历史成交记录,用不到
    else if (type === 'TRADING') {
    }
  }
}

export const wsMobxStore = new WSStore()

export default wsMobxStore
