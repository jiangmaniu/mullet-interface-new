// @ts-nocheck

import dayjs from 'dayjs'
import NP from 'number-precision'

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
    let pos = ''
    pos = Math.round(Math.random() * (arr.length - 1))
    str += arr[pos]
  }
  return str
}

export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach((keys) => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}
export function base64ToFloat32(blob) {
  const fLen = blob.length / Float32Array.BYTES_PER_ELEMENT // How many floats can be made, but be even
  const dView = new DataView(new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT)) // ArrayBuffer/DataView to convert 4 bytes into 1 float.
  const fAry = new Float32Array(fLen) // Final Output at the correct size
  let p = 0 // Position
  for (let j = 0; j < fLen; j++) {
    p = j * 4
    dView.setUint8(0, blob.charCodeAt(p))
    dView.setUint8(1, blob.charCodeAt(p + 1))
    dView.setUint8(2, blob.charCodeAt(p + 2))
    dView.setUint8(3, blob.charCodeAt(p + 3))
    fAry[j] = dView.getFloat32(0, true)
  }
  return fAry
}

export function base64ToInt(blob) {
  const fLen = blob.length / Int32Array.BYTES_PER_ELEMENT // How many floats can be made, but be even
  const dView = new DataView(new ArrayBuffer(Int32Array.BYTES_PER_ELEMENT)) // ArrayBuffer/DataView to convert 4 bytes into 1 float.
  const fAry = new Int32Array(fLen) // Final Output at the correct size
  let p = 0 // Position
  for (let j = 0; j < fLen; j++) {
    p = j * 4
    dView.setInt8(0, blob.charCodeAt(p))
    dView.setInt8(1, blob.charCodeAt(p + 1))
    dView.setInt8(2, blob.charCodeAt(p + 2))
    dView.setInt8(3, blob.charCodeAt(p + 3))
    fAry[j] = dView.getInt32(0, true)
  }
  return fAry
}

export function getQueryObject(url) {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}

export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time)
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
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
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
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
  if (typeof document !== 'undefined' && document.addEventListener) {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler)
      }
    }
  }
})()

/**
 * @description 解绑事件 off(element, event, handler)
 */
export const off = (function () {
  if (typeof document !== 'undefined' && document.removeEventListener) {
    return function (element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler)
      }
    }
  }
})()

/**使用https请求K线图数据的加密方法 */
export function intToBin(str) {
  const arraybuffer = new ArrayBuffer(4)
  const strView = new Int8Array(arraybuffer)
  for (let i = 3; i >= 0; i--) {
    strView[i] = (str >> (8 * i)) & 0xff
  }
  return strView
}

export function stringToBin(str, len) {
  const byte = new Uint8Array(len)
  const strArr = str.split('')
  for (let i = 0; i < len; i++) {
    if (i > strArr.length - 1) {
      byte[i] = 0
    } else {
      byte[i] = strArr[i].charCodeAt()
    }
  }
  return byte
}

export function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

//判断是否为PC
export function isPC() {
  const userAgentInfo = navigator.userAgent
  const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod']
  let flag = true
  for (let v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false
      break
    }
  }
  return flag
}

// 解密历史数据
export function uncodeHistoryData(dataArr, precision) {
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
