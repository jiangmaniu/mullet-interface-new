import { View, Pressable } from 'react-native'
import { Trans } from '@lingui/react/macro'
import { useState } from 'react'
import { Text } from '@/components/ui/text'
import { IconButton } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  IconifySettings,
  IconifyWallet,
  IconifyCoinsSwap,
  IconifyXmark,
} from '@/components/ui/icons'
import { IconRecord } from '@/components/ui/icons/set/record'
import { IconStar } from '@/components/ui/icons/set/star'
import { IconStarFill } from '@/components/ui/icons/set/star-fill'

interface CommonFeaturesDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTradingSettings?: () => void
  onDeposit?: () => void
  onTransfer?: () => void
  onBill?: () => void
  onFavorites?: () => void
}

interface FeatureItemProps {
  icon: React.ReactNode
  label: React.ReactNode
  onPress?: () => void
}

function FeatureItem({ icon, label, onPress }: FeatureItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-col items-center gap-xs p-0 w-[68px] h-[48px]"
    >
      <View className="items-center justify-center">
        {icon}
      </View>
      <Text className="text-paragraph-p3 text-content-1">
        {label}
      </Text>
    </Pressable>
  )
}

export function CommonFeaturesDrawer({
  open,
  onOpenChange,
  onTradingSettings,
  onDeposit,
  onTransfer,
  onBill,
  onFavorites,
}: CommonFeaturesDrawerProps) {
  const [isFavorited, setIsFavorited] = useState(false)

  const handleFavoritesPress = () => {
    setIsFavorited(!isFavorited)
    // onFavorites?.()
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='gap-xl pb-3xl'>
        <DrawerHeader className="px-5 pt-3xl">
          <DrawerTitle>
            <Trans>常用功能</Trans>
          </DrawerTitle>
        </DrawerHeader>

        {/* Features Grid */}
        <View className="px-5 gap-5 py-xl">
          {/* Row 1 - 4 items */}
          <View className="flex-row justify-between">
            <FeatureItem
              icon={<IconifySettings width={28} height={28} />}
              label={<Trans>交易设置</Trans>}
              onPress={onTradingSettings}
            />
            <FeatureItem
              icon={<IconifyWallet width={28} height={28} />}
              label={<Trans>入金</Trans>}
              onPress={onDeposit}
            />
            <FeatureItem
              icon={<IconifyCoinsSwap width={28} height={28} />}
              label={<Trans>划转</Trans>}
              onPress={onTransfer}
            />
            <FeatureItem
              icon={<IconRecord width={28} height={28} />}
              label={<Trans>账单</Trans>}
              onPress={onBill}
            />
          </View>

          {/* Row 2 - 1 item aligned to start */}
          <View className="flex-row">
            <FeatureItem
              icon={isFavorited ? <IconStarFill width={28} height={28} className='text-brand-primary' /> : <IconStar width={28} height={28} className='text-content-1' />}
              label={<Trans>收藏</Trans>}
              onPress={handleFavoritesPress}
            />
          </View>
        </View>
      </DrawerContent>
    </Drawer>
  )
}
