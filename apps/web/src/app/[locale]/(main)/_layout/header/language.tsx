'use client'

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
} from '@mullet/ui/dropdown-menu'
import { IconLanguage } from '@mullet/ui/icons'

export const LanguageChanger = () => {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton className="size-9">
          <IconLanguage className="size-5" />
          <span className="sr-only">Toggle language</span>
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LOCALES.map((locale) => {
          return (
            <DropdownMenuCheckboxItem
              key={locale}
              checked={currentLocale === locale}
              onClick={() => handleChange(locale)}
            >
              {LOCALE_LABEL_MAP[locale]}
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
