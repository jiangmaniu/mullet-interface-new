import * as React from 'react'
import { TextInput, type TextInputProps, Platform } from 'react-native'

import { cn } from '@/lib/utils'
import { InputContainer, type InputContainerProps } from './input-container'

export type InputProps = Omit<TextInputProps, 'placeholder'> &
  Omit<InputContainerProps, 'children' | 'value'> & {
    inputClassName?: string
    onValueChange?: (value: string) => void
    value?: string
  }

const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      inputClassName,
      onChangeText,
      onValueChange,
      clean = true,
      onClean,
      value,
      variant,
      // InputContainer props
      labelText,
      placeholder,
      labelBgColor,
      hideLabel,
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
    },
    ref
  ) => {
    const handleClear = () => {
      onChangeText?.('')
      onValueChange?.('')
      onClean?.()
    }

    return (
      <InputContainer
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
        hideLabel={hideLabel}
        hintValue={hintValue}
        errorMessage={errorMessage}
        className={className}
      >
        <TextInput
          ref={ref}
          placeholder="" 
          className={cn(
            'flex-1 text-paragraph-p2 text-content-1 p-0', // Reset default padding
            'h-full w-full bg-transparent outline-none border-none',
            'placeholder:text-transparent', // Hide native placeholder if we are using floating label
             inputClassName
          )}
          value={value}
          onChangeText={(text) => {
            onChangeText?.(text)
            onValueChange?.(text)
          }}
          placeholderTextColor="transparent" // Ensure placeholder is hidden for floating label logic
          {...inputProps}
        />
      </InputContainer>
    )
  }
)

Input.displayName = 'Input'

export { Input }
