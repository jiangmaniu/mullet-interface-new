import { Rect } from "react-native-svg"
import { SvgIcon, SvgIconProps } from "../svg-icon"

export const IconDepth = ({ primaryColor, ...props }: SvgIconProps & { primaryColor?: string }) => (
  <SvgIcon width='12' height='12' viewBox='0 0 12 12' fill="none" {...props}>
    <Rect
      width={5.455}
      height={5.455}
      fill={props.color ?? "#FF445D"}
      rx={1}
      transform="matrix(-1 0 0 1 12 0)"
    />
    <Rect
      width={5.455}
      height={5.455}
      fill={primaryColor ?? "#2EBC84"}
      rx={1}
      transform="matrix(-1 0 0 1 12 6.545)"
    />
    <Rect
      width={5.455}
      height={12}
      fill={"#393D60"}
      rx={1}
      transform="matrix(-1 0 0 1 5.455 0)"
    />
  </SvgIcon>
)

