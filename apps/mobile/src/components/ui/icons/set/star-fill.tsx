import { Path } from "react-native-svg"
import { SvgIcon, SvgIconProps } from "../svg-icon"

export const IconStarFill = ({ ...props }: SvgIconProps) => (
  <SvgIcon width='22' height='22' viewBox='0 0 22 22' fill="none" {...props}>
    <Path
      fill='currentColor'
      stroke='currentColor'
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m7.872 7.55 2.381-4.796a.835.835 0 0 1 1.494 0L14.13 7.55l5.324.773a.827.827 0 0 1 .46 1.414l-3.851 3.73.91 5.271c.116.677-.6 1.192-1.21.873L11 17.121l-4.762 2.49c-.61.32-1.325-.196-1.209-.873l.91-5.271-3.853-3.731a.827.827 0 0 1 .462-1.412l5.324-.774Z"
    />
  </SvgIcon>
)
