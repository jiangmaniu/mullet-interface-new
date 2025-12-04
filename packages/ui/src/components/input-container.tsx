import * as React from 'react'
import { cva, VariantProps } from 'class-variance-authority'

import { cn } from '../lib/utils'
import { Button } from './button'
import { IconClose } from './icons'

const InputContainerVariants = cva('bg-transparent relative', {
  variants: {
    size: {
      sm: 'py-medium px-xl rounded-small',
      md: 'rounded-small py-large px-xl',
    },
    variant: {
      default: '',
      outlined: 'border-zinc-base border',
    },
  },

  compoundVariants: [
    {
      variant: 'outlined',
      size: 'sm',
      className: 'py-medium px-xl',
    },
    {
      variant: 'outlined',
      size: 'md',
      className: 'py-large px-xl',
    },
  ],

  defaultVariants: {
    size: 'sm',
    variant: 'outlined',
  },
})

export type InputContainerProps = React.ComponentProps<'div'> & {
  LeftContent?: React.ReactNode
  RightContent?: React.ReactNode
  clean?: boolean
  value?: string | number | readonly string[]
  onClean?: () => void
  hintLabel?: React.ReactNode
  hintValue?: React.ReactNode
  inputClassName?: string
  children?: React.ReactNode
  errorMessage?: string
  /**
   * 标签文本（聚焦或有值时显示在左上角）
   * 如果未提供，则使用 placeholder 的值
   */
  labelText?: string | ((props: { isFocused: boolean }) => React.ReactNode)
  /**
   * 占位符文本（未聚焦且无值时显示在输入框中间）
   * 如果未提供，则使用 labelText 的值
   */
  placeholder?: string | ((props: { isFocused: boolean }) => React.ReactNode)
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
} & VariantProps<typeof InputContainerVariants>

