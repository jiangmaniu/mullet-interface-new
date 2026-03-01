// @ts-nocheck
import ByteBuffer from 'bytebuffer'
import dayjs from 'dayjs'
import { action, makeAutoObservable, observable } from 'mobx'
import NP from 'number-precision'
import ReconnectingWebSocket from 'reconnecting-websocket'

import { symbolInfoArr } from '@/config/symbols'
import { WEBSOCKET_URLS } from '@/constants'
import { MSG_TYPE } from '@/constants/enum'
import LogInPb from '@/libs/proto/LogIn_pb'
import MtEventPb from '@/libs/proto/MtEvent_pb'
import MtQuestPb from '@/libs/proto/MtQuest_pb'
import QuotePb from '@/libs/proto/Quote_pb'
import UserInfoPb from '@/libs/proto/UserInfo_pb'

NP.enableBoundaryChecking(false)

class WsStore {
  constructor() {
    makeAutoObservable(this)
  }
  socket: any = null
  tvWidget = null
  @observable socketState = 0
  @observable activeSymbolInfo = {
    symbolInfo: {}
  }
  @observable loading = true
  @observable lastbar = {} // 最后一条k线数据（用于 setQuoteData/updateBar 实时更新）
  @observable wsUrls = WEBSOCKET_URLS

  @action
  async connect() {
    const urls = this.wsUrls

    let urlIndex = 0
    const urlProvider = () => urls[urlIndex++ % urls.length]
    this.socket = new ReconnectingWebSocket(urlProvider, [], {
      minReconnectionDelay: 1,
      //   connectionTimeout: 5000, // 重连时间
      connectionTimeout: 2000, // 重连时间
      maxEnqueuedMessages: 0 // 不缓存发送失败的指令
    })
    this.socket.addEventListener('open', () => {
      this.socketState = 1
      // 获取品种信息
      this.getSymbolInfo()
    })
    this.socket.addEventListener('message', (d: any) => {
      // console.log(d)
      // const res = JSON.parse(d.data)
      // this.message(res.data)
      this.handleBinMessage(d.data)
    })
    this.socket.addEventListener('close', (e) => {
      console.log('socket close', e)
    })
  }

  /** 当前已订阅的行情品种（按需订阅，仅保留 activeSymbol） */
  subscribedSymbolName = null

  // 获取品种信息（仅查询类，不发起行情订阅；行情由 setActiveSymbolInfo 按需订阅）
  getSymbolInfo() {
    symbolInfoArr.map((item) => {
      this.getSblLiveDataFn(item, MSG_TYPE.SYMBOL_QUERY)
      this.getSblLiveDataFn(item, MSG_TYPE.SYMBOL_STATIS_QUERY)
      this.getSblLiveDataFn(item, MSG_TYPE.LATEST_PRICE_QUERY)
    })
  }

  // 获取产品实时行情订阅
  getSblLiveData(item) {
    const qSymbol = new MtQuestPb.QSymbol()
    const sub = new MtQuestPb.Subscribe()

    qSymbol.setSbl(item.name)
    sub.addSbls(qSymbol)

    this.serializeBinary(sub, MSG_TYPE.QUOTE_SUBSCRIBE)
  }

  // 取消产品实时行情订阅（按需退订）
  getSblUnsubscribe(symbolName) {
    if (!symbolName) return
    const qSymbol = new MtQuestPb.QSymbol()
    const sub = new MtQuestPb.Subscribe()
    qSymbol.setSbl(symbolName)
    sub.addSbls(qSymbol)
    this.serializeBinary(sub, MSG_TYPE.QUOTE_SUBSCRIBE_CANCEL)
  }

  // 获取产品实时行情
  // 10001:获取品种信息; 10003:获取高开低收; 10007:获取最新报价
  async getSblLiveDataFn(item, cmd) {
    const qSymbol = new MtQuestPb.QSymbol()
    qSymbol.setSbl(item.name)

    this.serializeBinary(qSymbol, cmd)
  }

