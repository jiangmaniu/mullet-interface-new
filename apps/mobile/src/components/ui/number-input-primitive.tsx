import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  numericFormatter,
  removeNumericFormat,
} from 'react-number-format'
import type { NumberFormatValues, NumericFormatProps } from 'react-number-format'
import { isUndefined } from 'lodash-es'
import { TextInput, type TextInputProps } from 'react-native'

import { BNumber } from '@mullet/utils/number'
import { cn } from '@/lib/utils'

// TODO: Unable to import `SourceType` enumeration directly from `react-number-format`
export enum NumberInputSourceType {
  EVENT = 'event',
  PROPS = 'prop',
}

export type NumberInputSourceInfo = {
  source: NumberInputSourceType
}

export type OnValueChange = (values: NumberFormatValues, sourceInfo: NumberInputSourceInfo) => void

export type NumberInputPrimitiveProps = Omit<TextInputProps, 'value' | 'onChangeText' | 'onChange'> & {
  onValueChange?: OnValueChange
  max?: number | string
  min?: number | string
  decimalPlaceholder?: boolean
  value?: string
  defaultValue?: string
  allowNegative?: boolean
  valueIsNumericString?: boolean
  thousandSeparator?: string | boolean
  decimalSeparator?: string
  allowedDecimalSeparators?: string[]
  decimalScale?: number
  fixedDecimalScale?: boolean
  allowLeadingZeros?: boolean
  prefix?: string
  suffix?: string
  disabled?: boolean
  isAllowed?: (values: NumberFormatValues) => boolean
}

// 将纯数字字符串格式化为带千分位的显示字符串
function formatValue(numStr: string, config: NumericFormatProps): string {
  if (!numStr && numStr !== '0') return ''
  return numericFormatter(numStr, config)
}

// 从格式化后的字符串提取纯数字字符串
function removeFormat(formattedValue: string, config: NumericFormatProps): string {
  if (!formattedValue) return ''
  return removeNumericFormat(formattedValue, undefined as any, config)
}

// 从纯数字字符串构造 NumberFormatValues
function getValues(numStr: string, config: NumericFormatProps): NumberFormatValues {
  const formattedValue = formatValue(numStr, config)
  const floatValue = numStr ? parseFloat(numStr) : undefined
  return {
    formattedValue,
    value: numStr,
    floatValue: isNaN(floatValue!) ? undefined : floatValue,
  }
}

