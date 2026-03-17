/**
 * Expo Config Plugin: Android Split APKs（按架构拆分）
 *
 * 自动配置 build.gradle 以启用 Split APKs
 * 效果：减少 50-70% 的 APK 体积
 */

const { withAppBuildGradle } = require('@expo/config-plugins')

module.exports = function withSplitApks(config) {
  return withAppBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents

    // 检查是否已经配置了 splits
    if (buildGradle.includes('splits {')) {
      return config
    }

    // 在 signingConfigs 块前面添加 splits 配置
    const splitsConfig = `
    // ========== APK 体积优化：按架构拆分 ==========
    splits {
        abi {
            reset()
            enable true
            universalApk false  // 不生成通用 APK
            include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
        }
    }

    // 为不同架构的 APK 设置不同的 versionCode
    def abiCodes = ['armeabi-v7a': 1, 'arm64-v8a': 2, 'x86': 3, 'x86_64': 4]
    android.applicationVariants.all { variant ->
        variant.outputs.each { output ->
            def abiName = output.getFilter(com.android.build.OutputFile.ABI)
            if (abiName != null) {
                output.versionCodeOverride = abiCodes.get(abiName, 0) * 1000 + variant.versionCode
            }
        }
    }
`

    // 在 signingConfigs 前面插入
    const signingConfigsRegex = /(\s+)signingConfigs\s*\{/
    if (signingConfigsRegex.test(buildGradle)) {
      buildGradle = buildGradle.replace(signingConfigsRegex, `${splitsConfig}$1signingConfigs {`)
      config.modResults.contents = buildGradle
    }

    return config
  })
}
