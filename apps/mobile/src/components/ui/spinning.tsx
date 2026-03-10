import { useEffect } from 'react'

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated'

import { IconSpecialCodexLoading } from '@/components/ui/icons'
import { SvgIconProps } from './icons/svg-icon'

export function Spinning({ children, ...svgIconProps }: { children?: React.ReactNode } & SvgIconProps) {
  const rotation = useSharedValue(0)

  useEffect(() => {
    // 使用弧度制（2π）代替角度制（360°），减少字符串转换开销
    // 配置更高的帧率以获得更流畅的动画
    rotation.value = withRepeat(
      withTiming(2 * Math.PI, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false,
    )

    return () => {
      cancelAnimation(rotation)
    }
  }, [rotation])

  // 使用 rotateZ + rad 单位，性能优于 rotate + deg
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${rotation.value}rad` }],
    }
  })

  const size = Number(svgIconProps.height) || 20

  return (
    <Animated.View
      style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, animatedStyle]}
    >
      {children || <IconSpecialCodexLoading className="text-brand-primary" height={size} width={size} {...svgIconProps} />}
    </Animated.View>
  )
}
