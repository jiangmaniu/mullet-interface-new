/**
 * Expo Config Plugin: Android APK 体积优化
 *
 * 自动配置 gradle.properties 以启用：
 * - R8 代码混淆和优化
 * - 资源压缩
 * - Bundle 压缩
 */

const { withGradleProperties } = require('@expo/config-plugins')

module.exports = function withApkOptimization(config) {
  return withGradleProperties(config, (config) => {
    // 检查是否已经存在优化配置
    const hasOptimization = config.modResults.some(
      (item) => item.type === 'property' && item.key === 'android.enableMinifyInReleaseBuilds'
    )

    if (!hasOptimization) {
      config.modResults.push(
        {
          type: 'comment',
          value: ' ========== APK 体积优化配置 ==========',
        },
        {
          type: 'property',
          key: 'android.enableMinifyInReleaseBuilds',
          value: 'true',
        },
        {
          type: 'property',
          key: 'android.enableShrinkResourcesInReleaseBuilds',
          value: 'true',
        },
        {
          type: 'property',
          key: 'android.enableBundleCompression',
          value: 'true',
        }
      )
    }

    return config
  })
}
