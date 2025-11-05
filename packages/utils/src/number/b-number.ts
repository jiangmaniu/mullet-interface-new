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

    super(n, base)
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
    return BNumber.from(BigNumber.max(...n.map((i) => BNumber.from(i).toFixed(0))))
  }

  static min(...n: BNumberValue[]) {
    return BNumber.from(BigNumber.min(...n.map((i) => BNumber.from(i).toFixed(0))))
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
    return super.multipliedBy(100)
  }

  multipliedBy(n: BNumberValue, base?: number): BNumber
  multipliedBy(n?: BNumberValue, base?: number): BNumber | undefined
  multipliedBy(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return BNumber.from(super.multipliedBy(BNumber.from(n), base))
  }

  div(n: BNumberValue, base?: number): BNumber
  div(n?: BNumberValue, base?: number): BNumber | undefined
  div(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return BNumber.from(super.div(BNumber.from(n), base))
  }

  times(n: BNumberValue, base?: number): BNumber
  times(n?: BNumberValue, base?: number): BNumber | undefined
  times(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return BNumber.from(super.times(BNumber.from(n), base))
  }

  gt(n: BNumberValue, base?: number): boolean
  gt(n?: BNumberValue, base?: number): boolean | undefined
  gt(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return super.gt(BNumber.from(n), base)
  }

  lt(n: BNumberValue, base?: number): boolean
  lt(n?: BNumberValue, base?: number): boolean | undefined
  lt(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return super.lt(BNumber.from(n), base)
  }

  lte(n: BNumberValue, base?: number): boolean
  lte(n?: BNumberValue, base?: number): boolean | undefined
  lte(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return super.lte(BNumber.from(n), base)
  }

  gte(n: BNumberValue, base?: number): boolean
  gte(n?: BNumberValue, base?: number): boolean | undefined
  gte(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return super.gte(BNumber.from(n), base)
  }

  eq(n: BNumberValue, base?: number): boolean
  eq(n?: BNumberValue, base?: number): boolean | undefined
  eq(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return super.eq(BNumber.from(n), base)
  }

  minus(n: BNumberValue, base?: number): BNumber
  minus(n?: BNumberValue, base?: number): BNumber | undefined
  minus(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return BNumber.from(super.minus(BNumber.from(n), base))
  }

  plus(n: BNumberValue, base?: number): BNumber
  plus(n?: BNumberValue, base?: number): BNumber | undefined
  plus(n?: BNumberValue, base?: number) {
    if (isNil(n)) return

    return BNumber.from(super.plus(BNumber.from(n), base))
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
