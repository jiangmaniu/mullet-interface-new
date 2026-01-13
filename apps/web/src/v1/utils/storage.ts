import lodashGet from 'lodash-es/get'
import lodashSet from 'lodash-es/set'

import {
  KEY_ACCOUNT_PASSWORD,
  KEY_ACTIVE_SYMBOL_NAME,
  KEY_CLUSTER,
  KEY_DEVICE_TYPE,
  KEY_FAVORITE,
  KEY_HISTORY_SEARCH,
  KEY_LOCATION_INFO,
  KEY_NEXT_REFRESH_TOKEN_TIME,
  KEY_ORDER_CONFIRM_CHECKED,
  KEY_PARAMS,
  KEY_PLATFORM_CONFIG,
  KEY_POSITION_CONFIRM_CHECKED,
  KEY_PWD,
  KEY_QUICK_PLACE_ORDER_CHECKED,
  KEY_REGISTER_CODE,
  KEY_SHOW_PWD_ADD_MODAL,
  KEY_SYMBOL_NAME_LIST,
  KEY_THEME,
  KEY_TOKEN,
  KEY_TRADE_PAGE_SHOW_TIME,
  KEY_TRADE_THEME,
  KEY_TRADINGVIEW_RESOLUTION,
  KEY_USER_CONF_INFO,
  KEY_USER_INFO,
} from '@/v1/constants'

import { valuetype } from './type'

// ============================================================

// 本地存储-账号密码
export const STORAGE_GET_ACCOUNT_PASSWORD = genStorageGet(KEY_ACCOUNT_PASSWORD)
export const STORAGE_SET_ACCOUNT_PASSWORD = genStorageSet(KEY_ACCOUNT_PASSWORD)
export const STORAGE_REMOVE_ACCOUNT_PASSWORD = storageRemove(KEY_ACCOUNT_PASSWORD)

// 本地存储-令牌
export const STORAGE_GET_TOKEN = genStorageGet(KEY_TOKEN)
export const STORAGE_SET_TOKEN = genStorageSet(KEY_TOKEN)
export const STORAGE_REMOVE_TOKEN = storageRemove(KEY_TOKEN)

// 本地存储-刷新token时间
export const STORAGE_GET_NEXT_REFRESH_TOKEN_TIME = genStorageGet(KEY_NEXT_REFRESH_TOKEN_TIME)
export const STORAGE_SET_NEXT_REFRESH_TOKEN_TIME = genStorageSet(KEY_NEXT_REFRESH_TOKEN_TIME)

// 本地存储-用户信息
export const STORAGE_GET_USER_INFO = genStorageGet(KEY_USER_INFO)
export const STORAGE_SET_USER_INFO = genStorageSet(KEY_USER_INFO)
export const STORAGE_REMOVE_USER_INFO = storageRemove(KEY_USER_INFO)

// 本地存储-密码
export const STORAGE_GET_PWD = genStorageGet(KEY_PWD)
export const STORAGE_SET_PWD = genStorageSet(KEY_PWD)

// 本地存储-查询参数
export const STORAGE_GET_PARAMS = genStorageGet(KEY_PARAMS)
export const STORAGE_SET_PARAMS = genStorageSet(KEY_PARAMS)

// 定位信息
export const STORAGE_GET_LOCATION = genStorageGet(KEY_LOCATION_INFO)
export const STORAGE_SET_LOCATION = genStorageSet(KEY_LOCATION_INFO)

// 本地存储-打开的品种名称列表
export const STORAGE_GET_SYMBOL_NAME_LIST = genStorageGet(KEY_SYMBOL_NAME_LIST)
export const STORAGE_SET_SYMBOL_NAME_LIST = genStorageSet(KEY_SYMBOL_NAME_LIST)

// 本地存储-激活的品种名称
export const STORAGE_GET_ACTIVE_SYMBOL_NAME = genStorageGet(KEY_ACTIVE_SYMBOL_NAME)
export const STORAGE_SET_ACTIVE_SYMBOL_NAME = genStorageSet(KEY_ACTIVE_SYMBOL_NAME)

// 本地存储-自选列表
export const STORAGE_GET_FAVORITE = genStorageGet(KEY_FAVORITE)
export const STORAGE_SET_FAVORITE = genStorageSet(KEY_FAVORITE)
export const STORAGE_REMOVE_FAVORITE = storageRemove(KEY_FAVORITE)

// 本地存储-按当前交易账号储存 自选、激活的品种名称、打开的品种名称列表
export const STORAGE_GET_CONF_INFO = genStorageGet(KEY_USER_CONF_INFO)
export const STORAGE_SET_CONF_INFO = genStorageSet(KEY_USER_CONF_INFO)
export const STORAGE_REMOVE_CONF_INFO = storageRemove(KEY_USER_CONF_INFO)

