'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type QueryValue = string | number | boolean | null | undefined
type QueryObject = Record<string, QueryValue>

export function useKeepRouter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  /**
   * ===========================
   * 构建最终路径（支持 ./ 和 #/）
   * ===========================
   *
   * 规则说明：
   *
   * 1. 如果 path 以 "./" 开头：表示跳转到当前路径下的子路由
   *    例如：当前路径 /aa/bb
   *    传入 "./cc" -> /aa/bb/cc
   *
   * 2. 如果 path 以 "#/" 开头：表示替换当前“最后一层”路径
   *    例如：当前路径 /aa/bb
   *    传入 "#/cc" -> /aa/cc
   *
   * 3. 其他情况：按照 next.js 默认行为处理（如 "/xxx"）
   */
  const resolvePath = (path: string): string => {
    // 1. 基于当前路径追加子路径
    if (path.startsWith('./')) {
      return pathname.replace(/\/$/, '') + '/' + path.slice(2)
    }

    // 2. 替换最后一层路由
    if (path.startsWith('#/')) {
      const replaceSegment = path.slice(2) // "#/xx" -> "xx"
      const parts = pathname.split('/').filter(Boolean) // ["aa","bb"]

      // 替换掉最后一个 segment
      parts[parts.length - 1] = replaceSegment

      return '/' + parts.join('/')
    }

    // 3. 默认情况（绝对路径或相对 next 行为）
    return path
  }

  /**
   * ===========================
   * 构建 querystring
   * ===========================
   */
  const buildQueryString = (extra?: QueryObject, removeKeys?: string[]): string => {
    const params = new URLSearchParams(searchParams.toString())

    // 删除指定 key
    removeKeys?.forEach((k) => params.delete(k))

    // 合并 / 覆盖
    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        if (value === undefined || value === null) params.delete(key)
        else params.set(key, String(value))
      })
    }

    return params.toString()
  }

  /**
   * ===========================
   * push 路由并保留 query
   * ===========================
   */
  const pushKeepQuery = (path: string, extra?: QueryObject, removeKeys?: string[]) => {
    const finalPath = resolvePath(path)
    const qs = buildQueryString(extra, removeKeys)
    // @ts-ignore
    router.push(qs ? `${finalPath}?${qs}` : finalPath)
  }

  /**
   * ===========================
   * replace 路由并保留 query
   * ===========================
   */
  const replaceKeepQuery = (path: string, extra?: QueryObject, removeKeys?: string[]) => {
    const finalPath = resolvePath(path)
    const qs = buildQueryString(extra, removeKeys)
    // @ts-ignore
    router.replace({ pathname: qs ? `${finalPath}?${qs}` : finalPath })
    return null
  }

  /**
   * ===========================
   * 构建 Link 专用 href
   * ===========================
   */
  const createHref = (path: string, extra?: QueryObject, removeKeys?: string[]) => {
    const finalPath = resolvePath(path)
    const qs = buildQueryString(extra, removeKeys)
    return qs ? `${finalPath}?${qs}` : finalPath
  }

  return {
    pushKeepQuery,
    replaceKeepQuery,
    createHref,
  }
}
