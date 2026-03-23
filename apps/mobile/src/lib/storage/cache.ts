import { Platform } from 'react-native'
import RNFS from 'react-native-fs'

/** 递归计算目录大小（字节） */
async function getDirSizeRecursive(dirPath: string): Promise<number> {
  try {
    const items = await RNFS.readDir(dirPath)
    let total = 0

    for (const item of items) {
      if (item.isDirectory()) {
        total += await getDirSizeRecursive(item.path)
      } else {
        const stat = await RNFS.stat(item.path)
        total += stat.size
      }
    }

    return total
  } catch {
    return 0
  }
}

/** 将字节数格式化为可读字符串，如 "12.34 MB" */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(2)} ${units[i]}`
}

const getCacheDir = () =>
  Platform.OS === 'ios'
    ? `${RNFS.LibraryDirectoryPath}/Caches`
    : RNFS.CachesDirectoryPath

/**
 * 获取 App 缓存目录大小
 * @returns 格式化后的大小字符串，如 "12.34 MB"
 */
export async function getCacheSize(): Promise<string> {
  const bytes = await getDirSizeRecursive(getCacheDir())
  return formatBytes(bytes)
}

/**
 * 清除 App 缓存目录
 * 清除范围：图片缓存、网络缓存、WebView 缓存等系统可重建的临时文件
 * 不影响：MMKV 持久化数据、用户登录态
 */
export async function clearAppCache(): Promise<void> {
  const cacheDir = getCacheDir()
  try {
    const items = await RNFS.readDir(cacheDir)
    await Promise.all(
      items.map((item) => RNFS.unlink(item.path)),
    )
  } catch (err) {
    console.warn('clearAppCache error:', err)
  }
}
