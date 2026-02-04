import AsyncStorage from '@react-native-async-storage/async-storage'
import lodashGet from 'lodash-es/get'
import lodashSet from 'lodash-es/set'

import {
  KEY_ACCOUNT_PASSWORD,
  KEY_GUIDE,
  KEY_LNG,
  KEY_THEME,
  KEY_TOKEN,
  KEY_TRADER_SERVER,
  KEY_USER_CONF_INFO,
  KEY_USER_INFO,
  KEY_QUICK_PLACE_ORDER_CHECKED,
  KEY_ORDER_CONFIRM_CHECKED,
  KEY_POSITION_CONFIRM_CHECKED,
  KEY_DIRECTION,
  KEY_SELECTED_TAB,
  KEY_APP_VERSION,
  KEY_HISTORY_SEARCH,
  KEY_ENV,
  KEY_TRADINGVIEW_RELOAD_TIME,
  KEY_AUTHORIZED,
  KEY_LOCATION_INFO,
  KEY_ANDROID_PRIVACY_MODAL
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

// 本地存储-Webview授权状态
export const STORAGE_GET_AUTHORIZED = genStorageGet(KEY_AUTHORIZED)
export const STORAGE_SET_AUTHORIZED = genStorageSet(KEY_AUTHORIZED)
export const STORAGE_REMOVE_AUTHORIZED = storageRemove(KEY_AUTHORIZED)

// 本地存储-用户信息
export const STORAGE_GET_USER_INFO = genStorageGet(KEY_USER_INFO)
export const STORAGE_SET_USER_INFO = genStorageSet(KEY_USER_INFO)
export const STORAGE_REMOVE_USER_INFO = storageRemove(KEY_USER_INFO)

// 本地存储-按当前交易账号储存 自选、激活的品种名称、打开的品种名称列表
export const STORAGE_GET_CONF_INFO = genStorageGet(KEY_USER_CONF_INFO)
export const STORAGE_SET_CONF_INFO = genStorageSet(KEY_USER_CONF_INFO)
export const STORAGE_REMOVE_CONF_INFO = storageRemove(KEY_USER_CONF_INFO)

// 全局主题色
export const STORAGE_GET_THEME = genStorageGet(KEY_THEME)
export const STORAGE_SET_THEME = genStorageSet(KEY_THEME)

// 全局涨跌颜色
export const STORAGE_GET_DIRECTION = genStorageGet(KEY_DIRECTION)
export const STORAGE_SET_DIRECTION = genStorageSet(KEY_DIRECTION)

// 本地设置的语言
export const STORAGE_GET_LNG = genStorageGet(KEY_LNG)
export const STORAGE_SET_LNG = genStorageSet(KEY_LNG)

// 是否点击过引导页
export const STORAGE_GET_GUIDE = genStorageGet(KEY_GUIDE)
export const STORAGE_SET_GUIDE = genStorageSet(KEY_GUIDE)

// 当前登录选择的交易商服务信息
export const STORAGE_GET_TRADER_SERVER = genStorageGet(KEY_TRADER_SERVER)
export const STORAGE_SET_TRADER_SERVER = genStorageSet(KEY_TRADER_SERVER)

// 快速下单状态状态标记
export const STORAGE_GET_QUICK_PLACE_ORDER_CHECKED = genStorageGet(KEY_QUICK_PLACE_ORDER_CHECKED)
export const STORAGE_SET_QUICK_PLACE_ORDER_CHECKED = genStorageSet(KEY_QUICK_PLACE_ORDER_CHECKED)

// 订单二次确认弹窗
export const STORAGE_GET_ORDER_CONFIRM_CHECKED = genStorageGet(KEY_ORDER_CONFIRM_CHECKED)
export const STORAGE_SET_ORDER_CONFIRM_CHECKED = genStorageSet(KEY_ORDER_CONFIRM_CHECKED)

// 平仓二次确认弹窗
export const STORAGE_GET_POSITION_CONFIRM_CHECKED = genStorageGet(KEY_POSITION_CONFIRM_CHECKED)
export const STORAGE_SET_POSITION_CONFIRM_CHECKED = genStorageSet(KEY_POSITION_CONFIRM_CHECKED)

// 当前选中的tab
export const STORAGE_GET_SELECTED_TAB = genStorageGet(KEY_SELECTED_TAB)
export const STORAGE_SET_SELECTED_TAB = genStorageSet(KEY_SELECTED_TAB)

// app 版本号
export const STORAGE_GET_APP_VERSION = genStorageGet(KEY_APP_VERSION)
export const STORAGE_SET_APP_VERSION = genStorageSet(KEY_APP_VERSION)

// 历史搜索记录
export const STORAGE_GET_HISTORY_SEARCH = genStorageGet(KEY_HISTORY_SEARCH)
export const STORAGE_SET_HISTORY_SEARCH = genStorageSet(KEY_HISTORY_SEARCH)
export const STORAGE_REMOVE_HISTORY_SEARCH = storageRemove(KEY_HISTORY_SEARCH)

// 历史搜索记录
export const STORAGE_GET_ENV = genStorageGet(KEY_ENV)
export const STORAGE_SET_ENV = genStorageSet(KEY_ENV)
export const STORAGE_REMOVE_ENV = storageRemove(KEY_ENV)

// 进入k线页面时间，用来强制reload k线，避免长时间不进入k线页面空白
export const STORAGE_GET_TRADINGVIEW_RELOAD_TIME = genStorageGet(KEY_TRADINGVIEW_RELOAD_TIME)
export const STORAGE_SET_TRADINGVIEW_RELOAD_TIME = genStorageSet(KEY_TRADINGVIEW_RELOAD_TIME)
export const STORAGE_REMOVE_TRADINGVIEW_RELOAD_TIME = storageRemove(KEY_TRADINGVIEW_RELOAD_TIME)

// 定位信息
export const STORAGE_GET_LOCATION_INFO = genStorageGet(KEY_LOCATION_INFO)
export const STORAGE_SET_LOCATION_INFO = genStorageSet(KEY_LOCATION_INFO)
export const STORAGE_REMOVE_LOCATION_INFO = storageRemove(KEY_LOCATION_INFO)

// 安卓端点击同意隐私政策
export const STORAGE_GET_ANDROID_PRIVACY_MODAL = genStorageGet(KEY_ANDROID_PRIVACY_MODAL)
export const STORAGE_SET_ANDROID_PRIVACY_MODAL = genStorageSet(KEY_ANDROID_PRIVACY_MODAL)

// =================================================

// 设置本地用户信息
export const setLocalUserInfo = async (userInfo: User.UserInfo) => {
  // 保存token到本地
  await STORAGE_SET_TOKEN(userInfo?.access_token)
  // 保存登录的用户信息到本地
  await STORAGE_SET_USER_INFO(userInfo)
}

// ============================================================
// 工厂函数-获取
export function genStorageGet(key: string) {
  return async (path?: string) => {
    // 获取存储
    const storage = await storageGetting(key)
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
  return async (value: any, path?: string) => {
    // 不穿参数，表示删除
    if (value === undefined && path === undefined) {
      storageDelete(key)
      return
    }

    // 指定了路径，更新指定路径的值，返回完整存储
    if (path) {
      // 设置指定路径的值
      let storage = await genStorageGet(key)()

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
async function storageDelete(key: string) {
  try {
    await AsyncStorage.removeItem(key)
  } catch (e) {}
}

// 本地存储-获取
async function storageGetting(key: string) {
  const storage: any = await AsyncStorage.getItem(key)

  let result: any
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

  if (valuetype(value, 'Object') || valuetype(value, 'Array') || valuetype(value, 'number') || valuetype(value, 'boolean')) {
    try {
      result = JSON.stringify(value)
    } catch (error) {
      result = value
    }
  }

  if (valuetype(result, 'string')) {
    AsyncStorage.setItem(key, result)
  } else {
    console.log({
      msg: '本地存储失败',
      result: result
    })
  }
}

export function storageRemove(key: string) {
  return () => {
    try {
      AsyncStorage.removeItem(key)
    } catch (e) {}
  }
}
// ============================================================
