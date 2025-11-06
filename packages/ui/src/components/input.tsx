import * as React from 'react'

import { cn } from '../lib/utils'
import { Button } from './button'
import { IconClose } from './icons'

export type InputProps = React.ComponentProps<'input'> & {
  LeftContent?: React.ReactNode
  RightContent?: React.ReactNode
  clean?: boolean
  onValueChange?: (value: string) => void
  inputClassName?: string
}

function Input({
  className,
  type,
  inputClassName,
  LeftContent,
  onChange,
  onValueChange,
  clean = true,
  value,
  RightContent,
  ...props
}: InputProps) {
  const handleClear = () => {
    onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
    onValueChange?.('')
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 border border-[#3B3D52]',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        'rounded-[8px]',
        'px-3.5 py-3',
        'text-[14px] text-white',
        'selection:bg-[#3B3D52] selection:text-white',
        className,
      )}
    >
      {LeftContent}

      <input
        type={type}
        data-slot="input"
        className={cn(
          'file:text-foreground shadow-xs flex w-full min-w-0 bg-transparent leading-normal outline-none transition-[color,box-shadow] placeholder:text-[#767783] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
          inputClassName,
        )}
        value={value}
        onChange={(event) => {
          onChange?.(event)
          onValueChange?.(event.target.value)
        }}
        {...props}
      />

      {clean && value && (
        <Button className="rounded-full bg-[#3B3D52] p-0.5" size={'icon'} onClick={handleClear}>
          <IconClose size={10} />
        </Button>
      )}

      {RightContent}
    </div>
  )
}
export { Input }
