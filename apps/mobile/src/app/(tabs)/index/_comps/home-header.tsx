import { useLingui } from '@lingui/react/macro'
import { View } from 'react-native'
import { Button } from '@/components/ui/button'
import { IconifyBell, IconifySearch } from '@/components/ui/icons'
import { Input } from '@/components/ui/input'
import { useResolveClassNames } from 'uniwind'

export function HomeHeader() {
  const { t } = useLingui()
  const searchIconStyle = useResolveClassNames('text-content-4')

  return (
    <View className="flex-row items-center justify-between gap-medium px-xl py-1.5">
      <View className="relative flex-1 items-center justify-center">
        <Input placeholder={t`查询`} className="w-full h-8" LeftContent={<IconifySearch width={20} height={20} style={searchIconStyle} />} />
      </View>

      <Button variant="ghost" size="icon">
        <IconifyBell width={24} height={24} />
      </Button>
    </View>
  )
}