const NumberInputPrimitiveBase = ({
  className,
  allowNegative = false,
  thousandSeparator = ',',
  onValueChange,
  decimalPlaceholder = false,
  max,
  allowedDecimalSeparators = ['。'],
  onFocus,
  onBlur,
  inputMode = 'decimal',
  placeholder,
  decimalScale,
  fixedDecimalScale = false,
  allowLeadingZeros = true,
  prefix = '',
  suffix = '',
  value: propValue,
  defaultValue,
  disabled,
  keyboardType = 'decimal-pad',
  isAllowed,
  ...props
}: NumberInputPrimitiveProps) => {
  const inputRef = useRef<TextInput>(null)
  // 用于强制 RN TextInput 在值未变时也能回退原生显示
  const [, forceRender] = useState(0)

  const decimalPlaceholderLabel = !isUndefined(decimalScale) && decimalScale > 0 ? `0.${'0'.repeat(decimalScale)}` : '0'
  const placeholderLabel = placeholder ?? (decimalPlaceholder ? decimalPlaceholderLabel : undefined)

  const formatConfig: NumericFormatProps = {
    thousandSeparator,
    decimalSeparator: '.',
    allowNegative,
    allowLeadingZeros,
    decimalScale,
    fixedDecimalScale,
    prefix,
    suffix,
  }

  // 内部维护显示值，避免 RN TextInput 受控模式下 props 往返导致的闪烁
  const [displayValue, setDisplayValue] = useState(() => {
    const raw = propValue ?? defaultValue ?? ''
    if (!raw && raw !== '0') return ''
    return formatValue(String(raw), formatConfig)
  })

  // props 变化时同步内部状态
  useEffect(() => {
    const raw = propValue ?? defaultValue ?? ''
    if (!raw && raw !== '0') {
      setDisplayValue('')
    } else {
      setDisplayValue(formatValue(String(raw), formatConfig))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propValue, defaultValue, thousandSeparator, decimalScale, fixedDecimalScale, prefix, suffix, allowNegative, allowLeadingZeros])

  // 处理文本输入变化
  const handleChangeText = useCallback((text: string) => {
    // 替换中文句号等为小数点
    let processedText = text
    if (allowedDecimalSeparators) {
      for (const sep of allowedDecimalSeparators) {
        processedText = processedText.replace(new RegExp(sep, 'g'), '.')
      }
    }

    // 提取纯数字字符串
    let numStr = removeFormat(processedText, formatConfig)

    // 处理只输入 "." 的情况
    if (numStr === '.') {
      numStr = ''
    }

    // 是否被 max 截断的标记
    let clampedToMax = false

    // max 约束（先于小数截断，超过 max 直接使用 max）
    if (!isUndefined(max) && numStr) {
      const valueForBN = BNumber.from(numStr || 0)
      const maxForBN = BNumber.from(max || 0)

      if (valueForBN.gt(maxForBN)) {
        numStr = maxForBN.toString()
        clampedToMax = true
      }
    }

    // 超过小数位数时：整数部分与 max 一致且未超过 max → 直接使用 max；否则截断小数
    if (!clampedToMax && !isUndefined(max) && !isUndefined(decimalScale) && numStr.includes('.')) {
      const parts = numStr.split('.')
      if (parts[1] && parts[1].length > decimalScale) {
        const maxStr = String(max)
        const maxIntPart = maxStr.includes('.') ? maxStr.split('.')[0] : maxStr
        // 仅整数部分一致时才自动填充 max
        if (parts[0] === maxIntPart) {
          const maxForBN = BNumber.from(max || 0)
          const valueForBN = BNumber.from(numStr || 0)
          if (valueForBN.lte(maxForBN)) {
            numStr = maxForBN.toString()
            clampedToMax = true
          }
        }
      }
    }

    // 限制小数位数：仅在未被 max 截断时应用
    if (!clampedToMax && !isUndefined(decimalScale) && numStr.includes('.')) {
      const parts = numStr.split('.')
      if (parts[1] && parts[1].length > decimalScale) {
        parts[1] = parts[1].slice(0, decimalScale)
      }
      numStr = parts.join('.')
    }

    const values = getValues(numStr, formatConfig)

    // 自定义 isAllowed 校验
    if (isAllowed && !isAllowed(values)) {
      // 强制重新渲染，让 RN TextInput 回退到当前有效显示值
      forceRender(n => n + 1)
      return
    }

    // 同步更新内部显示值
    if (values.formattedValue !== displayValue) {
      setDisplayValue(values.formattedValue)
    } else {
      // 值未变（如已在 max 继续输入），强制重新渲染让 TextInput 回退
      forceRender(n => n + 1)
    }
    onValueChange?.(values, { source: NumberInputSourceType.EVENT })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onValueChange, max, displayValue, decimalScale, allowedDecimalSeparators, isAllowed, thousandSeparator, prefix, suffix, allowNegative, allowLeadingZeros])

  // onBlur 时处理 fixedDecimalScale、清理前导零
  const handleBlur = useCallback<NonNullable<TextInputProps['onBlur']>>((e) => {
    let numStr = removeFormat(displayValue, formatConfig)

    // 清空无数字的值
    if (!numStr.match(/\d/g)) {
      numStr = ''
    }

    // 清理前导零（保留 "0" 和 "0.xxx"）
    if (!allowLeadingZeros && numStr) {
      numStr = numStr.replace(/^0+(?=\d)/, '')
    }

    // 应用 fixedDecimalScale
    if (fixedDecimalScale && decimalScale && numStr) {
      const parts = numStr.split('.')
      const intPart = parts[0] || '0'
      const decPart = (parts[1] || '').padEnd(decimalScale, '0').slice(0, decimalScale)
      numStr = `${intPart}.${decPart}`
    }

    const currentNumStr = removeFormat(displayValue, formatConfig)
    if (numStr !== currentNumStr) {
      const values = getValues(numStr, formatConfig)
      setDisplayValue(values.formattedValue)
      onValueChange?.(values, { source: NumberInputSourceType.EVENT })
    }

    onBlur?.(e)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayValue, fixedDecimalScale, decimalScale, allowLeadingZeros, onValueChange, onBlur, thousandSeparator, prefix, suffix, allowNegative])

  const handleFocus = useCallback<NonNullable<TextInputProps['onFocus']>>((e) => {
    onFocus?.(e)
  }, [onFocus])

  return (
    <TextInput
      ref={inputRef}
      className={cn('w-full bg-transparent', className)}
      value={displayValue}
      onChangeText={handleChangeText}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholderLabel as string}
      placeholderTextColor="transparent"
      keyboardType={keyboardType}
      inputMode={inputMode}
      editable={!disabled}
      {...props}
    />
  )
}

NumberInputPrimitiveBase.displayName = NumberInputPrimitiveBase.name

export const NumberInputPrimitive = NumberInputPrimitiveBase