  // 数据序列化成二进制，并且发送数据
  serializeBinary(b, cmd) {
    const streamForProto = b.serializeBinary() //序列化

    //算数据包的长度，类型大小（TYPE SIZE）+ 数据长度
    const bufferSize = streamForProto.length + 4
    const sendBuffer = ByteBuffer.allocate(bufferSize) // 创建一个长度为 bufferSize 的空白字节数组

    // 消息包 = 类型(int) + 内容(byte[])
    // https://github.com/protobufjs/bytebuffer.js/wiki/API

    // 写入类型int
    sendBuffer.writeInt(cmd)

    // 写入内容body
    sendBuffer.append(streamForProto)

    // 使此 ByteBuffer 为新的写入或相关读取操作序列做好准备
    sendBuffer.flip()

    // sendBuffer.view用于操作后备缓冲区的数据视图
    this.sendSocketBinMsg(sendBuffer.view)
  }

  // 发送socket消息，数据已经转为二进制
  sendSocketBinMsg(data) {
    const readyState = (this.socket && this.socket.readyState) || 0
    if (this.socket && readyState == 1) {
      this.socket.send(data)
    }
  }

  // 处理二进制socket消息
  handleBinMessage(blob) {
    blob.arrayBuffer().then((buf) => {
      const uint8buf = new Uint8Array(buf)

      // 解包二进制数据
      this.splitReceivePacket(uint8buf)
    })
  }

  // 解包二进制数据
  splitReceivePacket(receiveBuffer) {
    const TYPE_SIZE = 4
    const bytesRead = receiveBuffer.length
    let position = 0

    while (position < bytesRead) {
      const messageIdBuffer = new Uint8Array(TYPE_SIZE)
      messageIdBuffer.set(receiveBuffer.slice(position, position + TYPE_SIZE), TYPE_SIZE * 0) //type

      // 消息包 = 类型(int) + 内容(byte[])
      const cmdBuf = ByteBuffer.allocate(TYPE_SIZE) // 创建一个长度为 4 的空白字节数组
      cmdBuf.append(messageIdBuffer)

      // 读取的偏移量。如果省略，将使用并推进 ByteBuffer#offset 由 4
      const cmd = cmdBuf.readInt(0) // 获取cmd类型值

      if (position > bytesRead) {
        console.log('Error receive packet,packet is too long: ' + bytesRead)
        break
      }

      const res = {
        cmd,
        startIndex: position + TYPE_SIZE,
        length: bytesRead - TYPE_SIZE,
        buffer: receiveBuffer
      }

      position += bytesRead

      this.message(res)
    }
  }

  // 把二进制数据转成json对象
  binarySystemToJson(receiveBuffer, startIndex, len, pbObj) {
    // pbObj需要和消息类型MSG_TYPE对应，需要看docs/assets/消息类型.png
    const buffData = receiveBuffer.slice(startIndex, startIndex + len) // body
    const dataTemp = pbObj.deserializeBinary(buffData)

    return dataTemp?.toObject() || {}
  }

