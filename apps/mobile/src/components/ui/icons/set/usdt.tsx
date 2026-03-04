import { G, Path, Defs, ClipPath } from "react-native-svg"
import { SvgIcon, SvgIconProps } from "../svg-icon"

export const IconUSDT = (props: SvgIconProps) => (
  <SvgIcon width='24' height='24' viewBox='0 0 24 24' fill="none" {...props}>
    <G clipPath="url(#usdt-clip)">
      <Path
        fill="#26A17B"
        d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z"
      />
      <Path
        fill="#fff"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.125 13.5v-.094c2.531-.187 4.406-.75 4.406-1.406 0-.656-1.875-1.219-4.406-1.406V9h3.281V6H7.594v3h3.281v1.594C8.344 10.78 6.469 11.344 6.469 12c0 .656 1.875 1.219 4.406 1.406v5.719h2.25V13.5Zm0-2.813v.001c-.356.032-.72.057-1.094.075-.375.019-.75.028-1.125.028-.375 0-.75-.01-1.125-.028a18.814 18.814 0 0 1-1.094-.075c-1.875-.188-3.281-.657-3.281-1.188 0-.531 1.406-1 3.281-1.188.356-.031.72-.056 1.094-.075.375-.018.75-.028 1.125-.028.375 0 .75.01 1.125.028.374.019.738.044 1.094.075 1.875.188 3.281.657 3.281 1.188 0 .531-1.406 1-3.281 1.188Z"
      />
    </G>
    <Defs>
      <ClipPath id="usdt-clip">
        <Path fill="#fff" d="M0 0h24v24H0z" />
      </ClipPath>
    </Defs>
  </SvgIcon>
)
