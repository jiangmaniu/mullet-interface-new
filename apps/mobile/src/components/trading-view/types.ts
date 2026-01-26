import { ViewStyle } from 'react-native'

export interface ChartData {
  time: number
  value: number
}

// Base properties shared by all chart implementations
export interface BaseChartProps {
  className?: string
  style?: ViewStyle
  data: ChartData[]
  textColor?: string
  backgroundColor?: string
}

// Specific properties for Area/Line/Sparkline charts
export interface AreaChartProps extends BaseChartProps {
  lineColor?: string
  topColor?: string
  bottomColor?: string
  lineWidth?: number
}
