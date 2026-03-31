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

// 每n个分组
export const groupBy = (arr: any[], n: number) => {
  let newList: any = []
  for (let i = 0; i < arr.length; i += n) {
    newList.push(arr.slice(i, i + n))
  }
  return newList
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
