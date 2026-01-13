import BigNumber from 'bignumber.js'
import { isNaN, isNil, isUndefined, merge } from 'lodash-es'
import numbro from 'numbro'

import { BNumber, BNumberValue } from '../number/b-number'

const FORMAT_VALUE_FALLBACK = '-'

export type FormatNumberOpt = {
  precision?: number
  volScale?: number
  unit?: string
  unitSeparated?: string
  isFrontUnit?: boolean
  defaultLabel?: string
  prefix?: string
  fallbackToZero?: boolean
  autoHideDecimal?: boolean
  positive?: boolean
  sign?: string
  forceSign?: boolean
  minimumFallback?: boolean
  format?: Omit<numbro.Format, 'mantissa' | 'forceSign'>
}

const enUs: numbro.NumbroLanguage = merge(numbro.languageData('en-US'), {
  abbreviations: {
    thousand: 'K',
    million: 'M',
    billion: 'B',
    trillion: 'T',
  },
} as numbro.NumbroLanguage)
numbro.registerLanguage(enUs)

export function toFormatNumber(value?: BNumberValue | null, opt?: FormatNumberOpt) {
  let { volScale } = opt || {}

  let amount = value

  const {
    precision = undefined,
    defaultLabel = FORMAT_VALUE_FALLBACK,
    fallbackToZero = false,
    autoHideDecimal = false,
    prefix,
    positive = true,
    isFrontUnit = false,
    unit,
    format,
    sign,
    forceSign = false,
    minimumFallback = false,
    unitSeparated = isFrontUnit ? '' : ' ',
  }: FormatNumberOpt = opt || {}

  const initFormat: numbro.Format = {
    roundingFunction: (...args) => {
      return Math.floor(...args)
    },
    thousandSeparated: true,
  }

  if ((amount instanceof BNumber || amount instanceof BigNumber) && !isUndefined(precision)) {
    amount = BNumber.from(amount).toFixed(0)
  }

  if (isNil(amount) || isNaN(amount) || amount.toString().length === 0) {
    if (!fallbackToZero) {
      return defaultLabel
    }

    amount = BNumber.from(0)
  }

  let amountWithFormated = BNumber.from(amount)
  if (!isUndefined(precision)) {
    amountWithFormated = amountWithFormated.div(10 ** precision)
  }

  let isNegative = amountWithFormated.lt(0)
  if (positive && isNegative) {
    amountWithFormated = BNumber.from(0)
    isNegative = false
  }

  if (autoHideDecimal && !isUndefined(volScale) && !isUndefined(precision)) {
    volScale = formatAutoHideDecimal(amount, {
      precision,
      volScale,
    })
  }

  const numSign = isNegative ? '-' : '+'
  const frontUnitLabel = unit ? `${unit}${unitSeparated}` : ''
  const rearUnitLabel = unit ? `${unitSeparated}${unit}` : ''
  const signOfDisplayed = sign ? sign : forceSign || isNegative ? numSign : ''

  /** Minimum amount fallback */
  if (minimumFallback && !amountWithFormated.eq(0)) {
    const amountWithLimitDecimals = BNumber.from(
      numbro(amountWithFormated.toFixed(0)).format({
        ...initFormat,
        ...format,
        mantissa: volScale,
      }),
    )
    if (amountWithLimitDecimals.eq(0) && !isUndefined(volScale)) {
      return `<${isNegative ? '-' : ''}${1 / 10 ** volScale}${!isFrontUnit ? rearUnitLabel : ''}`
    }
  }

  const formatedValue = numbro(amountWithFormated.abs().toFixed()).format({
    ...initFormat,
    ...format,
    ...(volScale ? { mantissa: volScale } : {}),
  })

  return `${prefix ? prefix : ''}${signOfDisplayed}${isFrontUnit ? frontUnitLabel : ''}${formatedValue}${
    !isFrontUnit ? rearUnitLabel : ''
  }`
}

type formatAutoHideDecimalParams = {
  precision?: number
  volScale: number
}

const formatAutoHideDecimal = (amount: BNumberValue, opt: formatAutoHideDecimalParams) => {
  let { volScale } = opt
  const { precision } = opt

  let amountWithFormated = BNumber.from(amount)
  if (!isUndefined(precision)) {
    amountWithFormated = amountWithFormated.div(10 ** precision)
  }

  if (amountWithFormated.gt(10 ** 5)) {
    volScale -= 2
  }

  if (amountWithFormated.gt(10 ** 7)) {
    volScale -= 2
  }

  return volScale
}
