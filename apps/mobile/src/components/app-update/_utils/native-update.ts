import { Linking, Platform } from 'react-native'

import { toast } from '@/components/ui/toast'
import { t } from '@lingui/core/macro'

/**
 * 执行原生更新
 * - iOS: 跳转 App Store / TestFlight
 * - Android: APK 链接 → 浏览器下载；商店链接 → 跳转
 */
export async function performNativeUpdate(downloadUrl: string) {
  if (Platform.OS === 'ios') {
    return openExternalUrl(downloadUrl)
  }

  // Android: 判断是 APK 直链还是商店链接
  if (isApkUrl(downloadUrl)) {
    return downloadAPKInBrowser(downloadUrl)
  }
  return openExternalUrl(downloadUrl)
}

/** 判断是否为 APK 直链 */
function isApkUrl(url: string): boolean {
  return url.endsWith('.apk') || url.includes('.apk?')
}

/** 跳转外部链接（App Store / TestFlight / Google Play 等） */
async function openExternalUrl(url: string) {
  try {
    await Linking.openURL(url)
  } catch (error) {
    toast.error(t`无法打开更新链接`)
  }
}

/** 使用浏览器下载 APK（调用系统 DownloadManager） */
async function downloadAPKInBrowser(downloadUrl: string) {
  try {
    await Linking.openURL(downloadUrl)
  } catch (error) {
    toast.error(t`无法打开下载链接`)
  }
}
