import { Path, G, Defs, LinearGradient, Stop } from "react-native-svg"
import { SvgIcon, SvgIconProps } from "../svg-icon"

export const IconSolana = (props: SvgIconProps) => (
  <SvgIcon width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <G>
      <Path
        fill="url(#solana-gradient)"
        d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z"
      />
      <Path
        fill="#000"
        d="M7.5 14.5l1.5-1.5h7.5l-1.5 1.5H7.5Zm0-4l1.5-1.5h7.5l-1.5 1.5H7.5Zm1.5 6.5l1.5-1.5h7.5l-1.5 1.5H9Z"
      />
    </G>
    <Defs>
      <LinearGradient id="solana-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor="#00FFA3" />
        <Stop offset="1" stopColor="#DC1FFF" />
      </LinearGradient>
    </Defs>
  </SvgIcon>
)
