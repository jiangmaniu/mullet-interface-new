import { Circle, Path } from "react-native-svg"
import { SvgIcon, SvgIconProps } from "../svg-icon"

export const IconSuccess = (props: SvgIconProps) => (
  <SvgIcon width='24' height='24' viewBox='0 0 24 24' fill="none" {...props}>
    <Circle cx={12} cy={12} r={12} fill="#2EBC84" fillOpacity={0.15} />
    <Path
      fill="#2EBC84"
      stroke="#2EBC84"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.661 6.911a.656.656 0 1 1 .928.928l-8.75 8.75a.656.656 0 0 1-.928 0l-3.5-3.5a.656.656 0 1 1 .928-.928l3.036 3.036 8.286-8.286Z"
    />
  </SvgIcon>
)