// 进入交易页面时间，用来刷新k线，避免长时间不进入行情断开
export const STORAGE_GET_TRADE_PAGE_SHOW_TIME = genStorageGet(KEY_TRADE_PAGE_SHOW_TIME)
export const STORAGE_SET_TRADE_PAGE_SHOW_TIME = genStorageSet(KEY_TRADE_PAGE_SHOW_TIME)
export const STORAGE_REMOVE_TRADE_PAGE_SHOW_TIME = storageRemove(KEY_TRADE_PAGE_SHOW_TIME)

// 主题色
export const STORAGE_GET_THEME = genStorageGet(KEY_THEME)
export const STORAGE_SET_THEME = genStorageSet(KEY_THEME)

// 交易页面主题色
export const STORAGE_GET_TRADE_THEME = genStorageGet(KEY_TRADE_THEME)
export const STORAGE_SET_TRADE_THEME = genStorageSet(KEY_TRADE_THEME)

// 快速下单状态状态标记
export const STORAGE_GET_QUICK_PLACE_ORDER_CHECKED = genStorageGet(KEY_QUICK_PLACE_ORDER_CHECKED)
export const STORAGE_SET_QUICK_PLACE_ORDER_CHECKED = genStorageSet(KEY_QUICK_PLACE_ORDER_CHECKED)

// 订单二次确认弹窗
export const STORAGE_GET_ORDER_CONFIRM_CHECKED = genStorageGet(KEY_ORDER_CONFIRM_CHECKED)
export const STORAGE_SET_ORDER_CONFIRM_CHECKED = genStorageSet(KEY_ORDER_CONFIRM_CHECKED)

// 平仓二次确认弹窗
export const STORAGE_GET_POSITION_CONFIRM_CHECKED = genStorageGet(KEY_POSITION_CONFIRM_CHECKED)
export const STORAGE_SET_POSITION_CONFIRM_CHECKED = genStorageSet(KEY_POSITION_CONFIRM_CHECKED)

// 平仓二次确认弹窗
export const STORAGE_GET_SHOW_PWA_ADD_MODAL = genStorageGet(KEY_SHOW_PWD_ADD_MODAL)
export const STORAGE_SET_SHOW_PWA_ADD_MODAL = genStorageSet(KEY_SHOW_PWD_ADD_MODAL)

// 历史搜索记录
export const STORAGE_GET_HISTORY_SEARCH = genStorageGet(KEY_HISTORY_SEARCH)
export const STORAGE_SET_HISTORY_SEARCH = genStorageSet(KEY_HISTORY_SEARCH)
export const STORAGE_REMOVE_HISTORY_SEARCH = storageRemove(KEY_HISTORY_SEARCH)

// 存储记录的设备类型
export const STORAGE_GET_DEVICE_TYPE = genStorageGet(KEY_DEVICE_TYPE)
export const STORAGE_SET_DEVICE_TYPE = genStorageSet(KEY_DEVICE_TYPE)
export const STORAGE_REMOVE_DEVICE_TYPE = storageRemove(KEY_DEVICE_TYPE)

// 平台配置
export const STORAGE_GET_PLATFORM_CONFIG = genStorageGet(KEY_PLATFORM_CONFIG)
export const STORAGE_SET_PLATFORM_CONFIG = genStorageSet(KEY_PLATFORM_CONFIG)

// tradingview当前选择的分辨率 1/5/15..
export const STORAGE_GET_TRADINGVIEW_RESOLUTION = genStorageGet(KEY_TRADINGVIEW_RESOLUTION)
export const STORAGE_SET_TRADINGVIEW_RESOLUTION = genStorageSet(KEY_TRADINGVIEW_RESOLUTION)
export const STORAGE_REMOVE_TRADINGVIEW_RESOLUTION = storageRemove(KEY_TRADINGVIEW_RESOLUTION)

// 注册码
export const STORAGE_GET_REGISTER_CODE = genStorageGet(KEY_REGISTER_CODE)
export const STORAGE_SET_REGISTER_CODE = genStorageSet(KEY_REGISTER_CODE)
export const STORAGE_REMOVE_REGISTER_CODE = storageRemove(KEY_REGISTER_CODE)

// 当前选择的Cluster节点
export const STORAGE_GET_CLUSTER = genStorageGet(KEY_CLUSTER)
export const STORAGE_SET_CLUSTER = genStorageSet(KEY_CLUSTER)
export const STORAGE_REMOVE_CLUSTER = storageRemove(KEY_CLUSTER)

// =================================================

// 设置本地用户信息
export const setLocalUserInfo = (userInfo: User.UserInfo) => {
  // 保存token到本地
  STORAGE_SET_TOKEN(userInfo?.access_token)
  // 保存登录的用户信息到本地
  STORAGE_SET_USER_INFO(userInfo)
  // 设置下次刷新token的时间
  STORAGE_SET_NEXT_REFRESH_TOKEN_TIME(Date.now() + Number(userInfo?.expires_in || 0) * 1000)
}

// ============================================================
// 工厂函数-获取
export function genStorageGet(key: string) {
  return (path?: string) => {
    // 获取存储
    const storage = storageGetting(key)
    // 返回指定路径的值
    if (path) {
      return lodashGet(storage, path)
    }
    // 返回全部
    return storage
  }
}

