import { filesize } from 'filesize'
import { Platform } from 'react-native'
import RNFS from 'react-native-fs'

// 递归计算缓存大小
const getCacheSizeRecursive = async (dirPath: any) => {
  try {
    const files = await RNFS.readDir(dirPath)
    let totalSize = 0

    for (const file of files) {
      if (file.isDirectory()) {
        totalSize += await getCacheSizeRecursive(file.path)
      } else {
        const stats = await RNFS.stat(file.path)
        totalSize += stats.size
      }
    }
    return totalSize
  } catch (err) {
    // console.log('Error while getting cache size:', err)
    return 0
  }
}

export const getCacheSize = async () => {
  const cachePath = Platform.OS === 'ios' ? `${RNFS.LibraryDirectoryPath}/Caches` : RNFS.CachesDirectoryPath
  const totalSizeInBytes = await getCacheSizeRecursive(cachePath)
  if (!totalSizeInBytes) return '0MB'
  return filesize(totalSizeInBytes, { round: 2 })
}
export const clearAppCache = async () => {
  const cachePath = Platform.OS === 'ios' ? RNFS.LibraryDirectoryPath + '/Caches' : RNFS.CachesDirectoryPath
  try {
    await RNFS.unlink(cachePath)
    // console.log('Cache cleared successfully.')
  } catch (err) {
    // console.log('Error while clearing cache:', err)
  }
}
