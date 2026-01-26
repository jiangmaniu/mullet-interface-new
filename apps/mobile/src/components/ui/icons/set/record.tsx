import Svg, { Path, SvgProps } from "react-native-svg"

export const IconRecord = ({ width, height, viewBox, primaryColor, ...props }: SvgProps & { primaryColor?: string }) => (
  <Svg width={width ?? 24} height={height ?? 24} viewBox={viewBox ?? "0 0 24 24"} fill="none" {...props}>
    <Path fill="#fff" d="M20 16h-5v1.58h5V16ZM23 20h-8v1.58h8V20Z" />
    <Path
      fill="#fff"
      fillRule="evenodd"
      d="m12.5 14.117 4.559-4.558L15.94 8.44 12.5 11.883l-2-2-4.059 4.058L7.56 15.06l2.941-2.942 2 2Z"
      clipRule="evenodd"
    />
    <Path
      fill="#fff"
      fillRule="evenodd"
      d="M22 12a10.037 10.037 0 0 0-.585-3.369 9.992 9.992 0 0 0-6.046-6.046A9.954 9.954 0 0 0 12 2a10 10 0 0 0 0 20v-1.58a8.493 8.493 0 0 1-2.046-.252 8.443 8.443 0 0 1-3.908-2.214 8.386 8.386 0 0 1-1.825-2.732A8.39 8.39 0 0 1 3.58 12 8.418 8.418 0 0 1 12 3.58a8.425 8.425 0 0 1 7.426 4.45 8.465 8.465 0 0 1 .903 2.735A8.566 8.566 0 0 1 20.42 12H22Z"
      clipRule="evenodd"
    />
  </Svg>
)
