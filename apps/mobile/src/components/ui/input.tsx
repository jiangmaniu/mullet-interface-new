import * as React from 'react'
import { TextInput, type TextInputProps, Platform } from 'react-native'

import { cn } from '@/lib/utils'
import { InputContainer, type InputContainerProps } from './input-container'
import { cva } from 'class-variance-authority'

const inputVariants = cva(
  cn(
    'flex-1 text-paragraph-p2 text-content-1 p-0 m-0', // Reset default padding and margin
    'h-full w-full bg-transparent outline-none border-none',
    'placeholder:text-transparent'), {
  variants: {
    size: {
      sm: 'leading-[17px]',
      md: 'leading-[20px]',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

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
      size = 'sm',
      LeftContent,
      RightContent,
      hintLabel,
      hintValue,
      errorMessage,
      className,
      displayLabelClassName,
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

    // 根据 size 设置不同的行高
    const lineHeight = size === 'md' ? 20 : 17

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
        displayLabelClassName={displayLabelClassName}
      >
        <TextInput
          ref={ref}
          placeholder=""
          className={cn(
            inputVariants({ size }),
            inputClassName,
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
