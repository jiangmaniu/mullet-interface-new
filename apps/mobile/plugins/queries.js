// Android 钱包检测配置
// https://docs.reown.com/appkit/react-native/core/installation#enable-wallet-detection
// based on https://github.com/expo/config-plugins/issues/123#issuecomment-1746757954

const { withAndroidManifest, createRunOncePlugin } = require('expo/config-plugins')

const queries = {
  package: [
    // Solana 钱包
    { $: { 'android:name': 'app.phantom' } },
    { $: { 'android:name': 'com.solflare.mobile' } },
    { $: { 'android:name': 'app.backpack' } },
    { $: { 'android:name': 'com.glow.android' } },
    // 其他常用钱包
    { $: { 'android:name': 'com.wallet.crypto.trustapp' } },
    { $: { 'android:name': 'me.rainbow' } },
    { $: { 'android:name': 'io.zerion.android' } },
    { $: { 'android:name': 'io.gnosis.safe' } },
    { $: { 'android:name': 'com.uniswap.mobile' } },
  ],
}

/**
 * @param {import('@expo/config-plugins').ExportedConfig} config
 */
const withAndroidManifestService = (config) => {
  return withAndroidManifest(config, (config) => {
    config.modResults.manifest = {
      ...config.modResults.manifest,
      queries,
    }

    return config
  })
}

module.exports = createRunOncePlugin(withAndroidManifestService, 'withAndroidManifestService', '1.0.0')
