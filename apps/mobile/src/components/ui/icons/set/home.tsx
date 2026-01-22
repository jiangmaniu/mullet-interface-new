import Svg, { Path, SvgProps } from "react-native-svg"

export const IconHome = ({ width, height, viewBox, primaryColor, ...props }: SvgProps & { primaryColor?: string }) => (
  <Svg width={width ?? 24} height={height ?? 24} viewBox={viewBox ?? "0 0 24 24"} fill="none" {...props}>
    <Path
      fill={props.color ??  "#fff"}
      d="M20.25 10.707a3.251 3.251 0 0 0-1.565-2.778l-5-3.03a3.251 3.251 0 0 0-3.37 0l-5 3.03a3.25 3.25 0 0 0-1.565 2.78V17A3.25 3.25 0 0 0 7 20.25h10A3.25 3.25 0 0 0 20.25 17v-6.293ZM21.75 17A4.75 4.75 0 0 1 17 21.75H7A4.75 4.75 0 0 1 2.25 17v-6.292a4.75 4.75 0 0 1 2.288-4.062l5-3.03a4.75 4.75 0 0 1 4.924 0l5 3.03a4.751 4.751 0 0 1 2.288 4.061V17Z"
    />
    <Path
      fill={primaryColor ?? "#EED94C"}
      d="M15.75 17a.75.75 0 0 0-.75-.75H9a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 .75-.75Z"
    />
  </Svg>
)
