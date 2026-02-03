import { Rect } from "react-native-svg"
import { SvgIcon, SvgIconProps } from "../svg-icon"

export const IconDepthTB = ({ primaryColor, ...props }: SvgIconProps & { primaryColor?: string }) => (
  <SvgIcon width='12' height='12' viewBox='0 0 12 12' fill="none" {...props}>
    <Rect
      width={5.473}
      height={12}
      fill={props.color ?? '#393D60'}
      rx={1}
      transform="matrix(0 -1 -1 0 12 12)"
    />
    <Rect
      width={5.473}
      height={12}
      fill={primaryColor ?? '#393D60'}
      rx={1}
      transform="matrix(0 -1 -1 0 12 5.473)"
    />
  </SvgIcon>
)
