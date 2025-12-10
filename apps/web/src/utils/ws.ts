import { createWSClient, WSClientConfig } from '@mullet/ws'

let ws: ReturnType<typeof createWSClient> | null = null
export const getWsClientInstance = (config?: WSClientConfig) => {
  if (!ws) {
    ws = createWSClient({
      ...config,

      url: config?.url ?? process.env.NEXT_PUBLIC_WS_URL,
      debug: config?.debug ?? process.env.NODE_ENV === 'development',
    })
  }
  return ws
}
