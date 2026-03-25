import {
  Tabs as AriaTabs,
  TabList as AriaTabList,
  Tab as AriaTab,
  TabPanel as AriaTabPanel,
  composeRenderProps,
  type TabsProps as AriaTabsProps,
  type TabProps as AriaTabProps,
  type TabListProps as AriaTabListProps,
  type TabPanelProps as AriaTabPanelProps,
} from 'react-aria-components'
import { cn } from '@/lib/utils'

function Tabs({ className, ...props }: AriaTabsProps) {
  return (
    <AriaTabs
      className={composeRenderProps(className, (className) =>
        cn('flex flex-col gap-2', className),
      )}
      {...props}
    />
  )
}

function TabList<T extends object>({ className, ...props }: AriaTabListProps<T>) {
  return (
    <AriaTabList
      className={composeRenderProps(className, (className) =>
        cn(
          'inline-flex h-10 items-center justify-center rounded-2 bg-muted p-1 text-muted-foreground',
          className,
        ),
      )}
      {...props}
    />
  )
}

function Tab({ className, ...props }: AriaTabProps) {
  return (
    <AriaTab
      className={composeRenderProps(className, (className) =>
        cn(
          'inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-1 px-3 py-1.5 text-sm font-medium ring-offset-background transition-all outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'data-[selected]:bg-card data-[selected]:text-foreground data-[selected]:shadow-sm',
          className,
        ),
      )}
      {...props}
    />
  )
}

function TabPanel({ className, ...props }: AriaTabPanelProps) {
  return (
    <AriaTabPanel
      className={composeRenderProps(className, (className) =>
        cn(
          'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className,
        ),
      )}
      {...props}
    />
  )
}

export { Tabs, TabList, Tab, TabPanel }
