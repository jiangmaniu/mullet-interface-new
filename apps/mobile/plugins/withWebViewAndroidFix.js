/**
 * Expo Config Plugin: 修复 Android 16+ 上 react-native-webview onMessage 不触发的问题
 *
 * 根因：新版 Android WebView 支持 WEB_MESSAGE_LISTENER 特性时，
 * react-native-webview 使用 addWebMessageListener 注入 ReactNativeWebView 原生对象。
 * 但在 Android 16 上，addWebMessageListener 对 file:// origin 的页面存在安全限制，
 * 导致 ReactNativeWebView.postMessage 静默失败，onMessage 永远不触发。
 *
 * 修复方案：patch RNCWebView.java，强制禁用 WEB_MESSAGE_LISTENER 路径，
 * 让所有 Android 版本走 addJavascriptInterface（稳定路径，无 origin 限制）。
 */

const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

const RNC_WEBVIEW_PATH = path.join(
  'node_modules',
  'react-native-webview',
  'android',
  'src',
  'main',
  'java',
  'com',
  'reactnativecommunity',
  'webview',
  'RNCWebView.java'
)

// 原始代码：用 WEB_MESSAGE_LISTENER feature 检测走分支
const ORIGINAL = `if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)){`

// 替换为：强制返回 false，始终走 addJavascriptInterface
const PATCHED = `if (false /* WEB_MESSAGE_LISTENER disabled: file:// origin not supported on Android 16+ */){`

function withWebViewAndroidFix(config) {
  return withDangerousMod(config, [
    'android',
    (config) => {
      const filePath = path.join(config.modRequest.projectRoot, RNC_WEBVIEW_PATH)

      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  withWebViewAndroidFix: RNCWebView.java not found at ${filePath}`)
        return config
      }

      let content = fs.readFileSync(filePath, 'utf8')

      if (content.includes(PATCHED)) {
        console.log('ℹ️  withWebViewAndroidFix: already patched, skipping')
        return config
      }

      if (!content.includes(ORIGINAL)) {
        console.warn('⚠️  withWebViewAndroidFix: original code not found, RNCWebView.java may have changed')
        return config
      }

      content = content.replace(ORIGINAL, PATCHED)
      fs.writeFileSync(filePath, content, 'utf8')
      console.log('✅ withWebViewAndroidFix: RNCWebView.java patched successfully')

      return config
    },
  ])
}

module.exports = withWebViewAndroidFix
