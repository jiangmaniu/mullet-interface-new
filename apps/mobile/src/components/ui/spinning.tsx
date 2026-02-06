import { useEffect } from "react"

import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, cancelAnimation } from 'react-native-reanimated'
import { IconSpecialCodexLoading } from '@/components/ui/icons'
import { SvgIconProps } from "./icons/svg-icon"

export function Spinning({ children, ...svgIconProps }: { children?: React.ReactNode } & SvgIconProps) {
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    )
    return () => cancelAnimation(rotation)
  }, [rotation])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  return (
    <Animated.View style={[animatedStyle]}>
      {children || <IconSpecialCodexLoading className='text-brand-primary' height={20} width={20} {...svgIconProps} />}
    </Animated.View>
  )
}
