import * as React from 'react'

import { cn } from '../lib/utils'
import { InputContainer, InputContainerProps } from './input-container'

export type InputProps = Omit<React.ComponentProps<'input'>, 'size' | 'placeholder'> &
  Omit<InputContainerProps<React.ComponentProps<'input'>['value']>, 'children' | 'value'> & {
    inputClassName?: string
    onValueChange?: (value: string) => void
  }

function Input({
  type,
  inputClassName,
  onChange,
  onValueChange,
  clean = true,
  onClean,
  value,
  variant,
  // InputContainer props
  labelText,
  placeholder,
  labelBgColor,
  labelClassName,
  size,
  LeftContent,
  RightContent,
  hintLabel,
  hintValue,
  errorMessage,
  className,
  // input element props
  ...inputProps
}: InputProps) {
  const handleClear = () => {
    onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
    onValueChange?.('')
    onClean?.()
  }

  return (
    <InputContainer<InputProps['value']>
      clean={clean}
      value={value}
      variant={variant}
      onClean={handleClear}
      labelText={labelText}
      placeholder={placeholder}
      labelBgColor={labelBgColor}
      labelClassName={labelClassName}
      size={size}
      LeftContent={LeftContent}
      RightContent={RightContent}
      hintLabel={hintLabel}
      hintValue={hintValue}
      errorMessage={errorMessage}
      className={className}
    >
      <input
        type={type}
        data-slot="input"
        placeholder=" "
        className={cn(
          'peer order-2 flex-1',
          'text-paragraph-p2 text-content-1 flex w-full min-w-0 border-none bg-transparent shadow-none outline-none transition-colors placeholder:text-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'focus:border-none focus:shadow-none focus:outline-none focus:ring-0',
          inputClassName,
        )}
        value={value}
        onChange={(event) => {
          onChange?.(event)
          onValueChange?.(event.target.value)
        }}
        {...inputProps}
      />
    </InputContainer>
  )
}
export { Input }
