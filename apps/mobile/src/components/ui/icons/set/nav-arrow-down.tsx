import { Path } from "react-native-svg"
import { SvgIcon, SvgIconProps } from "../svg-icon"

export const IconNavArrowDown = (props: SvgIconProps) => (
  <SvgIcon width='16' height='16' viewBox='0 0 16 16' fill="none" {...props}>
    <Path
      fill="currentColor"
      d="M11.782 5.56a.518.518 0 1 1 .733.733L8.367 10.44a.518.518 0 0 1-.734 0L3.485 6.293a.518.518 0 1 1 .733-.734L8 9.341l3.782-3.782Z"
    />
  </SvgIcon>
)