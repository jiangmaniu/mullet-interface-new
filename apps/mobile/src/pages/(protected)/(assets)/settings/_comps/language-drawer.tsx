import { View, Pressable } from 'react-native'
import { Text } from '@/components/ui/text'
import { Checkbox } from '@/components/ui/checkbox'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { i18n } from '@lingui/core'
import {
  dynamicActivate,
  LOCALE_ZH_CN,
  LOCALE_EN,
  type Locale,
} from '@/locales/i18n'

const languages: { locale: Locale; label: string }[] = [
  { locale: LOCALE_ZH_CN, label: '简体中文' },
  { locale: LOCALE_EN, label: 'English' },
]

interface LanguageDrawerProps {
  visible: boolean
  onClose: () => void
}

export function LanguageDrawer({ visible, onClose }: LanguageDrawerProps) {
  const handleSelect = async (locale: Locale) => {
    await dynamicActivate(locale)
    onClose()
  }

  return (
    <Drawer open={visible} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className='px-xl py-3xl'>
        {languages.map((lang) => (
          <Pressable
            key={lang.locale}
            onPress={() => handleSelect(lang.locale)}
          >
            <View className="h-[48px] flex-row items-center justify-between px-xl">
              <Text className="text-paragraph-p2 text-content-1">
                {lang.label}
              </Text>
              <Checkbox
                checked={i18n.locale === lang.locale}
                onCheckedChange={() => handleSelect(lang.locale)}
              />
            </View>
          </Pressable>
        ))}
      </DrawerContent>
    </Drawer>
  )
}
