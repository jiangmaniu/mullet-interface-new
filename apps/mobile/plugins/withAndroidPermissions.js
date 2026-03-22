/**
 * Expo Config Plugin: 修复 Android 权限冲突
 *
 * 解决 WRITE_EXTERNAL_STORAGE 权限的 android:maxSdkVersion 冲突警告：
 * 某些依赖库声明该权限时不带 maxSdkVersion，与主 manifest 冲突
 * 通过 tools:node="merge" + tools:replace 强制合并解决
 */

const { withAndroidManifest } = require('@expo/config-plugins')

module.exports = function withAndroidPermissions(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest

    // 确保 xmlns:tools 已声明
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools'
    }

    const permissions = manifest['uses-permission'] || []

    // 找到 WRITE_EXTERNAL_STORAGE 权限并修复
    const writeStoragePerm = permissions.find(
      (p) => p.$['android:name'] === 'android.permission.WRITE_EXTERNAL_STORAGE'
    )

    if (writeStoragePerm) {
      writeStoragePerm.$['android:maxSdkVersion'] = '32'
      writeStoragePerm.$['tools:replace'] = 'android:maxSdkVersion'
      writeStoragePerm.$['tools:node'] = 'merge'
    }

    // 同样修复 READ_EXTERNAL_STORAGE
    const readStoragePerm = permissions.find(
      (p) => p.$['android:name'] === 'android.permission.READ_EXTERNAL_STORAGE'
    )

    if (readStoragePerm) {
      readStoragePerm.$['android:maxSdkVersion'] = '32'
      readStoragePerm.$['tools:replace'] = 'android:maxSdkVersion'
      readStoragePerm.$['tools:node'] = 'merge'
    }

    return config
  })
}
