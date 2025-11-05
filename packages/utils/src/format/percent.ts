import { BNumber, BNumberValue } from '../number/b-number'
import { FormatNumberOpt, toFormatNumber } from './number'

const COMMON_PERCENT_DISPLAY_DECIMALS = 2

export type FormatPercentOpt = Prettify<
  FormatNumberOpt & {
    isRaw?: boolean
    isUnit?: boolean
  }
>

export function toFormatPercent(percent?: BNumberValue | null, opt: FormatPercentOpt = {}): string {
  const { isRaw = true, isUnit = true, positive = false, ...rest } = opt

  if (isRaw) {
    percent = BNumber.from(percent?.toString())?.multipliedBy(100).toFixed()
  }

  const formatedPercent = toFormatNumber(percent, {
    unit: isUnit ? '%' : '',
    unitSeparated: '',
    positive,
    volScale: rest.volScale ?? COMMON_PERCENT_DISPLAY_DECIMALS,
    ...rest,
  })
  return formatedPercent
}
