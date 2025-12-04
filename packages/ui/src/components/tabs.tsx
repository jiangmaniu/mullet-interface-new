'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as React from 'react'
import { cva, VariantProps } from 'class-variance-authority'
import { isNumber } from 'lodash-es'

import { cn } from '@mullet/ui/lib/utils'

const TabsVariants = cva('', {
  variants: {
    variant: {
      outline: [],
      solid: '',
      underline: '',
      iconsAndText: '',
      text: '',
    },
    size: {
      sm: '',
      md: '',
    },
  },
  defaultVariants: {
    variant: 'underline',
  },
})

type TabsVariantsProps = VariantProps<typeof TabsVariants>
type TabsContextValue = TabsVariantsProps & {
  onValueChange?: (value: string) => void
  triggerOnPointerUp?: boolean
}

const TabsVariantsContext = React.createContext<TabsContextValue>({
  variant: 'underline',
})

const useTabsVariantsContext = (): TabsContextValue => {
  const context = React.useContext(TabsVariantsContext)

  if (!context) {
    throw new Error('useTabsVariants must be used within a Tabs')
  }

  return context
}

type TabsProps<T> = Omit<React.ComponentProps<typeof TabsPrimitive.Root>, 'value' | 'onValueChange'> & {
  value: T
  onValueChange: (value: T) => void
  /**
   * 是否在鼠标抬起时触发选中，默认为 false（按下时触发）
   */
  triggerOnPointerUp?: boolean
} & VariantProps<typeof TabsVariants>

function Tabs<T>({
  className,
  value,
  variant,
  activationMode = 'manual',
  triggerOnPointerUp = false,
  onValueChange,
  ...props
}: TabsProps<T>) {
  const tabsVariantsClassName = TabsVariants({ variant })

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (isNumber(value)) {
        onValueChange?.(Number(newValue) as T)
      } else {
        onValueChange?.(newValue as T)
      }
    },
    [value, onValueChange],
  )

  return (
    <TabsVariantsContext.Provider value={{ variant, onValueChange: handleValueChange, triggerOnPointerUp }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        value={value as string}
        onValueChange={handleValueChange}
        activationMode={activationMode}
        className={cn('flex flex-col', tabsVariantsClassName, className)}
        {...props}
      />
    </TabsVariantsContext.Provider>
  )
}

const TabsListVariants = cva('flex items-center', {
  variants: {
    variant: {
      underline: 'border-b border-zinc-xs',
      iconsAndText: '',
      solid: '',
      outline: [],
      text: '',
    },
    size: {
      sm: 'gap-medium',
      md: 'gap-medium',
    },
  },

  compoundVariants: [
    {
      variant: 'text',
      size: 'md',
      className: 'py-xs',
    },
  ],

  defaultVariants: {
    variant: 'underline',
    size: 'sm',
  },
})

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof TabsListVariants>

function TabsList({ className, variant, ...props }: TabsListProps) {
  const { variant: tabsVariants } = useTabsVariantsContext()
  const tabsListVariantsClassName = TabsListVariants({ variant: variant ?? tabsVariants })

  return (
    <TabsPrimitive.List data-slot="tabs-list" className={cn(tabsListVariantsClassName, '', className)} {...props} />
  )
}

const TabsTargetVariants = cva('bg-transparent', {
  variants: {
    variant: {
      underline: [''],
      iconsAndText: [],
      solid: [],
      outline: [],
      text: '',
    },
    size: {
      sm: '',
      md: '',
    },
  },

  defaultVariants: {
    variant: 'underline',
    size: 'sm',
  },
})

