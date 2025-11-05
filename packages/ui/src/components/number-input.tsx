import * as React from 'react'
import { isUndefined } from 'lodash-es'
import type { NumberInputPrimitiveProps } from './number-input-primitive'

import { BNumber } from '@mullet/utils/number'

import { cn } from '../lib/utils'
import { NumberInputPrimitive, NumberInputSourceType } from './number-input-primitive'

export type NumberFieldProps = NumberInputPrimitiveProps & {
  LeftContent?: React.ReactNode
  RightContent?: React.ReactNode
  status?: 'error'
  sourceEventType?: NumberInputSourceType | 'all'
}

const NumberInput = ({
  className,
  LeftContent,
  RightContent,
  sourceEventType = NumberInputSourceType.EVENT,
  onChange,
  status,
  value,
  onBlur,
  onValueChange,
  min,
  max,
  ref,
  ...props
}: NumberFieldProps & React.ComponentProps<'input'>) => {
  const isError = status === 'error'
  // const inputPrimitiveRef = React.useRef<HTMLInputElement>(null)

  // const handleValueChange = (newValue: BNumber) => {
  //   if (!isUndefined(min) && newValue.lt(BNumber.from(min))) {
  //     newValue = BNumber.from(min)
  //   }
  //   if (!isUndefined(max) && newValue.gt(BNumber.from(max))) {
  //     newValue = BNumber.from(max)
  //   }
  //   const values = {
  //     floatValue: newValue.toNumber(),
  //     value: newValue.toString(),
  //     formattedValue: newValue.toString()
  //   }
  //   onValueChange?.(values, { source: NumberInputSourceType.EVENT })
  // }

  // const isIncrementDisabled = !isUndefined(max) && BNumber.from(value ?? 0).gte(BNumber.from(max))
  // const isDecrementDisabled = !isUndefined(min) && BNumber.from(value ?? 0).lte(BNumber.from(min))

  // 点击容器聚焦 input
  // const handleContainerClick = () => {
  //   inputPrimitiveRef.current?.focus()
  // }

  return (
    <div
      className={cn(
        'flex h-10 items-center rounded-[8px] border border-[#3B3D52] px-3.5 py-3 text-[14px] transition-all',
        'text-white selection:bg-[#3B3D52] selection:text-white',
        'hover:ring-button-hover hover:ring-[3px]',
        'focus-within:ring-button-hover focus-within:ring-[3px]',
        'has-[input:disabled]:text-title-sub has-[input:disabled]:ring-0',
        isError && !props.disabled
          ? ['border-status-danger', 'hover:border-pink-06 hover:ring-pink-05', 'focus-within:ring-pink-05']
          : '',
        className,
      )}
    >
      {LeftContent}

      <NumberInputPrimitive
        // ref={inputPrimitiveRef}
        className={cn(
          'caret-button-tab h-full flex-1 bg-transparent outline-none transition-colors',
          'text-[14px] leading-normal text-white placeholder:text-[#767783]',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'disabled:cursor-not-allowed',
          {
            'text-status-danger': isError && !props.disabled,
          },
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

      {RightContent}

      {/* <div className="flex h-full flex-col items-center justify-center border-l">
          <div
            className={cn('flex flex-1 cursor-pointer select-none items-center px-4 text-head2', 'hover:bg-button-hover hover:text-head1', {
              'cursor-not-allowed opacity-50': isIncrementDisabled
            })}
            onClick={(e) => {
              e.preventDefault()
              if (onValueChange && !isIncrementDisabled) {
                const newValue = BNumber.from(value ?? 0).plus(1)
                handleValueChange(newValue)
              }
            }}
          >
            <Icons.lucide.Plus size={14} />
          </div>
          <div
            className={cn('flex flex-1 cursor-pointer select-none items-center px-4 text-head2', 'hover:bg-button-hover hover:text-head1', {
              'cursor-not-allowed opacity-50': isDecrementDisabled
            })}
            onClick={(e) => {
              e.preventDefault()
              if (onValueChange && !isDecrementDisabled) {
                const newValue = BNumber.from(value ?? 0).minus(1)
                handleValueChange(newValue)
              }
            }}
          >
            <Icons.lucide.Minus size={14} />
          </div>
        </div> */}
    </div>
  )
}
NumberInput.displayName = 'NumberInput'

export { NumberInput, NumberInputPrimitive, NumberInputSourceType }
