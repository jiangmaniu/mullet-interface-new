import { useEffect } from "react"
import Animated, {
  cancelAnimation,
  Easing,
  SharedValue,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"
import { G, Path } from "react-native-svg"
import { SvgIcon, SvgIconProps } from "../svg-icon"

const BARS = 8
const STEP_MS = 100
const AnimatedG = Animated.createAnimatedComponent(G)

const PATHS = [
  "M25.1094 4.62808C25.7343 4.00387 26.7473 4.00345 27.3719 4.62808C27.9965 5.25271 27.9961 6.26569 27.3719 6.89058L23.9313 10.3312C23.3064 10.956 22.2936 10.956 21.6688 10.3312C21.0439 9.70637 21.0439 8.69355 21.6688 8.06871L25.1094 4.62808Z",
  "M14.4 1.6V6.4C14.4 7.28366 15.1164 8 16 8C16.8837 8 17.6 7.28366 17.6 6.4V1.6C17.6 0.716344 16.8837 0 16 0C15.1164 0 14.4 0.716344 14.4 1.6Z",
  "M6.89064 4.62808C6.26575 4.00387 5.25277 4.00345 4.62814 4.62808C4.00351 5.25271 4.00392 6.26569 4.62814 6.89058L8.06876 10.3312C8.6936 10.956 9.70642 10.956 10.3313 10.3312C10.9561 9.70637 10.9561 8.69355 10.3313 8.06871L6.89064 4.62808Z",
  "M8 16C8 15.1163 7.28366 14.4 6.4 14.4H1.6C0.716344 14.4 0 15.1163 0 16C0 16.8837 0.716344 17.6 1.6 17.6H6.4C7.28366 17.6 8 16.8837 8 16Z",
  "M10.3313 21.6686C9.70642 21.0438 8.6936 21.0438 8.06876 21.6686L4.62813 25.1093C4.00392 25.7341 4.0035 26.7471 4.62813 27.3718C5.25276 27.9964 6.26574 27.996 6.89063 27.3718L10.3313 23.9311C10.9561 23.3063 10.9561 22.2935 10.3313 21.6686Z",
  "M14.4 25.6V30.4C14.4 31.2837 15.1163 32 16 32C16.8837 32 17.6 31.2837 17.6 30.4V25.6C17.6 24.7163 16.8837 24 16 24C15.1163 24 14.4 24.7163 14.4 25.6Z",
  "M23.9313 21.6686C23.3064 21.0438 22.2936 21.0438 21.6688 21.6686C21.0439 22.2935 21.0439 23.3063 21.6688 23.9311L25.1094 27.3718C25.7343 27.996 26.7472 27.9964 27.3719 27.3718C27.9965 26.7471 27.9961 25.7341 27.3719 25.1093L23.9313 21.6686Z",
  "M32 16C32 15.1163 31.2837 14.4 30.4 14.4H25.6C24.7163 14.4 24 15.1163 24 16C24 16.8837 24.7163 17.6 25.6 17.6H30.4C31.2837 17.6 32 16.8837 32 16Z",
]

function SpinnerBar({
  d,
  index,
  progress,
}: {
  d: string
  index: number
  progress: SharedValue<number>
}) {
  const animatedProps = useAnimatedProps(() => {
    "worklet"
    const step = Math.floor(progress.value) % BARS
    const distance = ((index - step) % BARS + BARS) % BARS
    return {
      opacity: 1 - distance * 0.1,
    }
  })
  return (
    <AnimatedG animatedProps={animatedProps}>
      <Path d={d} fill="currentColor" />
    </AnimatedG>
  )
}

export const IconSpinner = ({ animated, ...props }: SvgIconProps & { animated?: boolean }) => {
  const progress = useSharedValue(0)

  useEffect(() => {
    if (!animated) return
    progress.value = withRepeat(
      withTiming(BARS, {
        duration: BARS * STEP_MS,
        easing: Easing.linear,
      }),
      -1,
      false,
    )
    return () => cancelAnimation(progress)
  }, [animated, progress])

  return (
    <SvgIcon width="32" height="32" viewBox="0 0 32 32" fill="none" {...props}>
      {PATHS.map((d, i) => (
        <SpinnerBar key={i} d={d} index={i} progress={progress} />
      ))}
    </SvgIcon>
  )
}