const TabsTargetContentVariants = cva('cursor-pointer', {
  variants: {
    variant: {
      underline: [
        'text-content-4 border-b-2 border-transparent transition-all',
        'group-hover:text-content-1',
        'group-active:text-content-1',
        'group-data-[state=active]:border-brand-primary group-data-[state=active]:text-content-1',
      ],
      outline: [
        'text-content-4 border border-transparent',
        'group-hover:shadow-base group-hover:text-content-1',
        'group-active:border-white-base group-active:text-content-1',
        'group-data-[state=active]:border-zinc-large group-data-[state=active]:text-content-1',
      ],
      iconsAndText: [
        'border border-transparent py-1 px-3  flex gap-2 items-center bg-zinc-300/20 transition-all',
        'hover:border hover:border-white',
        'active:bg-transparent',
        ['group-data-[state=active]:bg-transparent group-data-[state=active]:border-zinc-base'],
      ],
      solid: [
        'bg-zinc-300/20 text-content-4 ',
        'group-hover:shadow-base group-hover:text-content-1',
        'group-active:bg-zinc-300/40 group-active:text-content-1',
        'group-data-[state=active]:bg-brand-primary group-data-[state=active]:text-content-foreground',
      ],
      text: [
        'text-content-4',
        'group-hover:text-content-1',
        'group-active:text-content-1',
        'group-data-[state=active]:text-content-1',
      ],
    },
    size: {
      sm: '',
      md: '',
    },
  },

  compoundVariants: [
    {
      variant: 'iconsAndText',
      size: 'sm',
      class: 'rounded-xs',
    },
    {
      variant: 'iconsAndText',
      size: 'md',
      class: ['rounded-2 text-button-2'],
    },

    {
      variant: 'underline',
      size: 'sm',
      class: ['py-medium px-2xl  text-button-1'],
    },

    {
      variant: 'underline',
      size: 'md',
      class: ['py-xl px-3xl  text-button-2'],
    },

    {
      variant: 'text',
      size: 'sm',
      class: ['py-xs px-xs  text-button-1'],
    },

    {
      variant: 'text',
      size: 'md',
      class: ['py-medium px-xs  text-button-2'],
    },

    {
      variant: 'solid',
      size: 'sm',
      class: ['py-small px-2xl rounded-small text-button-1'],
    },

    {
      variant: 'solid',
      size: 'md',
      class: ['py-medium px-3xl rounded-small text-button-2'],
    },

    {
      variant: 'outline',
      size: 'sm',
      class: ['py-small px-2xl rounded-small text-button-1'],
    },

    {
      variant: 'outline',
      size: 'md',
      class: ['py-medium px-3xl rounded-small text-button-2'],
    },
  ],

  defaultVariants: {
    variant: 'underline',
    size: 'md',
  },
})

type TabsTargetProps<T> = Omit<React.ComponentProps<typeof TabsPrimitive.Trigger>, 'value'> & {
  value: T
} & VariantProps<typeof TabsTargetContentVariants> & {
    contentClassName?: string
  }

function TabsTrigger<T>({ className, contentClassName, value, variant, ...props }: TabsTargetProps<T>) {
  const { variant: tabsVariants, triggerOnPointerUp, onValueChange } = useTabsVariantsContext()
  const [isPointerDown, setIsPointerDown] = React.useState(false)

  const tabsTargetVariantsClassName = TabsTargetVariants({ variant: variant ?? tabsVariants })
  const tabsTargetContentVariantsClassName = TabsTargetContentVariants({ variant: variant ?? tabsVariants })

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (triggerOnPointerUp) {
        e.preventDefault()
        setIsPointerDown(true)
      }
      props.onPointerDown?.(e)
    },
    [triggerOnPointerUp, props],
  )

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (triggerOnPointerUp && isPointerDown) {
        onValueChange?.(value as string)
        setIsPointerDown(false)
      }
      props.onPointerUp?.(e)
    },
    [triggerOnPointerUp, isPointerDown, onValueChange, value, props],
  )

  const handlePointerLeave = React.useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (triggerOnPointerUp) {
        setIsPointerDown(false)
      }
      props.onPointerLeave?.(e)
    },
    [triggerOnPointerUp, props],
  )

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      value={value as string}
      className={cn([tabsTargetVariantsClassName, 'group', className])}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      <div className={cn([tabsTargetContentVariantsClassName, '', contentClassName])}>{props.children}</div>
    </TabsPrimitive.Trigger>
  )
}

function TabsContent<T>({
  className,
  value,
  ...props
}: Omit<React.ComponentProps<typeof TabsPrimitive.Content>, 'value'> & {
  value: T
}) {
  return (
    <TabsPrimitive.Content
      value={value as string}
      data-slot="tabs-content"
      className={cn('flex-1 outline-none data-[state=inactive]:hidden', className)}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
