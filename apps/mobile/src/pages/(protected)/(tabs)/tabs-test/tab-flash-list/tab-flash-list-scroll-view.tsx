import { SceneComponent } from '@mullet/react-native-tabs'
import React from 'react'
import Animated from 'react-native-reanimated'
import type { ScrollViewProps } from 'react-native'

type TabScrollViewProps = ScrollViewProps & {
  index: number
}
function TabFlashListScrollViewComponent(props: TabScrollViewProps, ref: any) {
  return <SceneComponent {...props} useExternalScrollView forwardedRef={ref} ContainerView={Animated.ScrollView} />
}

export const TabFlashListScrollView = React.forwardRef(TabFlashListScrollViewComponent)
