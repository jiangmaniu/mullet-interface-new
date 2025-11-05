import React from 'react'
import { NumericFormat } from 'react-number-format'
import { isUndefined } from 'lodash-es'
import type { NumberFormatValues, SourceInfo } from 'react-number-format'

import { cn } from '@/lib/utils'
import { BNumber } from '@mullet/utils/number'

// TODO: Unable to import `SourceType` enumeration directly from `react-number-format`
export enum NumberInputSourceType {
  EVENT = 'event',
  PROPS = 'prop',
}

export type NumberInputSourceInfo = Omit<SourceInfo, 'source'> & {
  source: NumberInputSourceType
}

export type OnValueChange = (values: NumberFormatValues, sourceInfo: NumberInputSourceInfo) => void

export type NumberInputPrimitiveProps = Prettify<
  Omit<React.ComponentPropsWithoutRef<typeof NumericFormat>, 'onValueChange'> & {
    onValueChange?: OnValueChange
    max?: number | string
    decimalPlaceholder?: boolean
  }
>

const NumberInputPrimitiveBase = ({
  className,
  allowNegative = true,
  valueIsNumericString = false,
  thousandSeparator = ',',
  onValueChange,
  decimalPlaceholder = false,
  max,
  allowedDecimalSeparators = ['。'],
  onFocus,
  inputMode = 'decimal',
  placeholder,
  decimalScale,
  ...props
}: NumberInputPrimitiveProps) => {
  const decimalPlaceholderLabel = !isUndefined(decimalScale) && decimalScale > 0 ? `0.${'0'.repeat(decimalScale)}` : '0'
  const placeholderLabel = placeholder ?? (decimalPlaceholder ? decimalPlaceholderLabel : undefined)

  const onBeforeFocus: React.FocusEventHandler<HTMLInputElement> = (...args) => {
    // scrollIntroView(...args)
    if (onFocus) {
      onFocus(...args)
    }
  }

  return (
    <NumericFormat
      // @ts-ignore
      // ref={ref}
      className={cn('w-full bg-transparent outline-none', className)}
      allowLeadingZeros
      valueIsNumericString={valueIsNumericString}
      thousandSeparator={thousandSeparator}
      allowNegative={allowNegative}
      decimalSeparator="."
      allowedDecimalSeparators={allowedDecimalSeparators}
      onValueChange={(values, sourceInfo) => {
        if (values.value === '.') values.value = ''

        if (!isUndefined(max) && !isUndefined(values.floatValue)) {
          const valueForBN = BNumber.from(values.value || 0)
          const maxForBN = BNumber.from(max || 0)

          if (valueForBN.gt(max)) {
            values = {
              floatValue: maxForBN.toNumber(),
              value: maxForBN.toString(),
              formattedValue: values.formattedValue.replace(new RegExp(values.value), maxForBN.toString()),
            }
          }
        }

        onValueChange?.(values, sourceInfo as unknown as NumberInputSourceInfo)
      }}
      isAllowed={(values) => {
        const { value } = values
        if (!isUndefined(max) && !isUndefined(value)) {
          const newValueForBN = BNumber.from(value)
          const valueForBN = BNumber.from(props.value ?? 0)
          const maxForBN = BNumber.from(max)
          const isAllowed = !(newValueForBN.gt(maxForBN) && valueForBN.eq(maxForBN))
          return isAllowed
        }

        return true
      }}
      onFocus={onBeforeFocus}
      placeholder={placeholderLabel}
      decimalScale={decimalScale}
      inputMode={inputMode}
      {...props}
    />
  )
}

NumberInputPrimitiveBase.displayName = NumberInputPrimitiveBase.name

export const NumberInputPrimitive = NumberInputPrimitiveBase
