import { BigNumber } from 'bignumber.js'
import { isNil, isUndefined } from 'lodash-es'

import { FormatNumberOpt, FormatPercentOpt, toFormatNumber, toFormatPercent } from '../format'

const BigNumberConfig: BigNumber.Config = {
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: [-30, 40],
  DECIMAL_PLACES: 30,
}

BigNumber.config(BigNumberConfig)

export type BNumberValue = string | number | BNumber | BigNumber | bigint

export type BNumberRoundingMode = BigNumber.RoundingMode

const BigNumberBase = BigNumber.clone(BigNumberConfig)

export class BNumber extends BigNumberBase {
  static MAX_PERCENT = 100
  static MIN_PERCENT = 0

  constructor(n: BNumberValue, base?: number) {
    n = n === '' ? 0 : n

    if (isUndefined(base)) {
      super(typeof n === 'bigint' ? n.toString() : (n as any))
    } else {
      super(n.toString(), base)
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
    return BNumber.from(BigNumber.max(...n.map((i) => BNumber.from(i).toFixed())))
  }

  static min(...n: BNumberValue[]) {
    return BNumber.from(BigNumber.min(...n.map((i) => BNumber.from(i).toFixed())))
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
    return isUndefined(base)
      ? BNumber.from(super.pow(BNumber.from(n)))
      : BNumber.from(super.pow(BNumber.from(n).toString(), base))
  }

  abs(): BNumber {
    return BNumber.from(super.abs())
  }

  multipliedBy(n: BNumberValue, base?: number): BNumber
  multipliedBy(n?: BNumberValue, base?: number): BNumber | undefined
  multipliedBy(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return isUndefined(base)
      ? BNumber.from(super.multipliedBy(BNumber.from(n)))
      : BNumber.from(super.multipliedBy(BNumber.from(n).toString(), base))
  }

  div(n: BNumberValue, base?: number): BNumber
  div(n?: BNumberValue, base?: number): BNumber | undefined
  div(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return isUndefined(base)
      ? BNumber.from(super.div(BNumber.from(n)))
      : BNumber.from(super.div(BNumber.from(n).toString(), base))
  }

  times(n: BNumberValue, base?: number): BNumber
  times(n?: BNumberValue, base?: number): BNumber | undefined
  times(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return isUndefined(base)
      ? BNumber.from(super.times(BNumber.from(n)))
      : BNumber.from(super.times(BNumber.from(n).toString(), base))
  }

  gt(n: BNumberValue, base?: number): boolean
  gt(n?: BNumberValue, base?: number): boolean | undefined
  gt(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return isUndefined(base) ? super.gt(BNumber.from(n)) : super.gt(BNumber.from(n).toString(), base)
  }

  lt(n: BNumberValue, base?: number): boolean
  lt(n?: BNumberValue, base?: number): boolean | undefined
  lt(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return isUndefined(base) ? super.lt(BNumber.from(n)) : super.lt(BNumber.from(n).toString(), base)
  }

  lte(n: BNumberValue, base?: number): boolean
  lte(n?: BNumberValue, base?: number): boolean | undefined
  lte(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return isUndefined(base) ? super.lte(BNumber.from(n)) : super.lte(BNumber.from(n).toString(), base)
  }

  gte(n: BNumberValue, base?: number): boolean
  gte(n?: BNumberValue, base?: number): boolean | undefined
  gte(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return isUndefined(base) ? super.gte(BNumber.from(n)) : super.gte(BNumber.from(n).toString(), base)
  }

  eq(n: BNumberValue, base?: number): boolean
  eq(n?: BNumberValue, base?: number): boolean | undefined
  eq(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return isUndefined(base) ? super.eq(BNumber.from(n)) : super.eq(BNumber.from(n).toString(), base)
  }

  minus(n: BNumberValue, base?: number): BNumber
  minus(n?: BNumberValue, base?: number): BNumber | undefined
  minus(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return isUndefined(base)
      ? BNumber.from(super.minus(BNumber.from(n)))
      : BNumber.from(super.minus(BNumber.from(n).toString(), base))
  }

  plus(n: BNumberValue, base?: number): BNumber
  plus(n?: BNumberValue, base?: number): BNumber | undefined
  plus(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return isUndefined(base)
      ? BNumber.from(super.plus(BNumber.from(n)))
      : BNumber.from(super.plus(BNumber.from(n).toString(), base))
  }

  cutDecimalPlaces(decimalPlaces?: number, roundingMode?: BigNumber.RoundingMode): BNumber {
    if (!decimalPlaces) {
      return this
    }
    return BNumber.from(super.decimalPlaces(decimalPlaces, roundingMode))
  }

  decimalPlaces(): number
  decimalPlaces(decimalPlaces: number, roundingMode?: BigNumber.RoundingMode): BNumber
  decimalPlaces(decimalPlaces?: number, roundingMode?: BigNumber.RoundingMode) {
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
