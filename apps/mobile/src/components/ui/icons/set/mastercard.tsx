import { Circle, Path, G } from "react-native-svg"
import { SvgIcon, SvgIconProps } from "../svg-icon"

export const IconMastercard = (props: SvgIconProps) => (
  <SvgIcon width="24" height="24" viewBox="0 0 24 13.714" fill="none" {...props}>
    <G>
      <Circle cx="6.857" cy="6.857" r="6.857" fill="#EB001B" />
      <Circle cx="17.143" cy="6.857" r="6.857" fill="#F79E1B" />
      <Path
        fill="#FF5F00"
        d="M12 2.324C13.066 3.532 13.714 5.118 13.714 6.857C13.714 8.595 13.066 10.181 12 11.39C10.934 10.182 10.286 8.595 10.286 6.857C10.286 5.119 10.934 3.532 12 2.324Z"
      />
    </G>
  </SvgIcon>
)
