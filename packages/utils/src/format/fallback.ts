import { isNil } from 'lodash-es'

const RENDER_FALLBACK = '--'

export const renderFallback = (v?: any, option?: { verify?: boolean }) => {
  const { verify } = option || {}
  if (!isNil(verify)) {
    return verify ? v : RENDER_FALLBACK
  }
  return isNil(v) ? RENDER_FALLBACK : v
}
