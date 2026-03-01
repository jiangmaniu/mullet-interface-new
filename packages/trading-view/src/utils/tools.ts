import NP from 'number-precision'

import { base64ToFloat32, base64ToInt } from './binary'

// 随机生成16位字符串
export function randomWord() {
  let str = ''
  const arr = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z'
  ]
  for (let i = 0; i < 16; i++) {
    const pos = Math.round(Math.random() * (arr.length - 1))
    str += arr[pos]
  }
  return str
}

export function deepClone<T>(source: T): T {
  if (!source || typeof source !== 'object') {
    throw new Error('error arguments deepClone')
  }
  const targetObj = (Array.isArray(source) ? [] : {}) as T
  Object.keys(source as object).forEach((key) => {
    const val = (source as Record<string, unknown>)[key]
    if (val && typeof val === 'object') {
      (targetObj as Record<string, unknown>)[key] = deepClone(val)
    } else {
      (targetObj as Record<string, unknown>)[key] = val
    }
  })
  return targetObj
}

export {
  arrayBufferToBase64,
  base64ToFloat32,
  base64ToInt,
  intToBin,
  stringToBin
} from './binary'

export function getQueryObject(url?: string | null): Record<string, string> {
  const target = url == null ? (typeof window !== 'undefined' ? window.location.href : '') : url
  const search = target.substring(target.lastIndexOf('?') + 1)
  const obj: Record<string, string> = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (_rs, $1: string, $2: string) => {
    obj[decodeURIComponent($1)] = decodeURIComponent($2)
    return _rs
  })
  return obj
}

export function parseTime(
  time?: number | string | Date,
  cFormat?: string
): string | null {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date: Date
  if (time instanceof Date) {
    date = time
  } else if (typeof time === 'object') {
    date = time as unknown as Date
  } else {
    let ts = time as number
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      ts = parseInt(time, 10)
    }
    if (typeof ts === 'number' && ts.toString().length === 10) {
      ts = ts * 1000
    }
    date = new Date(ts)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (_result, key: keyof typeof formatObj) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @description 绑定事件 on(element, event, handler)
 */
export const on = (function () {
  if (typeof document !== 'undefined') {
    return function (
      element: Element | null,
      event: string,
      handler: EventListener
    ) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false)
      }
    } as (el: Element | null, ev: string, fn: EventListener) => void
  }
  return function () {
    /* no-op when document is unavailable (e.g. SSR) */
  } as (el: Element | null, ev: string, fn: EventListener) => void
})()

/**
 * @description 解绑事件 off(element, event, handler)
 */
export const off = (function () {
  if (typeof document !== 'undefined') {
    return function (
      element: Element | null,
      event: string,
      handler: EventListener
    ) {
      if (element && event) {
        element.removeEventListener(event, handler, false)
      }
    } as (el: Element | null, ev: string, fn?: EventListener) => void
  }
  return function () {
    /* no-op when document is unavailable */
  } as (el: Element | null, ev: string, fn?: EventListener) => void
})()

export { isPC } from './device'

// 解密历史数据
export function uncodeHistoryData(
  dataArr: Array<{ b: string }>,
  precision: number
): Array<{ open: number; close: number; high: number; low: number; volume: number; time: number }> {
  return dataArr.map((item) => {
    const blob = window.atob(item.b)
    return {
      open: NP.round(base64ToFloat32(blob.slice(0, 4))[0], precision),
      close: NP.round(base64ToFloat32(blob.slice(4, 8))[0], precision),
      high: NP.round(base64ToFloat32(blob.slice(8, 12))[0], precision),
      low: NP.round(base64ToFloat32(blob.slice(12, 16))[0], precision),
      volume: NP.round(base64ToInt(blob.slice(16, 20))[0], precision),
      time: base64ToInt(blob.slice(20))[0] * 1000
    }
  })
}
