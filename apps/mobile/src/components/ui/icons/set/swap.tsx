import { Path } from "react-native-svg"
import { SvgIcon, SvgIconProps } from "../svg-icon"

export const IconSwap = (props: SvgIconProps) => (
  <SvgIcon width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      fill="currentColor"
      d="M7 10L3 6L7 2V5H17V7H7V10ZM17 14L21 18L17 22V19H7V17H17V14Z"
    />
  </SvgIcon>
)
