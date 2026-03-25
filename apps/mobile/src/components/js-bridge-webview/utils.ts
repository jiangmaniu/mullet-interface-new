// ─── 解析消息 ───────────────────────────────────────────────────

import { BridgeRequest } from '@mullet/js-bridge/types'

export function parseRequest(data: string): BridgeRequest | null {
  try {
    const raw = JSON.parse(data)
    const msg: BridgeRequest = raw?.payload?.direction === 'h5-to-app' ? raw.payload : raw
    if (msg?.direction === 'h5-to-app' && msg.action && msg.callId) {
      return msg
    }
  } catch {
    // 忽略非 Bridge 消息
  }
  return null
}

/**
 * 安全序列化 JSON — 防止 script injection
 *
 * 转义 </ 和特殊 Unicode 行分隔符，避免在 <script> 上下文中被截断或注入
 */
export function safeStringify(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}
