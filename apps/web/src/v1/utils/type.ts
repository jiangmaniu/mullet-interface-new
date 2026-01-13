/**
 * 类型判断
 */
export function valuetype(value: any, type: string, dev: any = false): boolean {
  const sEnums: string[] = ['number', 'string', 'boolean', 'undefined', 'function']
  const oEnums: string[] = ['Null', 'Object', 'Array', 'Date', 'RegExp', 'Error']
  const nEnums: string[] = [
    '[object Number]',
    '[object String]',
    '[object Boolean]',
    '[object Undefined]',
    '[object Function]',
    '[object Null]',
    '[object Object]',
    '[object Array]',
    '[object Date]',
    '[object RegExp]',
    '[object Error]'
  ]

  // 纯数字字符串
  if (type === 'NumberString') {
    return /^\d+$/.test(value)
  }

  // 完全匹配模式，type应该传递类似格式[object Window] [object HTMLDocument] ...
  const reg = new RegExp('\\[object (.*?)\\]')
  if (reg.test(type)) {
    // 排除nEnums的12种
    if (nEnums.indexOf(type) > -1) {
      if (dev) {
        console.warn(
          value,
          'The parameter type belongs to one of 12 types: number string boolean undefined Null Object Array Date RegExp function Error NaN'
        )
      }
    }

    if (Object.prototype.toString.call(value) === type) {
      return true
    }

    return false
  }

  // 检测到的类型
  let t: any = typeof value

  // 可以通过 typeof 判断的，检测到的类型存在于枚举
  if (sEnums.indexOf(t) > -1) {
    // 区分特殊值NaN
    if (t === 'number' && isNaN(value)) {
      t = 'NaN'
    }
    // 传递的类型和检测到的类型匹配
    if (t === type) {
      return true
    }
    return false
  } else {
    // 需要通过 Object.prototype.toString.call() 判断的
    const o = Object.prototype.toString.call(value)
    // 本来o的值格式是[object Object]，通过正则后值的格式是Object
    const r = new RegExp('\\[object (.*?)\\]')
    const so = o.replace(r, '$1')

    // 检测到的类型存在于枚举，传递的类型和检测到的类型匹配
    if (oEnums.indexOf(so) > -1 && so === type) {
      return true
    }
    return false
  }
}
