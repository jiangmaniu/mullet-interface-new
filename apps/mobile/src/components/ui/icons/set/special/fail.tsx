import { Circle, Path } from "react-native-svg"
import { SvgIcon, SvgIconProps } from "../../svg-icon"

export const IconSpecialFail = (props: SvgIconProps) => {
  return (
    <SvgIcon width='20' height='20' viewBox='0 0 20 20' fill="none" {...props}>
      <Circle cx="10" cy="10" r="10" fill="#FF445D" fillOpacity="0.15" />
      <Path d="M13.2766 5.98596C13.4803 5.78242 13.8104 5.78233 14.014 5.98596C14.2175 6.18957 14.2175 6.51971 14.014 6.72331L10.7366 9.99929L14.014 13.2766C14.2174 13.4803 14.2175 13.8104 14.014 14.014C13.8104 14.2175 13.4803 14.2174 13.2766 14.014L9.99997 10.7373L6.72331 14.014C6.5197 14.2175 6.18957 14.2175 5.98596 14.014C5.78236 13.8104 5.78244 13.4803 5.98596 13.2766L9.26194 9.99997L5.98596 6.72331C5.78236 6.51967 5.78234 6.18958 5.98596 5.98596C6.1896 5.78236 6.51969 5.78234 6.72331 5.98596L9.99929 9.26262L13.2766 5.98596Z" fill="#FF445D" stroke="#FF445D" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  )
}