// 工厂函数-设置
export function genStorageSet(key: string) {
  return (value: any, path?: string) => {
    // 不穿参数，表示删除
    if (value === undefined && path === undefined) {
      storageDelete(key)
      return
    }

    // 指定了路径，更新指定路径的值，返回完整存储
    if (path) {
      // 设置指定路径的值
      let storage = genStorageGet(key)()

      // 类型判断
      if (valuetype(path, 'NumberString')) {
        // 如果路径是纯数字字符串，保证是数组
        if (valuetype(storage, 'Array') === false) {
          storage = []
        }
      } else if (valuetype(storage, 'Object') === false) {
        // 如果路径是非数字字符串，保证是数组
        storage = {}
      }

      // 更新对象
      lodashSet(storage, path, value)
      // 更新存储
      storageSetting(key, storage)
      // 返回完整存储
      return storage
    }

    // 未指定路径，全部替换
    storageSetting(key, value)

    // 返回完整存储
    return value
  }
}
// ============================================================

// ============================================================
/**
 * 获取本地存储
 *
 * 仅支持存入数字、字符串、布尔值、对象、数组
 * 由于取出时使用了 JSON.parse，当存入的字符串是特殊值，如数字、布尔值，则取出的时候会变成数字、布尔值，需在使用时进行处理
 * 所以尽量存储数组和对象
 */

// 本地存储-删除
function storageDelete(key: string) {
  localStorage.removeItem(key)
}

// 本地存储-获取
function storageGetting(key: string) {
  const storage: any = localStorage.getItem(key)

  let result = storage

  try {
    result = JSON.parse(storage)
  } catch (error) {
    result = storage
  }

  return result
}

// 本地存储-设置
function storageSetting(key: string, value: any) {
  let result = value

  if (
    valuetype(value, 'Object') ||
    valuetype(value, 'Array') ||
    valuetype(value, 'number') ||
    valuetype(value, 'boolean')
  ) {
    try {
      result = JSON.stringify(value)
    } catch (error) {
      result = value
    }
  }

  if (valuetype(result, 'string')) {
    localStorage.setItem(key, result)
  } else {
    console.log({
      msg: '本地存储失败',
      result: result,
    })
  }
}

export function storageRemove(key: string) {
  return () => {
    try {
      localStorage.removeItem(key)
    } catch (e) {}
  }
}
// ============================================================

// ============================================================
// 工厂函数-获取
function genSessionStorageGet(key: string) {
  return (path?: string) => {
    // 获取存储
    const storage = storageSessionGetting(key)
    // 返回指定路径的值
    if (path) {
      return lodashGet(storage, path)
    }
    // 返回全部
    return storage
  }
}

// 工厂函数-设置
function genSessionStorageSet(key: string) {
  return (value: any, path?: string) => {
    // 不穿参数，表示删除
    if (value === undefined && path === undefined) {
      storageSessionDelete(key)
      return
    }

    // 指定了路径，更新指定路径的值，返回完整存储
    if (path) {
      // 设置指定路径的值
      let storage = genSessionStorageGet(key)()

      // 类型判断
      if (valuetype(path, 'NumberString')) {
        // 如果路径是纯数字字符串，保证是数组
        if (valuetype(storage, 'Array') === false) {
          storage = []
        }
      } else if (valuetype(storage, 'Object') === false) {
        // 如果路径是非数字字符串，保证是数组
        storage = {}
      }

      // 更新对象
      lodashSet(storage, path, value)
      // 更新存储
      storageSessionSetting(key, storage)
      // 返回完整存储
      return storage
    }

    // 未指定路径，全部替换
    storageSessionSetting(key, value)

    // 返回完整存储
    return value
  }
}
// ============================================================

// ============================================================
/**
 * 获取本地存储
 *
 * 仅支持存入数字、字符串、布尔值、对象、数组
 * 由于取出时使用了 JSON.parse，当存入的字符串是特殊值，如数字、布尔值，则取出的时候会变成数字、布尔值，需在使用时进行处理
 * 所以尽量存储数组和对象
 */

// 本地存储-删除
function storageSessionDelete(key: string) {
  sessionStorage.removeItem(key)
}

// 本地存储-获取
function storageSessionGetting(key: string) {
  const storage: any = sessionStorage.getItem(key)

  let result = storage

  try {
    result = JSON.parse(storage)
  } catch (error) {
    result = storage
  }

  return result
}

// 本地存储-设置
function storageSessionSetting(key: string, value: any) {
  let result = value

  if (
    valuetype(value, 'Object') ||
    valuetype(value, 'Array') ||
    valuetype(value, 'number') ||
    valuetype(value, 'boolean')
  ) {
    try {
      result = JSON.stringify(value)
    } catch (error) {
      result = value
    }
  }

  if (valuetype(result, 'string')) {
    sessionStorage.setItem(key, result)
  } else {
    console.log({
      msg: '本地存储失败',
      result: result,
    })
  }
}

function storageSessionRemove(key: string) {
  return () => {
    try {
      sessionStorage.removeItem(key)
    } catch (e) {}
  }
}
