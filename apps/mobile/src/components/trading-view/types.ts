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

// OHLC data point for candlestick charts
export interface CandlestickData {
  time: string | number
  open: number
  high: number
  low: number
  close: number
}

// MACD data point
export interface MACDData {
  time: string | number
  macd: number
  signal: number // DIF
  histogram: number // DEA
}

// MA line data point
export interface MALineData {
  time: string | number
  value: number
}

// Specific properties for Candlestick/K-Line charts
export interface CandlestickChartProps extends Omit<BaseChartProps, 'data'> {
  data: CandlestickData[]
  liveCandle?: CandlestickData
  upColor?: string
  downColor?: string
  wickUpColor?: string
  wickDownColor?: string
  borderUpColor?: string
  borderDownColor?: string
  showGrid?: boolean
  showTimeScale?: boolean
  showPriceScale?: boolean
  watermarkImage?: string
  // MA lines
  ma5Data?: MALineData[]
  ma10Data?: MALineData[]
  ma30Data?: MALineData[]
}
