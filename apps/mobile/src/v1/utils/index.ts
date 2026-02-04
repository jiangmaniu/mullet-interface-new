import DecimalOld from 'decimal.js'
import currency from 'currency.js'
import { FIXED_ZERO_VALUE } from '@/v1/constants'
import { message } from './message'
import { Clipboard } from 'react-native'
import { t } from '@lingui/core/macro'

export const regPassword = /(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[\W_]).{8,16}$/gi // 至少包含一个数字、至少包含一个大写字母、至少包含一个小写字母、至少包含一个特殊字符或下划线

export const regEmail =
  /^[a-zA-Z0-9.!#$%&amp;'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
export const regMobile = /^\d+(.\d{1,2})?$/

const regcode = /^[0-9]+$/

export function Decimal(v) {
  try {
    if (!v) v = 0
    return new DecimalOld(v)
  } catch {
    return new DecimalOld(NaN)
  }
}

export function isMobile(str: string) {
  return regMobile.test(str)
}
export function isPassword(str: string) {
  return regPassword.test(str)
}
export function isEmail(str: string) {
  return regEmail.test(str)
}

// guid
export async function getUID() {
  // let uuid = await storage.getUUId()
  let uuid = ''
  if (!uuid) {
    uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
    // await storage.setUUId(uuid)
  }
  return uuid
}

// 格式化手机号码 178****12
export function formatMobile(mobile: string) {
  const mobileReg = /(\d{3})\d*(\d{2})/
  return `${mobile}`.replace(mobileReg, '$1****$2')
}

// 格式化邮箱
export const formatEmail = (email: string) => {
  if (email.indexOf('@') > 0) {
    let newEmail
    const str = email.split('@')
    let _s = ''

    if (str[0].length > 4) {
      _s = str[0].substr(0, 4)
      for (let i = 0; i < str[0].length - 4; i++) {
        _s += '*'
      }
    } else {
      _s = str[0].substr(0, 1)
      for (let i = 0; i < str[0].length - 1; i++) {
        _s += '*'
      }
    }
    newEmail = _s + '@' + str[1]
    return newEmail
  } else {
    return email
  }
}

// 日期字符串格式化
export function formatTimeDate(at: string) {
  const mapObj = {
    T: ' ',
    '-': '/'
  }
  return new Date(
    at.replace(/T|-/g, (matched) => {
      return mapObj[matched]
    })
  )
}

// 本地时间格式化
export function getLocalTime(at, fmt) {
  if (!at) {
    return '--'
  }
  // if (typeof at === 'string') {
  //   const mapObj = {
  //     T: ' ',
  //     '-': '/'
  //   }
  //   at = new Date(
  //     at.replace(/T|-/g, function (matched) {
  //       return mapObj[matched]
  //     })
  //   )
  //   console.log('---iiii--', at)
  // } else {
  //   at = new Date(at)
  // }
  at = new Date(at)

  const o = {
    'M+': at.getMonth() + 1, // 月份
    'd+': at.getDate(), // 日
    'h+': at.getHours(), // 小时
    'm+': at.getMinutes(), // 分
    's+': at.getSeconds(), // 秒
    'q+': Math.floor((at.getMonth() + 3) / 3), // 季度
    S: at.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, String(at.getFullYear()).substr(4 - RegExp.$1.length))
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(String(o[k]).length))
    }
  }
  return fmt
}

// 获取时间数组
type TimeType = 'day' | 'week' | 'month' | 'threeMonth' | 'halfYear' | 'all'
export function getTimeDistance(type: TimeType, format: boolean | string = 'yyyy-MM-dd hh:mm:ss') {
  const oneDay = 1000 * 60 * 60 * 24
  const res = {
    startTime: new Date(new Date().setHours(0, 0, 0, 0)),
    endTime: new Date(new Date().setHours(23, 59, 59, 0))
  }
  if (type === 'week' || type === 'month' || type === 'threeMonth' || type === 'halfYear') {
    res.startTime = new Date(Number(res.startTime))
    res.endTime = new Date(Number(res.endTime))
  }

  switch (type) {
    // case 'day':
    //   res.startTime.setDate(res.endTime.getDate() - 6);
    //   break;
    case 'week':
      res.startTime.setDate(res.endTime.getDate() - 6)
      break
    case 'month':
      res.startTime.setMonth(res.endTime.getMonth() - 1)
      break
    case 'threeMonth':
      res.startTime.setMonth(res.endTime.getMonth() - 3)
      break
    case 'halfYear':
      res.startTime.setMonth(res.endTime.getMonth() - 6)
      break
    case 'all':
      res.startTime.setMonth(res.endTime.getMonth() - 12)
      break
  }

  if (format === false) {
    return res
  }
  res.startTime = getLocalTime(res.startTime, format)
  res.endTime = getLocalTime(res.endTime, format)
  return res
}

function add0(m) {
  return m < 10 ? '0' + m : m
}
// 格式化时间
export function formatDate(shijianchuo: string) {
  // shijianchuo是整数，否则要parseInt转换
  const time = new Date(shijianchuo)
  const y = time.getFullYear()
  const m = time.getMonth() + 1
  const d = time.getDate()
  const h = time.getHours()
  const mm = time.getMinutes()
  const s = time.getSeconds()
  return y + '/' + add0(m) + '/' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s)
}

