'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as React from 'react'
import { cva, VariantProps } from 'class-variance-authority'
import { isNumber } from 'lodash-es'

import { cn } from '@mullet/ui/lib/utils'

const TabsVariants = cva('', {
  variants: {
    variant: {
      line: '',
      iconsAndText: '',
    },
    size: {
      sm: '',
      md: '',
    },
  },
  defaultVariants: {
    variant: 'line',
  },
})

type TabsVariantsProps = VariantProps<typeof TabsVariants>
const TabsVariantsContext = React.createContext<TabsVariantsProps>({
  variant: 'line',
})

const useTabsVariantsContext = (): TabsVariantsProps => {
  const context = React.useContext(TabsVariantsContext)

  if (!context) {
    throw new Error('useTabsVariants must be used within a Tabs')
  }

  return context
}

type TabsProps<T> = Omit<React.ComponentProps<typeof TabsPrimitive.Root>, 'value' | 'onValueChange'> & {
  value: T
  onValueChange: (value: T) => void
} & VariantProps<typeof TabsVariants>

function Tabs<T>({ className, value, variant, onValueChange, ...props }: TabsProps<T>) {
  const tabsVariantsClassName = TabsVariants({ variant })
  return (
    <TabsVariantsContext.Provider value={{ variant }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        value={value as string}
        onValueChange={(newValue) => {
          if (isNumber(value)) {
            onValueChange?.(Number(newValue) as T)
          } else {
            onValueChange?.(newValue as T)
          }
        }}
        className={cn('flex flex-col', tabsVariantsClassName, className)}
        {...props}
      />
    </TabsVariantsContext.Provider>
  )
}

const TabsListVariants = cva('', {
  variants: {
    variant: {
      line: 'px-2.5 border-b border-[#23253C] inline-flex items-center',
      iconsAndText: '',
    },
    size: {
      sm: '',
      md: '',
    },
  },
  defaultVariants: {
    variant: 'line',
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
      line: ['px-5 cursor-pointer text-[#9FA0B0] active:scale-95 transition-transform'],
      iconsAndText: [],
    },
    size: {
      sm: '',
      md: '',
    },
  },

  defaultVariants: {
    variant: 'line',
    size: 'sm',
  },
})

const TabsTargetContentVariants = cva('', {
  variants: {
    variant: {
      line: [
        'py-2.5',
        'group-data-[state=active]:border-b-2 group-data-[state=active]:border-[#EED94C] group-data-[state=active]:text-white',
        'group-data-[state=active]:text-white',
      ],
      iconsAndText: [
        'border border-transparent py-1 px-3  flex gap-2 items-center bg-zinc-300/20 transition-all',
        'hover:border hover:border-white',
        'active:bg-transparent',
        ['group-data-[state=active]:bg-transparent group-data-[state=active]:border-base'],
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
  ],

  defaultVariants: {
    variant: 'line',
    size: 'md',
  },
})

type TabsTargetProps<T> = Omit<React.ComponentProps<typeof TabsPrimitive.Trigger>, 'value'> & {
  value: T
} & VariantProps<typeof TabsTargetContentVariants> & {
    contentClassName?: string
  }

function TabsTrigger<T>({ className, contentClassName, value, variant, ...props }: TabsTargetProps<T>) {
  const { variant: tabsVariants } = useTabsVariantsContext()

  const tabsTargetVariantsClassName = TabsTargetVariants({ variant: variant ?? tabsVariants })
  const tabsTargetContentVariantsClassName = TabsTargetContentVariants({ variant: variant ?? tabsVariants })
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      value={value as string}
      className={cn([tabsTargetVariantsClassName, 'group', className])}
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
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
