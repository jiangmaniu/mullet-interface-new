export function colorToRGBA(color: string, alpha = 1) {
  // 检查是否为 RGB 格式
  if (color.startsWith('rgb')) {
    const rgb = color.match(/\d+/g)
    if (rgb && rgb.length >= 3) {
      return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`
    }
  }

  // 处理 Hex 格式
  let _color = color.replace('#', '')

  // 将 3 位颜色扩展为 6 位
  if (color.length === 3) {
    _color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2]
  }

  // 如果不是有效的 6 位 Hex，返回原始输入
  if (_color.length !== 6) {
    return _color
  }

  // 解析 R、G、B 值
  const r = parseInt(_color.substring(0, 2), 16)
  const g = parseInt(_color.substring(2, 4), 16)
  const b = parseInt(_color.substring(4, 6), 16)

  // 返回 RGBA 格式的字符串
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Function to lighten or darken a color
export const shadeColor = (color: string, percent: number) => {
  let R: number
  let G: number
  let B: number

  if (color.startsWith('#')) {
    // HEX color processing
    R = parseInt(color.substring(1, 3), 16)
    G = parseInt(color.substring(3, 5), 16)
    B = parseInt(color.substring(5, 7), 16)
  } else if (color.startsWith('rgb')) {
    // RGB color processing
    const rgbValues = color.match(/\d+/g)

    if (!rgbValues || rgbValues.length !== 3) {
      throw new Error('Invalid RGB color format. Expected format: "rgb(R, G, B)".')
    }

    R = parseInt(rgbValues[0])
    G = parseInt(rgbValues[1])
    B = parseInt(rgbValues[2])
  } else {
    throw new Error('Invalid color format. Only HEX and RGB formats are supported.')
  }

  // Adjust color by percentage
  R = (R * (100 + percent)) / 100
  G = (G * (100 + percent)) / 100
  B = (B * (100 + percent)) / 100

  R = R < 255 ? R : 255
  G = G < 255 ? G : 255
  B = B < 255 ? B : 255

  if (color.startsWith('#')) {
    // Return adjusted HEX color
    const RR = R.toString(16).length === 1 ? '0' + R.toString(16) : R.toString(16).slice(0, 2)
    const GG = G.toString(16).length === 1 ? '0' + G.toString(16) : G.toString(16).slice(0, 2)
    const BB = B.toString(16).length === 1 ? '0' + B.toString(16) : B.toString(16).slice(0, 2)
    return `#${RR}${GG}${BB}`
  } else if (color.startsWith('rgb')) {
    // Return adjusted RGB color
    return `rgb(${R}, ${G}, ${B})`
  }
}
