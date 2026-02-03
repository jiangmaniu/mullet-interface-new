import Svg, { SvgProps } from "react-native-svg"
import { withUniwind } from "uniwind"

export type SvgIconProps = SvgProps & { children?: React.ReactNode }

export const SvgIcon = withUniwind(({ children, ...props }: SvgIconProps) => (
	<Svg {...props}>
		{children}
	</Svg>
))
