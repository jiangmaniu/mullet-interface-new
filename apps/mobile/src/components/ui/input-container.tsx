import * as React from 'react'
import {
  LayoutChangeEvent,
  View,
  Text,
  Pressable,
  TextInput,
} from 'react-native'
import { cva, VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { IconButton } from './button'
import { IconifyXmarkCircleSolid } from './icons'

const InputContainerVariants = cva('bg-transparent relative', {
  variants: {
    size: {
      sm: 'py-medium px-xl rounded-medium',
      md: 'rounded-small py-large px-xl'
    },
    variant: {
      default: '',
      outlined: 'border-zinc-base border'
    }
  },

  compoundVariants: [
    {
      variant: 'outlined',
      size: 'sm',
      className: 'py-medium px-xl'
    },
    {
      variant: 'outlined',
      size: 'md',
      className: 'py-large px-xl'
    }
  ],

  defaultVariants: {
    size: 'sm',
    variant: 'outlined'
  }
})

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type InputContainerProps<T = string> = Prettify<
  React.ComponentProps<typeof View> & {
    LeftContent?: React.ReactNode
    RightContent?: React.ReactNode
    clean?: boolean
    value?: T
    onClean?: () => void
    hintLabel?: React.ReactNode
    hintValue?: React.ReactNode
    inputClassName?: string
    children?: React.ReactElement
    block?: boolean
    errorMessage?: string
    /**
     * 标签文本（聚焦或有值时显示在左上角）
     * 如果未提供，则使用 placeholder 的值
     */
    labelText?: React.ReactNode | ((props: { isFocused: boolean }) => React.ReactNode)
    /**
     * 占位符文本（未聚焦且无值时显示在输入框中间）
     * 如果未提供，则使用 labelText 的值
     */
    placeholder?: React.ReactNode | ((props: { isFocused: boolean }) => React.ReactNode)
    /**
     * 标签背景色（浮动到上方时使用）
     * 默认值：#27272a (zinc-800)
     * 也可以通过 CSS 变量 --input-label-bg 全局设置
     */
    labelBgColor?: string
    /**
     * 标签浮动时的自定义类名（用于设置背景色等样式）
     * 注意：需要包含完整的 peer 修饰符
     * 例如：'peer-[:not(:placeholder-shown)]:bg-zinc-900 peer-focus:bg-zinc-900'
     * 或使用任意值：'peer-[:not(:placeholder-shown)]:bg-[#1a1f3a] peer-focus:bg-[#1a1f3a]'
     */
    labelClassName?: string
    /**
     * 标签浮动时的自定义类名（用于设置背景色等样式）
     * 注意：需要包含完整的 peer 修饰符
     * 例如：'peer-[:not(:placeholder-shown)]:bg-zinc-900 peer-focus:bg-zinc-900'
     * 或使用任意值：'peer-[:not(:placeholder-shown)]:bg-[#1a1f3a] peer-focus:bg-[#1a1f3a]'
     */
    displayLabelClassName?: string
    hideLabel?: boolean
  } & VariantProps<typeof InputContainerVariants>
>

const InputContainer = <T,>({
  size,
  variant,
  children,
  hintLabel,
  onClean,
  value,
  clean,
  hintValue,
  errorMessage,
  LeftContent,
  RightContent,
  className,
  labelText,
  placeholder,
  labelBgColor,
  displayLabelClassName,
  hideLabel = false,
  labelClassName,
  block = false,
  ...props
}: InputContainerProps<T>) => {
  const [isFocused, setIsFocused] = React.useState(false)
  const [leftContentWidth, setLeftContentWidth] = React.useState(0)
  const inputRef = React.useRef<TextInput>(null)

  const inputContainerVariantsClassName = InputContainerVariants({ size, variant })

  // 测量 LeftContent 的宽度
  const onLeftContentLayout = (event: LayoutChangeEvent) => {
    setLeftContentWidth(event.nativeEvent.layout.width)
  }

  // 点击容器时聚焦 input
  const handleContainerPress = () => {
    inputRef.current?.focus()
  }

  // 计算 label 的初始 left 位置（占位符状态）
  const labelInitialLeft = React.useMemo(() => {
    const paddingLeft = 12 // px-xl = 12px
    const gap = 8 // gap-medium = 8px
    if (LeftContent && leftContentWidth > 0) {
      return paddingLeft + leftContentWidth + gap
    }
    return paddingLeft // 20px = left-xl
  }, [LeftContent, leftContentWidth])

  // 计算应该显示的标签内容
  const hasValue = value !== undefined && value !== '' && value !== null
  const shouldFloat = isFocused || hasValue

  // 根据聚焦状态决定显示 labelText 还是 placeholder
  const displayLabelText = React.useMemo(() => {
    if (hideLabel) {
      if (isFocused || hasValue) {
        return null
      }
    }

    // 如果有值或聚焦，显示 labelText（如果没有则回退到 placeholder）
    if (shouldFloat) {
      return labelText || placeholder
    }

    // 如果没有值且未聚焦，显示 placeholder（如果没有则回退到 labelText）
    return placeholder || labelText
  }, [labelText, value, hasValue, isFocused, placeholder, hideLabel, shouldFloat])

  // 注入 ref 和事件处理到 children (Input)
  const validChildren = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
      ref: (node: any) => {
        // 保持原有 ref (如果有)
        const childRef = (children as any).ref
        if (typeof childRef === 'function') {
          childRef(node)
        } else if (childRef) {
          childRef.current = node
        }
        // 本地 ref
        inputRef.current = node
      },
      onFocus: (e: any) => {
        setIsFocused(true)
        const props = (children as React.ReactElement<any>).props
        if (props.onFocus) props.onFocus(e)
      },
      onBlur: (e: any) => {
        setIsFocused(false)
        const props = (children as React.ReactElement<any>).props
        if (props.onBlur) props.onBlur(e)
      }
    })
    : children

  const isFloating = shouldFloat && !(hideLabel && isFocused && !hasValue)

  return (
    <View
      className={cn(
        'gap-medium flex flex-col',
        {
          'w-full flex-1': block
        },
        className
      )}
      {...props}
    >
      {errorMessage && <Text className={cn('text-paragraph-p3 text-status-danger text-right')}>{errorMessage}</Text>}

      <Pressable
        className={cn(inputContainerVariantsClassName, 'gap-medium group relative flex flex-row cursor-text items-center transition-colors', {
          'border-brand-primary': isFocused
        })}
        style={
          labelBgColor
            ? ({
              '--input-label-bg': labelBgColor
            } as any) // React Native uses standard style objects, variable support depends on system
            : undefined
        }
        onPress={handleContainerPress}
      >
        {/* LeftContent */}
        {LeftContent && (
          <View onLayout={onLeftContentLayout} className="z-10 order-1 flex-shrink-0">
            {LeftContent}
          </View>
        )}

        {/* Input - 直接作为子元素，与 label 是兄弟关系 */}
        {validChildren}

        {/* Label - 紧跟 input，peer 才能工作，定位相对于容器 */}
        {displayLabelText && (
          <View
            className={cn(
              'absolute pointer-events-none',
              // 基础样式
              isFloating && 'top-0 -translate-y-1/2 left-xl px-xs bg-secondary', // 浮动状态: 上移，左对齐，背景色遮挡边框
              // 颜色
              isFocused ? 'text-brand-primary' : 'text-content-5',
              displayLabelClassName
            )}
            style={{
              left: isFloating ? 12 : labelInitialLeft, // 浮动时固定左侧 padding，占位时跟随 LeftContent
              transform: [
                { translateY: isFloating ? -9 : 0 } // RN translate logic needs explicit values or style adjustment.
                // actually standard flex centering handles 'top-1/2 -translate-y-1/2' via className if nativewind supports it.
                // Manual adjustment for better precision:
              ]
            }}
          >
            <Text className={cn(
              'text-paragraph-p2 transition-all duration-200 text-content-4',
              isFloating && 'text-xs', // scale-80 approx
              isFocused && 'text-brand-primary',
              !isFloating && 'text-content-5',
              labelClassName
            )}>
              {typeof displayLabelText === 'function' ? displayLabelText({ isFocused }) : displayLabelText}
            </Text>
          </View>
        )}

        {/* Clean Button */}
        {!!clean && !!value && (
          <View className="z-10 order-3 ml-auto">
            <IconButton className="rounded-full" variant="ghost" onPress={onClean}>
              <IconifyXmarkCircleSolid width={12} height={12} color='#ffffff' />
            </IconButton>
          </View>
        )}

        {/* RightContent */}
        {RightContent && <View className="z-10 order-4 flex-shrink-0">{RightContent}</View>}
      </Pressable>

      {(hintLabel || hintValue) && (
        <View className={cn('text-paragraph-p3 flex flex-row justify-between gap-2')}>
          {hintLabel && <Text className="text-content-4 self-start"> {hintLabel}</Text>}
          {hintValue && <Text className="text-content-1 self-end">{hintValue}</Text>}
        </View>
      )}
    </View>
  )
}

export { InputContainer }
