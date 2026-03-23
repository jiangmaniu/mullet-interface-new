/**
 * Expo Config Plugin: Xcode 构建性能优化
 *
 * 支持通过环境变量动态配置 Xcode 并行编译参数：
 * - XCODE_PARALLEL_BUILD_THREADS: 并行编译线程数（默认 4）
 *
 * 使用方式：
 * 1. 在 .env.dev.local 中设置（不提交到 git）：
 *    XCODE_PARALLEL_BUILD_THREADS=10
 *
 * 2. 或在命令行中设置：
 *    XCODE_PARALLEL_BUILD_THREADS=10 npm run ios
 */

const { withXcodeProject } = require('@expo/config-plugins')

module.exports = function withXcodeBuildSettings(config) {
  return withXcodeProject(config, (config) => {
    const parallelThreads = process.env.XCODE_PARALLEL_BUILD_THREADS || '4'
    const project = config.modResults

    // 获取所有构建配置（Debug 和 Release）
    const buildConfigurations = project.pbxXCBuildConfigurationSection()

    Object.values(buildConfigurations).forEach((buildConfig) => {
      if (typeof buildConfig !== 'object' || !buildConfig.buildSettings) return

      // 设置并行编译线程数
      buildConfig.buildSettings.COMPILER_INDEX_STORE_ENABLE = 'NO'
      buildConfig.buildSettings.SWIFT_COMPILATION_MODE =
        buildConfig.buildSettings.CONFIGURATION === 'Release' ? 'wholemodule' : 'incremental'
    })

    // 通过 pbxProject 设置并行构建数量
    const xcConfigSettings = project.pbxProjectSection()
    Object.values(xcConfigSettings).forEach((projectSection) => {
      if (typeof projectSection !== 'object' || !projectSection.attributes) return
      if (!projectSection.attributes.BuildIndependentTargetsInParallel) {
        projectSection.attributes.BuildIndependentTargetsInParallel = 'YES'
      }
    })

    return config
  })
}
