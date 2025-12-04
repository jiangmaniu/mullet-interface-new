'use client'

import * as SliderPrimitive from '@radix-ui/react-slider'
import * as React from 'react'

import { BNumber } from '@mullet/utils/number'

import { cn } from '../lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  showTooltip?: boolean
  tooltipFormat?: (value: number[]) => React.ReactNode
  markLabelFormat?: (value: number) => React.ReactNode
  interval?: number
  isShowMarks?: boolean
  isShowMarkLabels?: boolean
}

export const SliderTooltip = React.forwardRef<React.ComponentRef<typeof SliderPrimitive.Root>, SliderProps>(
  (
    {
      className,
      showTooltip = false,
      isShowMarks = false,
      markLabelFormat,
      isShowMarkLabels = false,
      onValueChange,
      tooltipFormat,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = React.useState<number[]>(
      (props.defaultValue as number[]) ?? (props.value as number[]) ?? [0],
    )
    const [innerInterval] = React.useState<number>(props.interval ?? props.step ?? 25)
    const numberOfMarks = Math.floor((props.max ?? 100) / innerInterval) + 1
    console.log(numberOfMarks, innerInterval)
    // debugger
    const marks = Array.from({ length: numberOfMarks }, (_, i) => i * innerInterval)

    React.useEffect(() => {
      if (props.value) {
        setValue(props.value)
      }
    }, [props.value])

    function tickIndex(value: number): number {
      // Calculate the index based on the value
      return Math.floor(value / innerInterval)
    }

    function calculateTickPercent(index: number, max: number): number {
      // Calculate the percentage from left of the slider's width
      const percent = ((index * innerInterval) / max) * 100
      return percent
    }

    function handleValueChange(v: number[]) {
      setValue(v)
      if (onValueChange) onValueChange(v)
    }

    const [showTooltipState, setShowTooltipState] = React.useState(false)
    const handlePointerDown = () => {
      setShowTooltipState(true)
    }

    const handlePointerUp = () => {
      setShowTooltipState(false)
    }

    React.useEffect(() => {
      document.addEventListener('pointerup', handlePointerUp)
      return () => {
        document.removeEventListener('pointerup', handlePointerUp)
      }
    }, [])

    return (
      <SliderPrimitive.Root
        data-slot="slider"
        ref={ref}
        className={cn('group flex w-full touch-none select-none items-center', className)}
        onValueChange={handleValueChange}
        onPointerDown={handlePointerDown}
        {...props}
      >
        <SliderPrimitive.Track data-slot="slider-track" className={cn('relative grow')}>
          <div
            className={cn(
              'relative',
              'group-data-[orientation=horizontal]:h-2.5 group-data-[orientation=vertical]:h-full group-data-[orientation=horizontal]:w-full group-data-[orientation=vertical]:w-1.5',
            )}
          >
            <div className="flex h-full w-full items-center">
              <div className="h-0.5 w-full flex-1 bg-[#3B3D52]"></div>
            </div>
            <SliderPrimitive.Range
              data-slot="slider-range"
              className={cn(
                'absolute top-1/2 -translate-y-1/2 bg-[#EED94C] data-[orientation=horizontal]:h-0.5 data-[orientation=vertical]:w-full',
              )}
            />
            {isShowMarks && (
              <>
                {marks.map((_, i) => (
                  <div
                    id={`${i}`}
                    key={`${i}`}
                    role="presentation"
                    className={cn('absolute top-1/2 h-2.5 w-2.5 rounded-full text-sm', {
                      'text-secondary bg-[#3B3D52]': i > tickIndex(value[0]!),
                      'text-primary bg-[#EED94C]': i <= tickIndex(value[0]!),
                    })}
                    style={{
                      left: `${calculateTickPercent(i, props.max ?? 100)}%`,
                      transform: `translate(-${calculateTickPercent(i, props.max ?? 100)}%, -50%)`,
                    }}
                  />
                ))}
              </>
            )}

            <div className="absolute top-1/2 h-3.5 w-full -translate-y-1/2">
              <TooltipProvider>
                <Tooltip open={showTooltip && showTooltipState}>
                  <TooltipTrigger asChild>
                    <SliderPrimitive.Thumb
                      data-slot="slider-thumb"
                      className="ring-ring/50 focus-visible:outline-hidden block size-3.5 shrink-0 rounded-full border-2 border-[#EED94C] bg-[#0E123A] shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50"
                      onMouseEnter={() => setShowTooltipState(true)}
                      onMouseLeave={() => setShowTooltipState(false)}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="mb-1 w-auto p-2">
                    {tooltipFormat ? tooltipFormat(value) : <div className="font-medium">{value[0]}%</div>}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          {isShowMarkLabels && (
            <div className="relative mt-2.5 flex h-3.5">
              {marks.map((mark, i) => {
                console.log(mark, i)
                return (
                  <div
                    key={`${i}`}
                    className={cn(
                      'absolute top-0 cursor-pointer select-none text-xs text-[#9FA0B0] transition-colors',
                      {
                        'text-white': BNumber.from(value[0])?.gte(mark),
                        '-translate-x-1/2': i > 0 && i < marks.length - 1,
                        '-translate-x-full': i === marks.length - 1,
                        'translate-x-0': i === 0,
                      },
                    )}
                    style={{
                      left: `${(mark / (props.max ?? 100)) * 100}%`,
                      zIndex: 10,
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleValueChange([mark])
                    }}
                    onPointerDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleValueChange([mark])
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleValueChange([mark])
                    }}
                  >
                    {markLabelFormat ? markLabelFormat(mark) : <div className="">{mark}%</div>}
                  </div>
                )
              })}
            </div>
          )}
        </SliderPrimitive.Track>
      </SliderPrimitive.Root>
    )
  },
)

SliderTooltip.displayName = 'SliderTooltip'
