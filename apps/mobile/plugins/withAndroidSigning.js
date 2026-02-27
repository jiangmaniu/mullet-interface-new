const { withAppBuildGradle } = require('@expo/config-plugins')

/**
 * Android Release 签名配置插件
 *
 * 从 android/signing.properties 读取 keystore 配置，注入到 build.gradle。
 * 如果 signing.properties 不存在，则 fallback 到 debug keystore。
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

    // 在 android { 之前插入 signing.properties 读取逻辑
    const propsLoader = `
def signingPropsFile = file("signing.properties")
def signingProps = new Properties()
if (signingPropsFile.exists()) {
    signingProps.load(new FileInputStream(signingPropsFile))
}
`
    contents = contents.replace(
      'android {',
      propsLoader + '\nandroid {'
    )

    // 在 signingConfigs 的 debug 块后面添加 release 块
    const releaseConfig = `
        release {
            if (signingProps.containsKey('RELEASE_STORE_FILE')) {
                storeFile file(signingProps['RELEASE_STORE_FILE'])
                storePassword signingProps['RELEASE_STORE_PASSWORD']
                keyAlias signingProps['RELEASE_KEY_ALIAS']
                keyPassword signingProps['RELEASE_KEY_PASSWORD']
            }
        }`

    // 匹配 signingConfigs { debug { ... } } 并在 debug 块后追加 release
    contents = contents.replace(
      /(signingConfigs\s*\{[^}]*debug\s*\{[^}]*\})/s,
      `$1\n${releaseConfig}`
    )

    // 将 release buildType 的 signingConfig 从 debug 改为 release
    contents = contents.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug/,
      '$1signingConfig signingProps.containsKey("RELEASE_STORE_FILE") ? signingConfigs.release : signingConfigs.debug'
    )

    config.modResults.contents = contents
    return config
  })
}

module.exports = withAndroidSigning
