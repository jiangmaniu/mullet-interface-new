import React, { useMemo } from 'react'
import { ViewStyle } from 'react-native'
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg'

interface SparkLineProps {
  /** 数据点数组，空数组时显示居中横线 */
  data: { time: number; value: number }[]
  /** 线条颜色 */
  color: string
  /** 宽度 */
  width: number
  /** 高度 */
  height: number
  /** 线条宽度 */
  strokeWidth?: number
  /** 是否显示面积填充 */
  fillEnabled?: boolean
  style?: ViewStyle
}

/**
 * 将数据点转换为 SVG path 字符串，所有值相同时画居中横线
 */
function buildLinePath(data: { value: number }[], width: number, height: number, padding = 1): string {
  if (data.length < 2) return ''

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min

  // 所有值相同，画居中横线
  if (range === 0) {
    const midY = height / 2
    return `M0,${midY.toFixed(2)} L${width.toFixed(2)},${midY.toFixed(2)}`
  }

  const stepX = width / (data.length - 1)

  return data
    .map((point, i) => {
      const x = i * stepX
      const y = height - padding - ((point.value - min) / range) * (height - padding * 2)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
}

/**
 * 构建面积填充的闭合 path
 */
function buildAreaPath(linePath: string, width: number, height: number): string {
  if (!linePath) return ''
  return `${linePath} L${width.toFixed(2)},${height} L0,${height} Z`
}

export const SparkLine = React.memo(function SparkLine({
  data = [],
  color,
  width,
  height,
  strokeWidth = 1,
  fillEnabled = false,
  style,
}: SparkLineProps) {
  const { linePath, areaPath } = useMemo(() => {
    // 空数组或只有 1 个点时画居中横线
    if (data.length < 2) {
      const midY = height / 2
      const line = `M0,${midY.toFixed(2)} L${width.toFixed(2)},${midY.toFixed(2)}`
      const area = fillEnabled ? buildAreaPath(line, width, height) : ''
      return { linePath: line, areaPath: area }
    }
    const line = buildLinePath(data, width, height)
    const area = fillEnabled ? buildAreaPath(line, width, height) : ''
    return { linePath: line, areaPath: area }
  }, [data, width, height, fillEnabled])

  if (!linePath) return null

  const gradientId = `sparkGrad_${color.replace('#', '')}`

  return (
    <Svg width={width} height={height} style={style}>
      {fillEnabled && (
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.4} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
      )}
      {fillEnabled && areaPath ? <Path d={areaPath} fill={`url(#${gradientId})`} /> : null}
      <Path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
})
