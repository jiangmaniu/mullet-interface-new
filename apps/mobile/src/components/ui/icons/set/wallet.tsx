import Svg, { Path, SvgProps } from "react-native-svg"

export const IconWallet = ({ width, height, viewBox, primaryColor, ...props }: SvgProps & { primaryColor?: string }) => (
  <Svg width={width ?? 20} height={height ?? 18} viewBox={viewBox ?? '0 0 20 18'} fill="none" {...props}>
   <Path
      fill={primaryColor ?? "#EED94C"}
      d="M0 5.683a2.75 2.75 0 0 1 2.042-2.658l11-2.932.153-.037A2.75 2.75 0 0 1 16.5 2.75v1.397H15V2.75l-.008-.144a1.25 1.25 0 0 0-1.563-1.064l-11 2.933h-.001A1.25 1.25 0 0 0 1.5 5.683v.463H0v-.463Z"
    />
    <Path
      fill={props.color ??  "#fff"}
      d="M18 6.146a1.25 1.25 0 0 0-1.126-1.244l-.124-.006h-14a1.25 1.25 0 0 0-1.25 1.25v9a1.25 1.25 0 0 0 1.25 1.25h14a1.25 1.25 0 0 0 1.25-1.25v-9Zm1.5 9a2.75 2.75 0 0 1-2.75 2.75h-14A2.75 2.75 0 0 1 0 15.146v-9a2.75 2.75 0 0 1 2.75-2.75h14a2.75 2.75 0 0 1 2.75 2.75v9Z"
    />
    <Path fill={props.color ??  "#fff"} d="M14.25 11.146a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1Z" />
    <Path
      fill={primaryColor ?? "#EED94C"}
      d="M14 10.646a.25.25 0 0 0 .5 0l-.005-.049a.249.249 0 0 0-.037-.09l-.031-.037a.25.25 0 0 0-.316-.032l-.038.031a.25.25 0 0 0-.073.177Zm1.5 0a1.25 1.25 0 0 1-2.5 0l.006-.124a1.25 1.25 0 0 1 2.494.124Z"
    />
  </Svg>
)
