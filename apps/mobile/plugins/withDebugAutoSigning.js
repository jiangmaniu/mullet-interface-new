const { withXcodeProject } = require('@expo/config-plugins')

/**
 * iOS Debug 自动签名插件
 *
 * prebuild --clean 会重置 Xcode 签名设置，此插件确保每次 prebuild 后
 * Debug 配置始终使用 Automatic 签名，免去手动到 Xcode 重新开启。
 *
 * 打包构建时 Fastlane 会通过 update_code_signing_settings 覆盖为手动签名，
 * 不影响 CI/分发构建。
 */
const withDebugAutoSigning = (config) => {
  return withXcodeProject(config, (config) => {
    const project = config.modResults
    const targetName = config.modRequest.projectName

    const pbxNativeTarget = project.pbxNativeTargetSection()
    for (const key of Object.keys(pbxNativeTarget)) {
      const target = pbxNativeTarget[key]
      if (typeof target !== 'object' || target.name !== `"${targetName}"`) continue

      const buildConfigList = project.pbxXCConfigurationList()[target.buildConfigurationList]
      if (!buildConfigList) continue

      for (const ref of buildConfigList.buildConfigurations) {
        const buildConfig = project.pbxXCBuildConfigurationSection()[ref.value]
        if (!buildConfig) continue

        if (buildConfig.name === 'Debug') {
          buildConfig.buildSettings.CODE_SIGN_STYLE = 'Automatic'
        }
      }
    }

    return config
  })
}

module.exports = withDebugAutoSigning
