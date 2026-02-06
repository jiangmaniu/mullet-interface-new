import { Circle, Path } from "react-native-svg"
import { SvgIcon, SvgIconProps } from "../../svg-icon"

export const IconSpecialSuccess = (props: SvgIconProps) => {
  return (
    <SvgIcon width='20' height='20' viewBox='0 0 20 20' fill="none" {...props}>
      <Circle cx="10" cy="10" r="10" fill="#2EBC84" fillOpacity="0.15" />
      <Path d="M14.7176 5.96755C14.9312 5.75398 15.2774 5.75398 15.4909 5.96755C15.7045 6.18112 15.7045 6.5273 15.4909 6.74086L8.19928 14.0325C7.98571 14.2461 7.63953 14.2461 7.42596 14.0325L4.5093 11.1159C4.29573 10.9023 4.29573 10.5561 4.5093 10.3425C4.72287 10.129 5.06904 10.129 5.28261 10.3425L7.81262 12.8726L14.7176 5.96755Z" fill="#2EBC84" stroke="#2EBC84" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  )
}
