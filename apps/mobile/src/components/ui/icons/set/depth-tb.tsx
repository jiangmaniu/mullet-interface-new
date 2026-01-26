import Svg, { Rect, SvgProps } from "react-native-svg"

export const IconDepthTB = ({ width, height, viewBox, primaryColor, ...props }: SvgProps & { primaryColor?: string }) => (
  <Svg width={width ?? 12} height={height ?? 12} viewBox={viewBox ?? "0 0 12 12"} fill="none" {...props}>
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
  </Svg>
)