// 数字千分位格式化
export function thousandsNumber(num: number, digits = 2) {
  if (isNaN(Number(num))) {
    return `${num || '-'}`
  }
  const strNumber = toFixed(num, digits)
  let n = Math.abs(parseFloat(strNumber)) // 取绝对值格式化
  let r = ''
  let temp
  let mod
  do {
    mod = n % 1000
    n = n / 1000
    temp = ~~mod
    r = (n >= 1 ? `${temp}`.padStart(3, '0') : temp) + (r ? ',' + r : '')
  } while (n >= 1)
  const index = strNumber.indexOf('.')
  // 拼接小数部分
  if (index >= 0) {
    r += strNumber.substring(index)
  }
  // 负数处理
  if (num < 0) {
    r = '-' + r
  }
  return r
}

/**
 * 限制输入框输入小数点位数
 * @param text
 * @param precision
 * @returns
 */
export function regInput(text: string, precision: number) {
  if (precision === 0) return text
  let newText = text
  if (precision === 1) {
    newText = newText.replace(/^(\-)*(\d+)\.(\d).*$/, '$1$2.$3') // 只能输1两个小数
  } else if (precision === 2) {
    newText = newText.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3') // 只能输入2个小数
  } else if (precision === 3) {
    newText = newText.replace(/^(\-)*(\d+)\.(\d\d\d).*$/, '$1$2.$3') // 只能输入3个小数
  } else if (precision === 4) {
    newText = newText.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/, '$1$2.$3') // 只能输入4个小数
  } else if (precision === 5) {
    newText = newText.replace(/^(\-)*(\d+)\.(\d\d\d\d\d).*$/, '$1$2.$3') // 只能输入5个小数
  } else if (precision === 6) {
    newText = newText.replace(/^(\-)*(\d+)\.(\d\d\d\d\d\d).*$/, '$1$2.$3') // 只能输入6个小数
  } else if (precision === 7) {
    newText = newText.replace(/^(\-)*(\d+)\.(\d\d\d\d\d\d\d).*$/, '$1$2.$3') // 只能输入7个小数
  } else if (precision === 8) {
    newText = newText.replace(/^(\-)*(\d+)\.(\d\d\d\d\d\d\d\d).*$/, '$1$2.$3') // 只能输入8个小数
  }
  return newText
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

/** 使用https请求K线图数据的加密方法 */
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

export function hideEmail(email: string) {
  const regex = /^(.{2})(.*)(@.*)$/
  return email.replace(regex, (_, prefix, hidden, domain) => `${prefix}${'*'.repeat(4)}${domain}`)
}

export function groupByKey(data: any, groupKey: string) {
  const groupedData = data.reduce((result, currentItem) => {
    const value = currentItem[groupKey]
    if (!result[value]) {
      result[value] = []
    }
    result[value].push(currentItem)
    return result
  }, {})

  return Object.values(groupedData)
}

export function adjust_Event(e) {
  // try {
  //   setTimeout(() => {
  //     const event = new AdjustEvent(e)
  //     Adjust.trackEvent(event)
  //   }, 500)
  // } catch (e) {}
}

/**
 * 分钟转小时时间段
 * @param min 分钟
 * @returns
 */
export const formatMin2Time = (min: any) => {
  let time = (min / 60).toFixed(2)
  if (parseInt(time) === parseFloat(time)) {
    // console.log('整数')
    if (Number(time) < 10) {
      return '0' + parseInt(time).toFixed(0) + ':' + '00'
    } else {
      return parseInt(time).toFixed(0) + ':' + '00'
    }
  } else {
    // @ts-ignore
    let c = time.substring(time.indexOf('.') + 1, time.length) * 0.01
    let d = parseInt(time).toFixed(0)
    // @ts-ignore
    if (d < 10) {
      // @ts-ignore
      return '0' + d + ':' + ((c * 60).toFixed(0) < 10 ? '0' + (c * 60).toFixed(0) : (c * 60).toFixed(0))
    } else {
      // @ts-ignore
      return d + ':' + ((c * 60).toFixed(0) < 10 ? '0' + (c * 60).toFixed(0) : (c * 60).toFixed(0))
    }
  }
}

/**
 * 将时间字符串转换为分钟
 * @param time 输入 01:00 输出 60 输入 24:00 输出 1440
 * @returns
 */
