import { Circle, G, Path, Defs, ClipPath } from "react-native-svg"
import { SvgIcon, SvgIconProps } from "../svg-icon"

export const IconHK = (props: SvgIconProps) => (
  <SvgIcon width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <G clipPath="url(#hk-clip)">
      <Circle cx="12" cy="12" r="12" fill="#DE2910" />
      <G transform="translate(12, 11.5)" fill="#fff">
        {/* Petal 1 - top */}
        <Path
          transform="rotate(0)"
          d="M0,-1.5 C1.2,-3.5 1.8,-5.5 1,-7.5 C3,-6 3.5,-3.5 2,-1.5 Z"
        />
        <Path
          transform="rotate(0)"
          d="M0,-1.5 C-1.2,-3.5 -1.8,-5.5 -1,-7.5 C-3,-6 -3.5,-3.5 -2,-1.5 Z"
        />
        {/* Petal 2 */}
        <Path
          transform="rotate(72)"
          d="M0,-1.5 C1.2,-3.5 1.8,-5.5 1,-7.5 C3,-6 3.5,-3.5 2,-1.5 Z"
        />
        <Path
          transform="rotate(72)"
          d="M0,-1.5 C-1.2,-3.5 -1.8,-5.5 -1,-7.5 C-3,-6 -3.5,-3.5 -2,-1.5 Z"
        />
        {/* Petal 3 */}
        <Path
          transform="rotate(144)"
          d="M0,-1.5 C1.2,-3.5 1.8,-5.5 1,-7.5 C3,-6 3.5,-3.5 2,-1.5 Z"
        />
        <Path
          transform="rotate(144)"
          d="M0,-1.5 C-1.2,-3.5 -1.8,-5.5 -1,-7.5 C-3,-6 -3.5,-3.5 -2,-1.5 Z"
        />
        {/* Petal 4 */}
        <Path
          transform="rotate(216)"
          d="M0,-1.5 C1.2,-3.5 1.8,-5.5 1,-7.5 C3,-6 3.5,-3.5 2,-1.5 Z"
        />
        <Path
          transform="rotate(216)"
          d="M0,-1.5 C-1.2,-3.5 -1.8,-5.5 -1,-7.5 C-3,-6 -3.5,-3.5 -2,-1.5 Z"
        />
        {/* Petal 5 */}
        <Path
          transform="rotate(288)"
          d="M0,-1.5 C1.2,-3.5 1.8,-5.5 1,-7.5 C3,-6 3.5,-3.5 2,-1.5 Z"
        />
        <Path
          transform="rotate(288)"
          d="M0,-1.5 C-1.2,-3.5 -1.8,-5.5 -1,-7.5 C-3,-6 -3.5,-3.5 -2,-1.5 Z"
        />
      </G>
    </G>
    <Defs>
      <ClipPath id="hk-clip">
        <Path d="M0 0h24v24H0z" />
      </ClipPath>
    </Defs>
  </SvgIcon>
)
