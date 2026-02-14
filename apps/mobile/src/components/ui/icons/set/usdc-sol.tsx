import { G, Path, Defs, ClipPath, Mask, LinearGradient, Stop, Circle } from "react-native-svg"
import { SvgIcon, SvgIconProps } from "../svg-icon"

export const IconUsdcSol = (props: SvgIconProps) => (
  <SvgIcon width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <G clipPath="url(#usdc_sol_a)">
      <Path
        fill="#2775CA"
        d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z"
      />
      <Path
        fill="#fff"
        d="M9.75 20.344c0 .28-.225.44-.488.356A8.998 8.998 0 0 1 3 12.122a9.007 9.007 0 0 1 6.262-8.578c.272-.085.488.075.488.356v.703c0 .187-.14.403-.319.469C6.553 6.132 4.5 8.897 4.5 12.122a7.498 7.498 0 0 0 4.931 7.04.537.537 0 0 1 .319.47v.712Z"
      />
      <Path
        fill="#fff"
        d="M12.75 17.747a.376.376 0 0 1-.375.375h-.75a.376.376 0 0 1-.375-.375v-1.181c-1.64-.225-2.437-1.134-2.653-2.39a.346.346 0 0 1 .347-.404h.853a.38.38 0 0 1 .366.3c.159.74.59 1.313 1.903 1.313.965 0 1.66-.544 1.66-1.35 0-.807-.404-1.116-1.829-1.35-2.1-.282-3.094-.92-3.094-2.56 0-1.265.966-2.26 2.447-2.465V6.497c0-.206.169-.375.375-.375h.75c.206 0 .375.169.375.375v1.19c1.21.216 1.978.9 2.231 2.044a.344.344 0 0 1-.347.413h-.787a.371.371 0 0 1-.356-.272c-.216-.722-.732-1.04-1.631-1.04-.994 0-1.51.478-1.51 1.153 0 .712.29 1.068 1.819 1.284 2.062.281 3.131.872 3.131 2.625 0 1.331-.994 2.41-2.54 2.653v1.2h-.01Z"
      />
      <Path
        fill="#fff"
        d="M14.738 20.7c-.272.085-.488-.075-.488-.356v-.703a.49.49 0 0 1 .319-.469c2.868-1.05 4.931-3.816 4.931-7.04a7.498 7.498 0 0 0-4.931-7.041.537.537 0 0 1-.319-.469v-.703c0-.281.225-.44.488-.356A8.966 8.966 0 0 1 21 12.122a8.998 8.998 0 0 1-6.262 8.578Z"
      />
    </G>
    <G clipPath="url(#usdc_sol_b)">
      <Mask id="usdc_sol_c" width={10} height={10} x={14} y={14} maskUnits="userSpaceOnUse">
        <Path fill="#fff" d="M24 14H14v10h10V14Z" />
      </Mask>
      <G mask="url(#usdc_sol_c)">
        <Circle cx={19} cy={19} r={5} fill="#000" />
        <Path
          fill="url(#usdc_sol_d)"
          d="M17.312 20.116a.164.164 0 0 1 .116-.048h3.99c.073 0 .11.088.058.14l-.788.788a.164.164 0 0 1-.116.048h-3.99a.082.082 0 0 1-.058-.14l.788-.788Z"
        />
        <Path
          fill="url(#usdc_sol_e)"
          d="M17.312 17.173a.168.168 0 0 1 .116-.048h3.99c.073 0 .11.088.058.14l-.788.788a.164.164 0 0 1-.116.048h-3.99a.082.082 0 0 1-.058-.14l.788-.788Z"
        />
        <Path
          fill="url(#usdc_sol_f)"
          d="M20.688 18.635a.164.164 0 0 0-.116-.048h-3.99a.082.082 0 0 0-.058.14l.788.788c.03.03.072.048.116.048h3.99c.073 0 .11-.088.058-.14l-.788-.788Z"
        />
      </G>
    </G>
    <Defs>
      <LinearGradient id="usdc_sol_d" x1={21.037} x2={18.276} y1={16.654} y2={21.944} gradientUnits="userSpaceOnUse">
        <Stop stopColor="#00FFA3" />
        <Stop offset={1} stopColor="#DC1FFF" />
      </LinearGradient>
      <LinearGradient id="usdc_sol_e" x1={19.83} x2={17.068} y1={16.024} y2={21.313} gradientUnits="userSpaceOnUse">
        <Stop stopColor="#00FFA3" />
        <Stop offset={1} stopColor="#DC1FFF" />
      </LinearGradient>
      <LinearGradient id="usdc_sol_f" x1={20.43} x2={17.668} y1={16.337} y2={21.627} gradientUnits="userSpaceOnUse">
        <Stop stopColor="#00FFA3" />
        <Stop offset={1} stopColor="#DC1FFF" />
      </LinearGradient>
      <ClipPath id="usdc_sol_a">
        <Path fill="#fff" d="M0 0h24v24H0z" />
      </ClipPath>
      <ClipPath id="usdc_sol_b">
        <Path fill="#fff" d="M14 14h10v10H14z" />
      </ClipPath>
    </Defs>
  </SvgIcon>
)
