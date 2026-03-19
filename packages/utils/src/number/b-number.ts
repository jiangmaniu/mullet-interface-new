import BigNumber from 'bignumber.js'
import { isNil, isUndefined } from 'lodash-es'

import { FormatNumberOpt, FormatPercentOpt, toFormatNumber, toFormatPercent } from '../format'

const BigNumberConfig = {
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: [-30, 40] as [number, number],
  DECIMAL_PLACES: 30,
}

BigNumber.config(BigNumberConfig)

export type BNumberValue = string | number | bigint | BNumber | BigNumber.Value

export type BNumberRoundingMode = BigNumber.RoundingMode

const BigNumberBase = BigNumber.clone(BigNumberConfig)

export class BNumber extends BigNumberBase {
  static MAX_PERCENT = 100
  static MIN_PERCENT = 0

  constructor(n: BNumberValue, base?: number) {
    n = n === '' ? 0 : n

    const value = n.toString().replace(/,/g, '')
    // v10 中 base 参数不接受 undefined，需要条件传递
    if (base !== undefined) {
      super(value, base)
    } else {
      super(value)
    }
  }

  static from(value: BNumberValue): BNumber
  static from(value: Nilable<BNumberValue>): BNumber | undefined
  static from(value: Nilable<BNumberValue>): BNumber | undefined {
    if (isNil(value)) return

    if (value instanceof BNumber) {
      return value
    }

    if (value.toString().length === 0) {
      value = 0
    }

    return new BNumber(value)
  }

  static toFormatNumber(value?: Nilable<BNumberValue>, option?: FormatNumberOpt) {
    return toFormatNumber(value, option)
  }

  static toFormatPercent(value?: Nilable<BNumberValue>, option?: FormatPercentOpt) {
    return toFormatPercent(value, option)
  }

  static fromPercent(n: BNumberValue) {
    let value = new BNumber(n)

    value = value.lt(BNumber.MIN_PERCENT) ? new BNumber(BNumber.MIN_PERCENT) : value
    value = value.gt(BNumber.MAX_PERCENT) ? new BNumber(BNumber.MAX_PERCENT) : value

    return value
  }

  static max(...n: BNumberValue[]) {
    return BNumber.from(BigNumber.max(...n.map((i) => BNumber.from(i).toString())))
  }

  static min(...n: BNumberValue[]) {
    return BNumber.from(BigNumber.min(...n.map((i) => BNumber.from(i).toString())))
  }

  static parseUnits(value: BNumberValue, unitName: BNumberValue): BNumber
  static parseUnits(value?: BNumberValue, unitName?: BNumberValue): BNumber | undefined
  static parseUnits(value?: BNumberValue, unitName?: BNumberValue) {
    if (isNil(value) || isNil(unitName)) return

    if (value instanceof BNumber) {
      return value
    }

    if (value.toString().length === 0) {
      value = 0
    }

    const parsedValue = BNumber.from(value)
      .multipliedBy(10 ** BNumber.from(unitName).toNumber())
      .integerValue()

    return BNumber.from(parsedValue)
  }

  toPercent() {
    return BNumber.from(super.multipliedBy(100))
  }

  toPercentRatio() {
    return BNumber.from(super.div(100))
  }

  pow(n: BNumberValue, base?: number): BNumber
  pow(n?: BNumberValue, base?: number): BNumber | undefined
  pow(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    const value = BNumber.from(n)
    return BNumber.from(base !== undefined ? super.pow(value.toString(), base) : super.pow(value.toString()))
  }

  multipliedBy(n: BNumberValue, base?: number): BNumber
  multipliedBy(n?: BNumberValue, base?: number): BNumber | undefined
  multipliedBy(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    const value = BNumber.from(n)
    return BNumber.from(
      base !== undefined ? super.multipliedBy(value.toString(), base) : super.multipliedBy(value.toString()),
    )
  }

  div(n: BNumberValue, base?: number): BNumber
  div(n?: BNumberValue, base?: number): BNumber | undefined
  div(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    const value = BNumber.from(n)
    return BNumber.from(base !== undefined ? super.div(value.toString(), base) : super.div(value.toString()))
  }

  times(n: BNumberValue, base?: number): BNumber
  times(n?: BNumberValue, base?: number): BNumber | undefined
  times(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    const value = BNumber.from(n)
    return BNumber.from(base !== undefined ? super.times(value.toString(), base) : super.times(value.toString()))
  }

  gt(n: BNumberValue, base?: number): boolean
  gt(n?: BNumberValue, base?: number): boolean | undefined
  gt(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    const value = BNumber.from(n)
    return base !== undefined ? super.gt(value.toString(), base) : super.gt(value.toString())
  }

  lt(n: BNumberValue, base?: number): boolean
  lt(n?: BNumberValue, base?: number): boolean | undefined
  lt(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    const value = BNumber.from(n)
    return base !== undefined ? super.lt(value.toString(), base) : super.lt(value.toString())
  }

  lte(n: BNumberValue, base?: number): boolean
  lte(n?: BNumberValue, base?: number): boolean | undefined
  lte(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    const value = BNumber.from(n)
    return base !== undefined ? super.lte(value.toString(), base) : super.lte(value.toString())
  }

  gte(n: BNumberValue, base?: number): boolean
  gte(n?: BNumberValue, base?: number): boolean | undefined
  gte(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    const value = BNumber.from(n)
    return base !== undefined ? super.gte(value.toString(), base) : super.gte(value.toString())
  }

  eq(n: BNumberValue, base?: number): boolean
  eq(n?: BNumberValue, base?: number): boolean | undefined
  eq(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    const value = BNumber.from(n)
    return base !== undefined ? super.eq(value.toString(), base) : super.eq(value.toString())
  }

  minus(n: BNumberValue, base?: number): BNumber
  minus(n?: BNumberValue, base?: number): BNumber | undefined
  minus(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    const value = BNumber.from(n)
    return BNumber.from(base !== undefined ? super.minus(value.toString(), base) : super.minus(value.toString()))
  }

  plus(n: BNumberValue, base?: number): BNumber
  plus(n?: BNumberValue, base?: number): BNumber | undefined
  plus(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    const value = BNumber.from(n)
    return BNumber.from(base !== undefined ? super.plus(value.toString(), base) : super.plus(value.toString()))
  }

  cutDecimalPlaces(decimalPlaces?: number, roundingMode?: BNumberRoundingMode): BNumber {
    if (!decimalPlaces) {
      return this
    }
    return BNumber.from(super.decimalPlaces(decimalPlaces, roundingMode))
  }

  decimalPlaces(): number
  decimalPlaces(decimalPlaces: number, roundingMode?: BNumberRoundingMode): BNumber
  decimalPlaces(decimalPlaces?: number, roundingMode?: BNumberRoundingMode) {
    if (isUndefined(decimalPlaces)) {
      return super.decimalPlaces()
    }

    return BNumber.from(super.decimalPlaces(decimalPlaces, roundingMode))
  }

  negated() {
    return BNumber.from(super.negated())
  }

  toBigInt(): bigint {
    return BigInt(super.integerValue().toString())
  }
}
