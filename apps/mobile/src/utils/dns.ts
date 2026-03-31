/**
 * 探测域名是否可用（DNS 通 + TCP/TLS 通 + HTTP 状态 < 400）
 * @param domain  例如 "client.stellux.io"
 * @param https   是否用 https；某些服务只开 http 可改为 false
 * @param ms      超时毫秒数
 */
export async function isDomainAvailable(domain: string, ms = 5000): Promise<boolean> {
  const maxRetries = 2
  const retryDelay = 1000 // 重试间隔 1 秒

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const url = `${domain}/platform/img/pc-logo.svg?_t=${Date.now()}`
    const ctrl = new AbortController()
    const tid = setTimeout(() => ctrl.abort(), ms)

    try {
      const res = await fetch(url, {
        method: 'HEAD', // 只取响应头，最省流量；如果服务不支持 HEAD 再切 GET
        signal: ctrl.signal
      })
      // 任意 2xx / 3xx 都算"可用"；也可以把 4xx 视为可用，看需求
      return res.status < 400
    } catch (err: any) {
      // fetch 在 RN 下遇到 DNS 失败会抛 `TypeError: Network request failed`
      // 如果还有重试次数，则等待后重试
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
        continue
      }
      return false
    } finally {
      clearTimeout(tid)
    }
  }

  return false
}
