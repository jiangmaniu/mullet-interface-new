import { Circle, Path } from "react-native-svg"
import { SvgIcon, SvgIconProps } from "../svg-icon"

export const IconRemind = ({ primaryColor, ...props }: SvgIconProps & { primaryColor?: string }) => (
  <SvgIcon width='24' height='24' viewBox='0 0 24 24' fill="none" {...props}>
    <Circle cx={12} cy={12} r={12} fill={props.color ?? '#FF8F34'} fillOpacity={0.1} />
    <Path
      fill={primaryColor ?? '#FF8F34'}
      d="m11.073 14.521-.491-6.144L10.49 5.7h3.018l-.09 2.677-.492 6.144h-1.854ZM12 19.3c-.46 0-.842-.15-1.146-.45-.302-.299-.454-.676-.454-1.131 0-.467.152-.85.454-1.15.304-.3.685-.449 1.146-.449.46 0 .842.15 1.145.45.303.299.455.682.455 1.149 0 .455-.152.832-.455 1.132-.303.3-.684.449-1.145.449Z"
    />
  </SvgIcon>
)
