import Svg, { Circle, Path, SvgProps } from "react-native-svg"

export const IconGroup5 = ({ width, height, viewBox, primaryColor, ...props }: SvgProps & { primaryColor?: string }) => (
  <Svg width={width ?? 24} height={height ?? 24} viewBox={viewBox ?? "0 0 24 24"} fill="none" {...props}>
    <Circle cx={12} cy={12} r={12} fill="#fff" />
    <Path
      fill="#060717"
      d="M7.488 5.784V16.44l-2.212-2.321a.723.723 0 0 0-1.057 0 .812.812 0 0 0 0 1.109l3.488 3.66.056.054a.722.722 0 0 0 1-.054l3.489-3.66a.812.812 0 0 0 0-1.11.723.723 0 0 0-1.057 0L8.983 16.44V5.784c0-.433-.335-.784-.748-.784-.412 0-.747.351-.747.784ZM15.017 18.333V7.678l-2.212 2.321a.723.723 0 0 1-1.057 0 .812.812 0 0 1 0-1.109l3.488-3.66.057-.054a.722.722 0 0 1 1 .054l3.488 3.66a.812.812 0 0 1 0 1.11.723.723 0 0 1-1.057 0l-2.212-2.322v10.655c0 .434-.335.785-.747.785-.413 0-.748-.351-.748-.785Z"
    />
  </Svg>
)
