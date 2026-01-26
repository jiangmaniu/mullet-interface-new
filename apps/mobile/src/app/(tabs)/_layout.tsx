import React from 'react'
import { Tabs } from 'expo-router'
import { HapticTab } from '@/components/haptic-tab'
import { useLingui } from '@lingui/react/macro'
import { IconHome, IconifyActivity, IconifyHomeSimple, IconifyWallet, IconTrade, IconWallet } from '@/components/ui/icons'
import { useResolveClassNames } from 'uniwind'
import { useThemeColors } from '@/hooks/use-theme-colors'

export default function TabLayout() {
  const { t } = useLingui()
  const { textColorContent1, colorBrandPrimary } = useThemeColors()
  const tabBarLabelStyle = useResolveClassNames('text-paragraph-p3')
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: textColorContent1,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: tabBarLabelStyle,
        tabBarStyle: {
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index/index"
        options={{
          title: t`首页`,
          tabBarIcon: ({ color, focused }) => focused ?  <IconHome primaryColor={colorBrandPrimary} width={24} height={24} color={color} /> :  <IconifyHomeSimple width={24} height={24} color={color} /> ,
        }}
      />
      <Tabs.Screen
        name="trade/index"
        options={{
          title: t`交易`,
          tabBarIcon: ({ color, focused }) => focused ? <IconTrade primaryColor={colorBrandPrimary} width={24} height={24} color={color} /> : <IconifyActivity width={24} height={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="assets/index"
        options={{
          title: t`资产`,
          tabBarIcon: ({ color, focused }) =>  focused ? <IconWallet primaryColor={colorBrandPrimary} width={20} height={18} color={color} />: <IconifyWallet width={24} height={24} color={color} />,
        }}
      />
    </Tabs>
  )
}
