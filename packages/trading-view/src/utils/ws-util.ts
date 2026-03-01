import { Base64 } from 'js-base64'

// 获取 ws 行情数据信息（二进制解析等）
export const quoteUtil = {
  strip(val: number): number {
    return typeof val === 'number' && !Number.isNaN(val) ? val : 0
  },
  base64ToArrayBuffer(data: string) {
    const binary_string = Base64.atob(data)
    const len = binary_string.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i)
    }
    return bytes.buffer
  },
  getSymbol(data: string) {
    // 获取种类名称
    const binary_string = Base64.atob(data)
    return binary_string.slice(0, 12).replace(/\0/g, '')
  },
  getPrice(quoteBuffer: any, offset = 12) {
    return new Float32Array(quoteBuffer, offset)
  },
  getTime(quoteBuffer: any, offset = 20) {
    const t = new Int32Array(quoteBuffer, offset)
    return +new Date('1970/01/01').setSeconds(t[0])
  },
  getQuote(symbol: any, data: any) {
    // 返回行情数据
    if (typeof data == 'undefined') {
      data = symbol
      symbol = this.getSymbol(data)
    }
    const quoteBuffer = this.base64ToArrayBuffer(data)
    const priceArr = this.getPrice(quoteBuffer)
    const time = this.getTime(quoteBuffer)
    return {
      symbol,
      bid: this.strip(priceArr[0]),
      ask: this.strip(priceArr[1]),
      time,
      diff: 0 // 初始值
    }
  },
  getChart(data: string) {
    const buffer = this.base64ToArrayBuffer(data)
    const chart = this.getPrice(buffer, 0)
    const time = this.getTime(buffer)
    const res: Record<string, number> = { t: time }
    const arr = ['o', 'c', 'h', 'l', 'w'] as const
    arr.forEach((item, i) => {
      res[item] = this.strip(chart[i])
    })
    return res
  },
  stringToBin(data: any, len: number) {
    data += ''
    const bytes = new Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = data.charCodeAt(i)
    }
    return String.fromCharCode.apply(null, bytes)
  },
  intToBin(data: any) {
    const bytes = new Array(4)
    for (let i = 3; i >= 0; i--) {
      bytes[i] = (data >> (8 * i)) & 0xff
    }
    return String.fromCharCode.apply(null, bytes)
  },
  timeToBin(data: number | string | Date) {
    // 时间（秒数）转二进制
    const ts = typeof data === 'number' || typeof data === 'string' ? new Date(data).getTime() : data.getTime()
    return this.intToBin(Math.floor(ts / 1000))
  }
}

/** @deprecated 使用 @/config/symbols 中的 symbolInfoArr */
export { symbolInfoArr } from '@/config/symbols'
