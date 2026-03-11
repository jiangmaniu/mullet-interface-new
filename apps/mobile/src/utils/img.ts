import { type ImageSourcePropType } from 'react-native'

import { EXPO_ENV_CONFIG } from '@/constants/expo'

const FALLBACK_IMAGE = require('../assets/images/fallback/common.png')

/**
 * 判断是否是图片
 * @param filePath
 * @returns
 */
export function isImageFile(filePath: any) {
  // 定义正则表达式，用于匹配常见的图片文件扩展名
  const imagePattern = /\.(jpeg|jpg|gif|png|bmp|svg|webp|tiff|ico)$/i
  // 使用正则表达式进行匹配
  return imagePattern.test(filePath)
}

/**
 * 获取图片 source（兼容本地 require 和远程 URL）
 */
export function getImgSource(
  imgUrl?: string,
  options: { withFallback?: boolean; fallbackUrl?: string } = {},
): ImageSourcePropType {
  const { withFallback = true, fallbackUrl } = options
  const imgDomain = EXPO_ENV_CONFIG.IMG_DOMAIN

  // 完整远程 URL 直接透传
  if (imgUrl && /^https?:\/\//.test(imgUrl)) {
    return { uri: imgUrl }
  }

  // 相对路径拼接 imgDomain
  if (imgUrl && imgDomain && isImageFile(imgUrl)) {
    return { uri: `${imgDomain}/${imgUrl}` }
  }

  if (withFallback) {
    return fallbackUrl ? { uri: fallbackUrl } : FALLBACK_IMAGE
  }

  return { uri: '' }
}