  @action
  send(cmd = {}) {
    // 发送socket指令
    // console.log('发送', cmd)
    this.socket.send(JSON.stringify(cmd))
  }
  // 处理ws消息
  @action
  message = (data = {}) => {
    // console.log(data)
    const startIndex = data.startIndex
    const len = data.startIndex + data.length
    let jsonData = null

    // 暂时用不到
    // const data = this.binarySystemToJson(data.buffer, startIndex, len, MtEventPb.Response)
    // console.log('data', data)
    // @TODO 用旧版本看是否有这些参数，是否走到里面逻辑
    // switch (data.t) {
    //   case 0: // 一口报价，包含时间，买入价，卖出价，品种信息
    //     for (const item of data.d) {
    //       const blob = window.atob(item.q)
    //       const obj = {
    //         n: blob.slice(0, 12).replace(/[^.\w]/g, ''),
    //         b: base64ToFloat32(blob.slice(12, 16))[0],
    //         a: base64ToFloat32(blob.slice(16, 20))[0],
    //         t: base64ToInt(blob.slice(20))[0]
    //       }
    //       if (obj.n.endsWith('usdt')) {
    //         obj.n = obj.n.replace('usdt', '/usdt')
    //       }
    //       this.setQuoteData(obj)
    //     }
    //     break
    //   case 10:
    //     this.getWsHistory(data.d)
    //     break
    // }
    // mt5 数据
    if (data.cmd === MSG_TYPE.QUOTE_TICK) {
      jsonData = this.binarySystemToJson(data.buffer, startIndex, len, QuotePb.QuoteMsg)
      const obj = {
        n: jsonData.sbl,
        b: jsonData.bidList[0].price,
        a: jsonData.askList[0].price,
        t: jsonData.ut
      }
      // console.log('jsonData', jsonData)
      this.setQuoteData(obj)
    }
  }
  // 处理行情数据
  @action
  setQuoteData = (data = {}) => {
    if (this.activeSymbolInfo.symbolInfo) {
      const activeSymbolname = this.activeSymbolInfo.symbolInfo.name
      if (data.n === activeSymbolname) {
        const resolution = this.activeSymbolInfo.resolution
        const precision = this.activeSymbolInfo.symbolInfo.precision
        // 通过ws更新k线数据
        const newLastBar = this.updateBar(data, { resolution, precision })
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
    // console.log(currentSymbol)
    const precision = currentSymbol.precision
    const lastBar = this.lastbar
    if (!lastBar) return
    let resolution = currentSymbol.resolution
    let rounded = socketData.t
    if (!isNaN(resolution) || resolution.includes('D')) {
      if (resolution.includes('D')) {
        resolution = 1440
      }
      const coeff = resolution * 60
      rounded = Math.floor(socketData.t / coeff) * coeff
    } else if (resolution.includes('W')) {
      rounded =
        dayjs(socketData.t * 1000)
          .day(0)
          .hour(0)
          .minute(0)
          .second(0)
          .millisecond(0)
          .valueOf() / 1000
    } else if (resolution.includes('M')) {
      rounded =
        dayjs(socketData.t * 1000)
          .date(1)
          .hour(0)
          .minute(0)
          .second(0)
          .millisecond(0)
          .valueOf() / 1000
    }
    const lastBarSec = lastBar.time / 1000
    if (rounded > lastBarSec) {
      // console.log('新建')
      newLastBar = {
        time: rounded * 1000,
        open: NP.round(socketData.b, precision),
        high: NP.round(socketData.b, precision),
        low: NP.round(socketData.b, precision),
        close: NP.round(socketData.b, precision)
      }
    } else {
      newLastBar = {
        time: lastBar.time,
        open: lastBar.open,
        high: NP.round(Math.max(lastBar.high, socketData.b), precision),
        low: NP.round(Math.min(lastBar.low, socketData.b), precision),
        close: NP.round(socketData.b, precision)
      }
    }
    return newLastBar
  }

  // 记录tvWidget初始化实例
  @action
  setTvWidget = (tvWidget) => {
    this.tvWidget = tvWidget
  }

  // 记录当前的 symbol，并按需订阅/退订行情
  @action
  setActiveSymbolInfo = (data) => {
    const nextName = data?.symbolInfo?.name
    const prevName = this.subscribedSymbolName

    if (nextName && nextName !== prevName) {
      if (prevName) this.getSblUnsubscribe(prevName)
      this.getSblLiveData({ name: nextName })
      this.subscribedSymbolName = nextName
    }

    this.activeSymbolInfo = {
      ...this.activeSymbolInfo,
      ...data
    }
  }

  // 取消订阅
  removeActiveSymbol = (subscriberUID) => {
    if (this.activeSymbolInfo.subscriberUID !== subscriberUID) return
    const name = this.subscribedSymbolName
    if (name) {
      this.getSblUnsubscribe(name)
      this.subscribedSymbolName = null
    }
    this.activeSymbolInfo = { symbolInfo: {} }
  }
}

const wsStore = new WsStore()
export default wsStore
