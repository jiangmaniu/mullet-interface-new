import { isNil, isUndefined } from 'lodash-es'

const RENDER_FALLBACK = '--'

export const renderFallback = (v?: any, option?: { verify?: boolean }) => {
  const { verify } = option || {}
  if (!isNil(verify)) {
    return verify ? v : RENDER_FALLBACK
  }
  return isNil(v) ? RENDER_FALLBACK : v
}

export const renderFallbackPlaceholder = ({
  integerValue = 0,
  decimalValue = 0,
  volScale,
}: {
  integerValue?: number
  decimalValue?: number
  volScale?: number
}) => {
  let value = integerValue.toString()

  if (!(isUndefined(decimalValue) || isUndefined(volScale))) {
    value = `${value}.${decimalValue.toString().padEnd(volScale, decimalValue.toString())}`
  }

  return value
}
