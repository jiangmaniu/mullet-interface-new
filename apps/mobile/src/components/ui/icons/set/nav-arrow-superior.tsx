import Svg, { Path, SvgProps } from "react-native-svg"
import { withUniwind } from "uniwind"

const NavArrowSuperior = ({ width, height, viewBox, ...props }: SvgProps) => (
  <Svg width={width ?? 16} height={height ?? 16} viewBox={viewBox ?? "0 0 16 16"} fill="none" {...props}>
    <Path
      fill={props.color ?? 'currentColor'}
      d="M11.782 10.44a.518.518 0 1 0 .733-.733L8.367 5.56a.518.518 0 0 0-.734 0L3.485 9.707a.518.518 0 1 0 .733.734L8 6.659l3.782 3.782Z"
    />
  </Svg>
)

export const IconNavArrowSuperior = withUniwind(NavArrowSuperior)