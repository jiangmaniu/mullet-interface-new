import { Pressable, View } from 'react-native'
import type { Locale } from '@/locales/i18n'

import { Checkbox } from '@/components/ui/checkbox'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { Text } from '@/components/ui/text'
import { useI18n } from '@/hooks/use-i18n'
import { dynamicActivate, LOCALE_EN, LOCALE_ZH_CN } from '@/locales/i18n'

const languages: { locale: Locale; label: string }[] = [
  { locale: LOCALE_ZH_CN, label: '简体中文' },
  { locale: LOCALE_EN, label: 'English' },
]

interface LanguageDrawerProps {
  visible: boolean
  onClose: () => void
}

export function LanguageDrawer({ visible, onClose }: LanguageDrawerProps) {
  const { locale } = useI18n()
  const handleSelect = async (locale: Locale) => {
    await dynamicActivate(locale)
    onClose()
  }

  return (
    <Drawer open={visible} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="px-xl py-3xl">
        {languages.map((lang) => (
          <Pressable key={lang.locale} onPress={() => handleSelect(lang.locale)}>
            <View className="px-xl h-[48px] flex-row items-center justify-between">
              <Text className="text-paragraph-p2 text-content-1">{lang.label}</Text>
              <Checkbox checked={locale === lang.locale} onCheckedChange={() => handleSelect(lang.locale)} />
            </View>
          </Pressable>
        ))}
      </DrawerContent>
    </Drawer>
  )
}
