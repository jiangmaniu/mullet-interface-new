const { withAndroidManifest } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

/**
 * Android APK 安装配置插件
 *
 * 1. 添加 REQUEST_INSTALL_PACKAGES 权限（Android 8+ 安装第三方 APK 必需）
 * 2. 配置 FileProvider（Android 7+ 要求用 content:// URI 共享文件）
 * 3. 创建 file_paths.xml 资源文件
 */

const filePathsXml = `<?xml version="1.0" encoding="utf-8"?>
<paths>
    <cache-path name="apk_cache" path="." />
</paths>
`

function createFilePathsXml(projectRoot) {
  const xmlPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'xml')

  if (!fs.existsSync(xmlPath)) {
    fs.mkdirSync(xmlPath, { recursive: true })
  }

  fs.writeFileSync(path.join(xmlPath, 'file_paths.xml'), filePathsXml)
  console.log('✅ Created file_paths.xml for APK installation')
}

const withInstallApk = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults

    // 1. 添加 REQUEST_INSTALL_PACKAGES 权限
    const permissions = androidManifest.manifest['uses-permission'] || []
    const hasPermission = permissions.some(
      (p) => p.$['android:name'] === 'android.permission.REQUEST_INSTALL_PACKAGES'
    )
    if (!hasPermission) {
      permissions.push({
        $: { 'android:name': 'android.permission.REQUEST_INSTALL_PACKAGES' },
      })
      androidManifest.manifest['uses-permission'] = permissions
    }

    // 2. 配置 FileProvider
    const application = androidManifest.manifest.application?.[0]
    if (application) {
      const providers = application.provider || []

      // 获取包名
      const packageName = config.android?.package || 'com.mullet.mobile'
      const authority = `${packageName}.fileprovider`

      const hasProvider = providers.some(
        (p) => p.$['android:authorities'] === authority
      )

      if (!hasProvider) {
        providers.push({
          $: {
            'android:name': 'androidx.core.content.FileProvider',
            'android:authorities': authority,
            'android:exported': 'false',
            'android:grantUriPermissions': 'true',
          },
          'meta-data': [
            {
              $: {
                'android:name': 'android.support.FILE_PROVIDER_PATHS',
                'android:resource': '@xml/file_paths',
              },
            },
          ],
        })
        application.provider = providers
      }
    }

    // 3. 创建 file_paths.xml
    createFilePathsXml(config.modRequest.projectRoot)

    return config
  })
}

module.exports = withInstallApk
