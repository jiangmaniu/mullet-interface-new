import * as React from 'react'
import { isUndefined } from 'lodash-es'
import type { NumberInputPrimitiveProps } from './number-input-primitive'

import { BNumber } from '@mullet/utils/number'

import { cn } from '@/lib/utils'
import { InputContainer, InputContainerProps } from './input-container'
import { NumberInputPrimitive, NumberInputSourceType } from './number-input-primitive'

export type NumberFieldProps = Omit<NumberInputPrimitiveProps, 'size' | 'placeholder'> &
  Omit<InputContainerProps<NumberInputPrimitiveProps['value']>, 'children' | 'onClean' | 'value'> & {
    status?: 'error'
    sourceEventType?: NumberInputSourceType | 'all'
    inputClassName?: string
  }

const NumberInput = ({
  // InputContainer props
  labelText,
  placeholder,
  labelBgColor,
  labelClassName,
  size,
  LeftContent,
  RightContent,
  variant,
  className,
  clean = false,
  hintLabel,
  hintValue,
  errorMessage,
  hideLabel,
  inputClassName,
  block,
  // NumberInput specific props
  sourceEventType = NumberInputSourceType.EVENT,
  status,
  value,
  onBlur,
  onValueChange,
  min,
  max,
  ...props
}: NumberFieldProps) => {
  const isError = status === 'error'

  return (
    <InputContainer<NumberFieldProps['value']>
      labelText={labelText}
      placeholder={placeholder}
      labelBgColor={labelBgColor}
      labelClassName={labelClassName}
      size={size}
      hideLabel={hideLabel}
      LeftContent={LeftContent}
      RightContent={RightContent}
      variant={variant}
      className={className}
      clean={clean}
      value={value}
      block={block}
      hintLabel={hintLabel}
      hintValue={hintValue}
      errorMessage={errorMessage || (isError ? 'Error' : undefined)}
    >
      <NumberInputPrimitive
        placeholder=" "
        className={cn(
          'peer order-2 flex-1',
          'text-paragraph-p2 text-content-1 w-full min-w-0 bg-transparent p-0 m-0',
          {
            'text-status-danger': isError && !props.disabled,
          },
          inputClassName,
        )}
        onValueChange={(...args) => {
          const [, sourceInfo] = args
          if (sourceEventType === 'all') {
            onValueChange?.(...args)
          } else if (sourceEventType === sourceInfo.source) {
            onValueChange?.(...args)
          }
        }}
        value={value}
        min={min}
        max={max}
        onBlur={(...arg) => {
          if (!isUndefined(min) && BNumber.from(value ?? 0).lt(BNumber.from(min))) {
            onValueChange?.(
              {
                floatValue: BNumber.from(min).toNumber(),
                value: min?.toString(),
                formattedValue: min?.toString(),
              },
              { source: NumberInputSourceType.EVENT },
            )
          }

          onBlur?.(...arg)
        }}
        {...props}
      />
    </InputContainer>
  )
}
NumberInput.displayName = 'NumberInput'

export { NumberInput, NumberInputPrimitive, NumberInputSourceType }
