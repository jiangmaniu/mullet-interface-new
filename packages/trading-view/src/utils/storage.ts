import lodashGet from 'lodash/get'
import lodashSet from 'lodash/set'

import { KEY_TRADINGVIEW_CHART_PROPS } from '@/constants'

import { valuetype } from './type'

// 本地存储-图表设置
export const STORAGE_GET_CHART_PROPS = genStorageGet(KEY_TRADINGVIEW_CHART_PROPS)
export const STORAGE_SET_CHART_PROPS = genStorageSet(KEY_TRADINGVIEW_CHART_PROPS)
export const STORAGE_REMOVE_CHART_PROPS = storageRemove(KEY_TRADINGVIEW_CHART_PROPS)

// ============================================================
// 工厂函数-获取
function genStorageGet(key: string) {
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
function genStorageSet(key: string) {
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

  if (valuetype(value, 'Object') || valuetype(value, 'Array') || valuetype(value, 'number') || valuetype(value, 'boolean')) {
    try {
      result = JSON.stringify(value)
    } catch (error) {
      result = value
    }
  }

  if (valuetype(result, 'string')) {
    localStorage.setItem(key, result)
  } else {
    throw {
      error: {
        msg: '本地存储失败',
        result: result
      }
    }
  }
}

function storageRemove(key: string) {
  return () => {
    try {
      localStorage.removeItem(key)
    } catch (e) {}
  }
}
// ============================================================
