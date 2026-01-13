// import { getIntl } from '@umijs/max'
import { isAndroid, isIOS } from 'react-device-detect'
import currency from 'currency.js'
import { cloneDeep, omit } from 'lodash-es'
import moment from 'moment'

import { DATE } from '@/v1/constants/date'
import { toast } from '@mullet/ui/toast'

export function isMobileDevice(): boolean {
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  return mobileRegex.test(navigator.userAgent)
}

// 获取uid
export function getUid() {
  if (typeof window !== 'undefined') {
    // @ts-ignore
    const cryptoObj = window.crypto || window.msCrypto
    if (cryptoObj && typeof cryptoObj.getRandomValues !== 'undefined') {
      // @ts-ignore
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        // @ts-ignore
        (c ^ (cryptoObj.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16),
      )
    } else {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (Math.random() * 16) | 0,
          v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    }
  }
}

export const regPassword = /(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[\W_]).{8,16}$/gi // 至少包含一个数字、至少包含一个大写字母、至少包含一个小写字母、至少包含一个特殊字符或下划线

export const regEmail =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

export const regMobile = /^\d+(.\d{1,2})?$/

export function isMobile(str: any) {
  return regMobile.test(str)
}
export function isPassword(str: string) {
  return regPassword.test(str)
}
export function isEmail(str: string) {
  return regEmail.test(str)
}

// 格式化手机号码 178****12
export function formatMobile(mobile: string | undefined) {
  if (!mobile) return
  const mobileReg = /(\d{3})\d*(\d{2})/
  return `${mobile}`.replace(mobileReg, '$1****$2')
}

/**
 *隐藏部分邮箱信息
 * @param email
 * @returns
 */
export function hideEmail(email = '') {
  const regex = /^(.{2})(.*)(@.*)$/
  return email.replace(regex, (_, prefix, hidden, domain) => `${prefix}${'*'.repeat(4)}${domain}`)
}

// 格式化邮箱
export const formatEmail = (email: string | undefined) => {
  if (!email) return
  if (email.indexOf('@') > 0) {
    let newEmail,
      str = email.split('@'),
      _s = ''
    // @ts-ignore
    if (str[0].length > 4) {
      // @ts-ignore
      _s = str[0].substr(0, 4)
      // @ts-ignore
      for (let i = 0; i < str[0].length - 4; i++) {
        _s += '*'
      }
    } else {
      // @ts-ignore
      _s = str[0].substr(0, 1)
      // @ts-ignore
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
    newText = newText.replace(/^(\-)*(\d+)\.(\d).*$/, '$1$2.$3') //只能输1两个小数
  } else if (precision === 2) {
    newText = newText.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3') //只能输入2个小数
  } else if (precision === 3) {
    newText = newText.replace(/^(\-)*(\d+)\.(\d\d\d).*$/, '$1$2.$3') //只能输入3个小数
  } else if (precision === 4) {
    newText = newText.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/, '$1$2.$3') //只能输入4个小数
  } else if (precision === 5) {
    newText = newText.replace(/^(\-)*(\d+)\.(\d\d\d\d\d).*$/, '$1$2.$3') //只能输入5个小数
  } else if (precision === 6) {
    newText = newText.replace(/^(\-)*(\d+)\.(\d\d\d\d\d\d).*$/, '$1$2.$3') //只能输入6个小数
  } else if (precision === 7) {
    newText = newText.replace(/^(\-)*(\d+)\.(\d\d\d\d\d\d\d).*$/, '$1$2.$3') //只能输入7个小数
  } else if (precision === 8) {
    newText = newText.replace(/^(\-)*(\d+)\.(\d\d\d\d\d\d\d\d).*$/, '$1$2.$3') //只能输入8个小数
  }
  return newText
}

/**
 * 格式化是
 * @param time 时间戳、字符串时间
 * @param formatType
 * @returns
 */
export const formatTime = (time: any, formatType = 'YYYY-MM-DD HH:mm:ss') => {
  if (!time) return '--'
  return moment(time).format(formatType)
}

export const formatStartTime = (value: any) => formatTime(value, 'YYYY-MM-DD') + ' 00:00:00'
export const formatEndTime = (value: any) => formatTime(value, 'YYYY-MM-DD') + ' 23:59:59'

