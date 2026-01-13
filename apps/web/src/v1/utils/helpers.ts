/**
 * 删除对象中字段为空的字段
 * @param {*} object
 * @returns
 */
export function deleteEmptyProperty(object: any) {
  for (let i in object) {
    let value = object[i]
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          delete object[i]
          continue
        }
      }
      deleteEmptyProperty(value)
      if (isEmpty(value)) {
        delete object[i]
      }
    } else {
      if (value === '' || value === null || value === undefined) {
        delete object[i]
      }
    }
  }
  return object
}

function isEmpty(object: any) {
  for (let name in object) {
    return false
  }
  return true
}

export function sortObjectByKey(obj: any) {
  // 创建一个新的对象来存储排序后的结果
  const sortedObj: any = {}

  // 获取对象的键并按字母顺序排序
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sortedObj[key] = obj[key] // 将排序后的键值对添加到新对象中
    })

  return sortedObj // 返回排序后的对象
}

/**格式化对象中的value为数组的字段 */
export const formatObjArrToStr = (obj: any) => {
  Object.keys(obj).forEach((key) => {
    if (Array.isArray(obj[key])) {
      obj[key] = JSON.stringify(obj[key])
    }
  })
  return obj
}
