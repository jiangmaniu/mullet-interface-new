import { useEffect } from "react"

import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, cancelAnimation } from 'react-native-reanimated'
import { IconSpecialCodexLoading } from '@/components/ui/icons'
import { SvgIconProps } from "./icons/svg-icon"

export function Spinning({ children, ...svgIconProps }: { children?: React.ReactNode } & SvgIconProps) {
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = 0
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    )
    return () => {
      cancelAnimation(rotation)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  const size = Number(svgIconProps.height) || 20

  return (
    <Animated.View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
      {children || <IconSpecialCodexLoading className='text-brand-primary' height={size} width={size} {...svgIconProps} />}
    </Animated.View>
  )
}