/** 獲取颜色樣式名 */
export const getColorClass = (value: number) => {
  // 不是一个数字
  if (isNaN(value) || !Number(value)) {
    return 'text-red'
  }
  return value >= 0 ? 'text-green' : 'text-red'
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
    return '0.00'
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
 * 第一个首字母大写
 * @param str 字符串
 * @returns
 */
export const upperFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const START_TIME = `${DATE.DATE_3_MONTHS_BEFORE} 00:00:00`
const END_TIME = `${DATE.DATE_TODAY} 23:59:59`

/**获取三个月前的日期 */
export const get3MonBeforeRange = (isFormat?: boolean) => {
  return isFormat ? [DATE.DATE_3_MONTHS_BEFORE, DATE.DATE_TODAY] : [moment(START_TIME), moment(END_TIME)]
}

export const getDefaultDateRange = (fileds: string[]) => {
  // @ts-ignore
  return { [fileds[0]]: START_TIME, [fileds[1]]: END_TIME }
}

/**
 *格式化代理人参数
 * @param params 请求参数
 * @param fileds 开始和结束时间字段名称
 * @param hiddenPageSizeOrPageNo 是否隐藏页码和分页大小
 * @returns
 */
export const formatAgentParams = (
  params: any,
  fileds?: any[],
  hiddenPageSizeOrPageNo?: boolean,
): Record<string, any> => {
  // 避免污染
  const values = cloneDeep(params)

  // 如果没有传日期，默认三个月的，避免在页面重复写默认日期
  // 没有找到一个有效的日期
  if (!Object.values(values).some((v: any) => moment(v, 'YYYY-MM-DD', true).isValid()) && fileds?.length) {
    values[fileds[0]] = START_TIME
    values[fileds[1]] = END_TIME
  }

  if (values.current) {
    values.pageNo = values.current - 1 // 从0开始
  } else {
    values.pageNo = 0
    values.pageSize = 10
  }

  // 导出、查询统计信息不需要分页
  if (hiddenPageSizeOrPageNo) {
    delete values.pageNo
    delete values.pageSize
  }

  // 兼容后台的多套日期参数格式化
  if (values.beginCreateTime) {
    values.beginCreateTime = formatStartTime(values.beginCreateTime)
    values.endCreateTime = formatEndTime(values.endCreateTime)
  }
  if (values.beginCloseTime) {
    values.beginCloseTime = formatStartTime(values.beginCloseTime)
    values.endCloseTime = formatEndTime(values.endCloseTime)
  }
  if (values.beginTime) {
    values.beginTime = formatStartTime(values.beginTime)
    values.endTime = formatEndTime(values.endTime)
  }
  if (values.StartTime) {
    values.StartTime = formatStartTime(values.StartTime)
    values.EndTime = formatEndTime(values.EndTime)
  }
  if (values.startDate) {
    values.startDate = formatStartTime(values.startDate)
    values.endDate = formatEndTime(values.endDate)
  }

  // 选择日期后，格式化pc搜索表单参数，导出需要传日期
  if (fileds?.length && values.dates) {
    values[fileds[0]] = formatStartTime(values.dates[0])
    values[fileds[1]] = formatEndTime(values.dates[1])
    delete values.dates
  }

  return omit(values, ['current', 'dates'])
}

/**
 * 格式化导出参数-非代理人接口
 * @param params
 */
export const formatExportParams = (params: any, fileds?: any[]): Record<string, any> => {
  // 处理pc导出参数
  if (params.dates && fileds?.length) {
    params[fileds[0]] = formatStartTime(params.dates[0])
    params[fileds[1]] = formatEndTime(params.dates[1])
    delete params.dates
  }
  return omit(params, ['current', 'startTime', 'endTime', 'dates'])
}

// 每n个分组
export const groupBy = (arr: any[], n: number) => {
  let newList = []
  for (let i = 0; i < arr.length; i += n) {
    newList.push(arr.slice(i, i + n))
  }
  return newList
}

export function formatStrLen(str: string) {
  return `${str}`.replace(/^(.{6}).*(.{6})$/, '$1****$2')
}

/**
 * 书籍生成指定位数的整数
 * @param digits
 * @returns
 */
export function generateRandomNumber(digits: number) {
  if (digits <= 0) {
    console.error('Digits should be greater than 0')
    return null
  }

  const min = 10 ** (digits - 1)
  const max = 10 ** digits - 1

  return Math.floor(Math.random() * (max - min + 1)) + min
}
// 数组随机排序
export function shuffleArray(arr: any[]) {
  return arr.sort(function () {
    return Math.random() - 0.5
  })
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
  // @ts-ignore
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

// 复制功能
export const copyContent = (cotVal: any, title = '复制成功') => {
  const pEle = document.createElement('p')
  pEle.innerHTML = cotVal || ''
  document.body.appendChild(pEle)

  const range = document.createRange() // 创造range
  window.getSelection()?.removeAllRanges() //清除页面中已有的selection
  range.selectNode(pEle) // 选中需要复制的节点
  window.getSelection()?.addRange(range) // 执行选中元素

  const copyStatus = document.execCommand('Copy') // 执行copy操作
  toast.info(copyStatus ? title : 'copy failed')
  document.body.removeChild(pEle)
  window.getSelection()?.removeAllRanges() //清除页面中已有的selection
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
 * 保留指定小数位，不做截取
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

//判断是否为PC
export function isPC() {
  const userAgentInfo = navigator.userAgent
  const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod']
  let flag = true
  for (let v = 0; v < Agents.length; v++) {
    // @ts-ignore
    if (userAgentInfo?.indexOf(Agents[v]) > 0) {
      flag = false
      break
    }
  }
  return flag
}

export function isPCByWidth() {
  if (document.documentElement.clientWidth >= 1200) {
    return true
  }
  return false
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
 * 传入数值，判断如果是数字返回负数，如果是 0 返回 0，否则返回空值
 * @param value
 * @returns
 */
export const toNegativeOrEmpty = (value: any) => {
  const val = Number(value)
  if (Number.isNaN(val)) return ''
  return val === 0 ? '0' : -Math.abs(val).toString()
}

/**
 * 复制到剪贴板
 * @param text
 */
export const copyToClipboard = (text: string) => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  document.body.appendChild(textarea)
  textarea.select()
  try {
    document.execCommand('copy')
    toast.success('复制成功')
  } catch (err) {
    toast.error('操作失败')
  }
  document.body.removeChild(textarea)
}

/**
 * 读取剪贴板内容，并在读取后清空剪贴板
 * @param callback 读取成功后的回调函数
 */
export const readClipboard = (callback: (text: string) => void) => {
  // 检查是否在 React Native WebView 环境中
  // @ts-ignore
  if (typeof window !== 'undefined' && window.ReactNativeWebView) {
    // 尝试使用 React Native 的剪贴板 API
    try {
      // 发送消息给 React Native 请求剪贴板内容
      // @ts-ignore
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READ_CLIPBOARD' }))

      // 监听来自 React Native 的消息
      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)
          if (data.action === 'CLIPBOARD_CONTENT') {
            console.log('读取剪贴板内容', data)
            const content = data.content || ''
            callback(content)
            // 清空剪贴板
            // 移除事件监听器
            if (isIOS) {
              window.removeEventListener('message', handleMessage)
            } else if (isAndroid) {
              // @ts-ignore
              document.removeEventListener('message', handleMessage)
            } else {
              window.removeEventListener('message', handleMessage)
            }
          }
        } catch (e) {
          console.error('Failed to parse clipboard data', e)
        }
      }

      if (isIOS) {
        window.addEventListener('message', handleMessage)
      } else if (isAndroid) {
        // @ts-ignore
        document.addEventListener('message', handleMessage)
      }
    } catch (error) {
      console.error('Failed to read clipboard in React Native WebView', error)
    }
  } else {
    // 在普通 Web 环境中使用 navigator.clipboard API
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard
        .readText()
        .then((text) => {
          callback(text)
          // 读取后清空剪贴板
          navigator.clipboard.writeText('').catch((err) => {
            console.error('Failed to clear clipboard contents: ', err)
          })
        })
        .catch((err) => {
          console.error('Failed to read clipboard contents: ', err)
        })
    } else {
      console.warn('Clipboard API not available')
    }
  }
}

export function ellipsify(str = '', len = 4, delimiter = '..') {
  const strLen = str.length
  const limit = len * 2 + delimiter.length

  return strLen >= limit ? str.substring(0, len) + delimiter + str.substring(strLen - len, strLen) : str
}
