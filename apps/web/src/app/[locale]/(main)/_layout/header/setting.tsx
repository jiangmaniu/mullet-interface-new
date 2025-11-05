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
import { IconBell, IconLanguage, IconSetting } from '@mullet/ui/icons'
import { Popover, PopoverContent, PopoverTrigger } from '@mullet/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@mullet/ui/tabs'

export const GlobalSetting = () => {
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
          <IconSetting className="size-5" />
          <span className="sr-only">Notification</span>
        </IconButton>
      </PopoverTrigger>
      <PopoverContent align="start" className="max-h-[700px] min-h-[500px] w-[330px]">
        设置
      </PopoverContent>
    </Popover>
  )
}
