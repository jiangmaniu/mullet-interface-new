const { withAppBuildGradle } = require('@expo/config-plugins')

/**
 * Android Release 签名配置插件
 *
 * 从 android/signing.properties 读取 keystore 配置，注入到 build.gradle。
 * 本地开发（debug）时如果 signing.properties 不存在会自动跳过，不影响调试。
 * 正式构建（release）时如果缺少签名配置会报错终止。
 *
 * signing.properties 格式：
 *   RELEASE_STORE_FILE=../../keystores/mullet-release.keystore
 *   RELEASE_STORE_PASSWORD=xxx
 *   RELEASE_KEY_ALIAS=mullet-key
 *   RELEASE_KEY_PASSWORD=xxx
 */
const withAndroidSigning = (config) => {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents

    const propsLoader = `
def signingPropsFile = file("signing.properties")
def signingProps = null
if (signingPropsFile.exists()) {
    signingProps = new Properties()
    signingProps.load(new FileInputStream(signingPropsFile))
}
`
    contents = contents.replace(
      'android {',
      propsLoader + '\nandroid {'
    )

    const releaseConfig = `
        if (signingProps != null) {
            release {
                storeFile file(signingProps['RELEASE_STORE_FILE'])
                storePassword signingProps['RELEASE_STORE_PASSWORD']
                keyAlias signingProps['RELEASE_KEY_ALIAS']
                keyPassword signingProps['RELEASE_KEY_PASSWORD']
            }
        }`

    contents = contents.replace(
      /(signingConfigs\s*\{[^}]*debug\s*\{[^}]*\})/s,
      `$1\n${releaseConfig}`
    )

    contents = contents.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug/,
      '$1signingConfig signingProps != null ? signingConfigs.release : signingConfigs.debug'
    )

    config.modResults.contents = contents
    return config
  })
}

module.exports = withAndroidSigning
