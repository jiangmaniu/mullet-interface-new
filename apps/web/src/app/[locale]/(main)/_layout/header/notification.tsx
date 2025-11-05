'use client'

import { Trans } from '@lingui/react/macro'
import { useState } from 'react'
import { useCurrentLocale } from 'next-i18n-router/client'
import { usePathname, useRouter } from 'next/navigation'

import { Locale, LOCALE_LABEL_MAP, SUPPORTED_LOCALES } from '@/constants/locale'
import { i18nRouterConfig } from '@/locales/i18n-router-config'
import { IconButton } from '@mullet/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@mullet/ui/dropdownMenu'
import { IconBell, IconLanguage } from '@mullet/ui/icons'
import { Popover, PopoverContent, PopoverTrigger } from '@mullet/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@mullet/ui/tabs'

export const Notification = () => {
  const router = useRouter()
  const currentPathname = usePathname()
  const currentLocale = useCurrentLocale(i18nRouterConfig)

  function handleChange(newLocale: Locale) {
    if (currentLocale === i18nRouterConfig.defaultLocale && !i18nRouterConfig.prefixDefault) {
      router.push(`/${newLocale}${currentPathname}`)
    } else {
      router.push(currentPathname.replace(`/${currentLocale}`, `/${newLocale}`))
    }

    router.refresh()
  }

  const [value, setValue] = useState<'notification' | 'announcement'>('notification')

  return (
    <Popover>
      <PopoverTrigger asChild>
        <IconButton className="size-9">
          <IconBell className="size-5" />
          <span className="sr-only">Notification</span>
        </IconButton>
      </PopoverTrigger>
      <PopoverContent align="start" className="max-h-[700px] min-h-[500px] w-[330px] p-0 px-2.5">
        <Tabs value={value} onValueChange={setValue}>
          <TabsList className="border-b-0 px-0">
            <TabsTrigger value="notification">
              <Trans>通知</Trans>
            </TabsTrigger>
            <TabsTrigger value="announcement">
              <Trans>公告</Trans>
            </TabsTrigger>
          </TabsList>
          <div className="px-1 py-3">
            <TabsContent value="notification">
              <div>通知</div>
            </TabsContent>
            <TabsContent value="announcement">
              <div>公告</div>
            </TabsContent>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
