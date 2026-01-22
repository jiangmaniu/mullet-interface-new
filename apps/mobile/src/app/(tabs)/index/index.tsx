import { View, Text } from 'react-native'
import { useLingui } from '@lingui/react/macro'

export default function Index() {
 const { t } =  useLingui()
  return (
    <View className="h-screen flex items-center justify-center">
      <Text className="text-status-danger text-title-h1">{t`首页`}</Text>
    </View>
  )
}