export const formatTime2Min = (time: string) => {
  let [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * 判断值是否为真实值（类似 JavaScript 中的 !! 操作符）
 * 允许值为 0，空字符串，null，undefined 或者 false
 * @param {*} value - 要检查的值
 * @returns {boolean} - 如果值为真实值，则返回 true，否则返回 false
 */
export const isTruthy = (value: any) => {
  return !!value || (value !== '' && Number(value) === 0)
}

/**
 * 转化json中的字符串对象为Json格式
 * @param info 对象
 * @param fields 字符串数组
 * @returns
 */
export const parseJsonFields = (info: Record<string, any>, fields: string[]) => {
  if (!info) return

  fields.forEach((field) => {
    if (info[field]) {
      try {
        info[field] = JSON.parse(info[field])
      } catch (e) {
        console.error(`Failed to parse JSON for field: ${field}`, e)
      }
    }
  })
  return info
}

export const waitTime = (time = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}

/**
 * 格式化小数位
 * @param val
 * @param num 小数位
 * @param isTruncateDecimal 是否截取小数位
 * @returns
 */
export function toFixed(val: any, num = 2, isTruncateDecimal = true) {
  let value = val || 0
  let precision = num
  // 防止精度过大
  if (precision >= 10) {
    precision = 10
  }
  value = parseFloat(value)
  if (isNaN(value)) {
    value = 0
  }
  // 截取小数点展示
  if (isTruncateDecimal) {
    return truncateDecimal(value, precision)
  }
  // 四舍五入
  return value.toFixed(precision)
}

/**
 * 保留指定小数位，做截取
 * @param number
 * @param digits
 * @returns
 */
export function truncateDecimal(number: any, digits?: number) {
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
 * 格式化字符串 178****12
 * @param str 字符串
 * @param num 左右字符保留多少位展示
 * @returns
 */
export function hiddenCenterPartStr(str: any, num = 6) {
  if (!str) return ''
  const reg = new RegExp(`^(.{${num}}).*(.{${num}})$`)
  return `${str}`.replace(reg, '$1...$2')
}

/**
 * 格式化字符串 17888888...
 * @param str 字符串
 * @param num 字符串左邊保留多少位展示
 * @returns
 */
export function formatStringWithEllipsis(str: string, num = 6) {
  if (!str) return ''
  if (str.length <= num) return str
  const start = str.slice(0, num)
  return `${start}...`
}

// 格式化银行卡号 为1111-2222-3333-444
export function formatBankCardCode(str: string, digits = 4) {
  let result = ''
  for (let i = 0; i < str.length; i++) {
    result += str[i]
    if ((i + 1) % digits === 0 && i !== str.length - 1) {
      result += '-'
    }
  }
  return result
}

/**
 * 判断是否是图片
 * @param filePath
 * @returns
 */
export function isImageFile(filePath: any) {
  // 定义正则表达式，用于匹配常见的图片文件扩展名
  const imagePattern = /\.(jpeg|jpg|gif|png|bmp|svg|webp|tiff|ico)$/i
  // 使用正则表达式进行匹配
  return imagePattern.test(filePath)
}

/**
 * 对象数组去重
 * @param arr 数组
 * @param key 对象的key唯一
 * @returns
 */
export function uniqueObjectArray(arr: any, key: string) {
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

// 每n个分组
export const groupBy = (arr: any[], n: number) => {
  let newList: any = []
  for (let i = 0; i < arr.length; i += n) {
    newList.push(arr.slice(i, i + n))
  }
  return newList
}

export function formatStrLen(str: string) {
  return `${str}`.replace(/^(.{6}).*(.{6})$/, '$1****$2')
}

/**
 * 获取指定数字的精度位数
 * @param value
 * @returns
 */
export const getPrecisionByNumber = (value: any) => {
  return value ? String(value).split('.')?.[1]?.length || 0 : 0
}

/**
 * 格式化数字
 * @param value
 * @returns
 */
type IOpt = {
  /** 是否截取小数位 */
  isTruncateDecimal?: boolean
  /** 小数点精度 */
  precision?: number
  /** 是否返回原始值 */
  raw?: boolean
}
export const formatNum = (value: any, opts?: IOpt) => {
  const { isTruncateDecimal = true, raw = false } = opts || {}
  // 不是一个数字
  if (isNaN(value) || !Number(value)) {
    return FIXED_ZERO_VALUE
  }
  const val = value || '0.00'
  let precision = opts?.precision || String(value).split('.')?.[1]?.length || 2
  // 防止精度过大
  if (precision >= 10) {
    precision = 10
  }
  const truncateValue = isTruncateDecimal ? truncateDecimal(val, precision) : val // 截取小数点，不四舍五入

  if (raw) {
    return currency(truncateValue, { symbol: '', precision, ...opts }).value
  }

  return currency(truncateValue, { symbol: '', precision, ...opts }).format()
}

/**
 * 传入数值，判断如果是数字返回负数，如果是 0 返回 0，否则返回空值
 * @param value
 * @returns
 */
export const toNegativeOrEmpty = (value: any) => {
  const val = Number(value)
  if (Number.isNaN(val)) return ''
  return val === 0 ? '0' : -Math.abs(val).toString()
}

// 判斷數字小數點前後最大位數
export const getMaxPrecisionByNumber = (value: any) => {
  return value ? Math.max(String(value).split('.')?.[0]?.length || 0, String(value).split('.')?.[1]?.length || 0) : 0
}

// 复制文本到剪贴板
export const copyText = (text: any) => {
  if (text) {
    Clipboard.setString(text)
    message.info(t`Copy Success`)
  }
}
