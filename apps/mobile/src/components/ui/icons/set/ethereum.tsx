import { Path, G } from "react-native-svg"
import { SvgIcon, SvgIconProps } from "../svg-icon"

export const IconEthereum = (props: SvgIconProps) => (
  <SvgIcon width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <G>
      <Path fill="#627EEA" d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" />
      <Path fill="#fff" fillOpacity={0.602} d="M12.3735 3V9.6525L17.9963 12.165L12.3735 3Z" />
      <Path fill="#fff" d="M12.3735 3L6.75 12.165L12.3735 9.6525V3Z" />
      <Path fill="#fff" fillOpacity={0.602} d="M12.3735 16.476V20.9963L18 13.212L12.3735 16.476Z" />
      <Path fill="#fff" d="M12.3735 20.9963V16.4752L6.75 13.212L12.3735 20.9963Z" />
      <Path fill="#fff" fillOpacity={0.2} d="M12.3735 15.4297L17.9963 12.165L12.3735 9.654V15.4297Z" />
      <Path fill="#fff" fillOpacity={0.602} d="M6.75 12.165L12.3735 15.4297V9.654L6.75 12.165Z" />
    </G>
  </SvgIcon>
)
