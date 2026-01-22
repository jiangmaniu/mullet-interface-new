import React from 'react'
import { Tabs } from 'expo-router'
import { HapticTab } from '@/components/haptic-tab'
import { useLingui } from '@lingui/react/macro'
import { IconHome, IconifyActivity, IconifyHomeSimple, IconifyWallet, IconTrade, IconWallet } from '@/components/ui/icons'
import { useCSSVariable } from 'uniwind'

export default function TabLayout() {
  const { t } = useLingui()
  const [whiteColor, yellowColor500] = useCSSVariable(['--color-white', '--color-yellow-500'])

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: whiteColor as string,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index/index"
        options={{
          title: t`首页`,
          tabBarIcon: ({ color, focused }) => focused ?  <IconHome primaryColor={yellowColor500 as string} width={24} height={24} color={color} /> :  <IconifyHomeSimple width={24} height={24} color={color} /> ,
        }}
      />
      <Tabs.Screen
        name="trade/index"
        options={{
          title: t`交易`,
          tabBarIcon: ({ color, focused }) => focused ? <IconTrade primaryColor={yellowColor500 as string} width={24} height={24} color={color} /> : <IconifyActivity width={24} height={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="assets/index"
        options={{
          title: t`资产`,
          tabBarIcon: ({ color, focused }) =>  focused ? <IconWallet primaryColor={yellowColor500 as string} width={20} height={18} color={color} />: <IconifyWallet width={24} height={24} color={color} />,
        }}
      />
    </Tabs>
  )
}