const InputContainer = ({
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
  labelClassName,
  ...props
}: InputContainerProps) => {
  const [isFocused, setIsFocused] = React.useState(false)
  const [leftContentWidth, setLeftContentWidth] = React.useState(0)
  const inputRef = React.useRef<HTMLDivElement>(null)
  const leftContentRef = React.useRef<HTMLDivElement>(null)
  const inputContainerVariantsClassName = InputContainerVariants({ size, variant })

  // 测量 LeftContent 的宽度
  React.useLayoutEffect(() => {
    if (leftContentRef.current) {
      const width = leftContentRef.current.offsetWidth
      setLeftContentWidth(width)
    }
  }, [LeftContent])

  // 使用 ResizeObserver 监听 LeftContent 尺寸变化
  React.useEffect(() => {
    const element = leftContentRef.current
    if (!element) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width
        setLeftContentWidth(width)
      }
    })

    resizeObserver.observe(element)

    return () => {
      resizeObserver.disconnect()
    }
  }, [LeftContent])

  // 点击容器时聚焦 input
  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement

    // 检查是否点击了 input 本身
    const input = inputRef.current?.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement | null
    if (!input) return

    const isInputElement = target === input || input.contains(target)
    if (isInputElement) return // input 本身的点击让浏览器处理

    // 检查是否点击了清除按钮或其子元素
    const isCleanButton = target.closest('[data-clean-button]')
    if (isCleanButton) return // 清除按钮不聚焦

    // 其他任何位置都聚焦 input
    input.focus()
  }

  // 按下时也聚焦，响应更快
  const handleContainerMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement

    // 检查是否点击了 input 本身
    const input = inputRef.current?.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement | null
    if (!input) return

    const isInputElement = target === input || input.contains(target)
    if (isInputElement) return // input 本身的点击让浏览器处理

    // 检查是否点击了清除按钮或其子元素
    const isCleanButton = target.closest('[data-clean-button]')
    if (isCleanButton) return // 清除按钮不聚焦

    // 阻止默认行为，避免容器获得焦点
    e.preventDefault()
    // 其他任何位置都聚焦 input
    input.focus()
  }

  // 计算 label 的初始 left 位置（占位符状态）
  const labelInitialLeft = React.useMemo(() => {
    const paddingLeft = 12 // px-xl = 12px
    const gap = 8 // gap-medium = 8px
    if (LeftContent && leftContentWidth > 0) {
      return `${paddingLeft + leftContentWidth + gap}px`
    }
    return `${paddingLeft}px` // 20px = left-xl
  }, [LeftContent, leftContentWidth])

  // 计算应该显示的标签内容
  const hasValue = value !== undefined && value !== '' && value !== null
  const shouldFloat = isFocused || hasValue

  // 根据聚焦状态决定显示 labelText 还是 placeholder
  const displayLabel = React.useMemo(() => {
    // 如果有值或聚焦，显示 labelText（如果没有则回退到 placeholder）
    if (shouldFloat) {
      return labelText || placeholder
    }

    // 如果没有值且未聚焦，显示 placeholder（如果没有则回退到 labelText）
    return placeholder || labelText
  }, [labelText, placeholder, shouldFloat])

  return (
    <div className={cn('gap-medium flex flex-col', className)} {...props}>
      {errorMessage && <div className={cn('text-paragraph-p3 text-status-danger text-right')}>{errorMessage}</div>}

      <div
        ref={inputRef}
        className={cn(
          inputContainerVariantsClassName,
          'gap-medium group relative flex cursor-text items-center transition-colors',
          {
            'border-brand-primary': isFocused,
          },
        )}
        style={
          labelBgColor
            ? ({
                '--input-label-bg': labelBgColor,
              } as React.CSSProperties)
            : undefined
        }
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseDown={handleContainerMouseDown}
        onClick={handleContainerClick}
      >
        {/* LeftContent */}
        {LeftContent && (
          <div ref={leftContentRef} className="z-10 order-1 flex-shrink-0">
            {LeftContent}
          </div>
        )}

        {/* Input - 直接作为子元素，与 label 是兄弟关系 */}
        {children}

        {/* Label - 紧跟 input，peer 才能工作，定位相对于容器 */}
        {displayLabel && (
          <label
            className={cn(
              'text-paragraph-p2 text-content-5 pointer-events-none absolute transition-all duration-200 ease-out',
              'top-1/2 origin-left -translate-y-1/2',
              // 有值时（placeholder 不显示）→ label 浮动到容器左上角并缩小，颜色灰色
              'peer-[:not(:placeholder-shown)]:!left-xl peer-[:not(:placeholder-shown)]:px-xs peer-[:not(:placeholder-shown)]:text-content-5 peer-[:not(:placeholder-shown)]:scale-80 peer-[:not(:placeholder-shown)]:-top-[9px] peer-[:not(:placeholder-shown)]:translate-y-0',
              // 聚焦时 → 覆盖上面的样式，颜色变为品牌色（必须在后面，优先级更高）
              'peer-focus:!left-xl peer-focus:px-xs peer-focus:!text-brand-primary peer-focus:-top-[9px] peer-focus:translate-y-0 peer-focus:scale-90',
              // 默认背景色（如果没有提供自定义类）
              !labelClassName &&
                'peer-focus:bg-[var(--input-label-bg,#27272a)] peer-[:not(:placeholder-shown)]:bg-[var(--input-label-bg,#27272a)]',
              // 自定义类（外部传入，需要包含完整的 peer 修饰符）
              labelClassName,
            )}
            style={{
              left: labelInitialLeft,
            }}
          >
            {typeof displayLabel === 'function' ? displayLabel({ isFocused }) : displayLabel}
          </label>
        )}

        {/* Clean Button */}
        {!!clean && !!value && (
          <Button
            data-clean-button
            className="z-10 order-3 rounded-full bg-[#3B3D52] p-0.5"
            size={'icon'}
            onClick={onClean}
          >
            <IconClose size={10} />
          </Button>
        )}

        {/* RightContent */}
        {RightContent && <div className="text-paragraph-p2 text-content-1 z-10 order-4">{RightContent}</div>}
      </div>

      {(hintLabel || hintValue) && (
        <div className={cn('text-paragraph-p3 flex justify-between gap-2')}>
          {hintLabel && <div className="text-content-4 self-start"> {hintLabel}</div>}
          {hintValue && <div className="text-content-1 self-end">{hintValue}</div>}
        </div>
      )}
    </div>
  )
}

export { InputContainer }
