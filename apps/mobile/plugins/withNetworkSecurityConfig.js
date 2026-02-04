const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');
const { Paths } = require('@expo/config-plugins/build/android');
const fs = require('fs');
const path = require('path');

/**
 * 网络安全配置内容
 * 解决 Android SSL 证书验证问题：Trust anchor for certification path not found
 */
const networkSecurityConfigXml = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- 基础配置 - 适用于所有域名，信任系统和用户证书 -->
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>

    <!-- API 服务器域名配置 - 临时允许 HTTP，等服务器修复 SSL 证书后改回 false -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">mullet.top</domain>
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </domain-config>
</network-security-config>
`;

/**
 * 创建网络安全配置文件
 */
function createNetworkSecurityConfig(projectRoot) {
  const resPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');
  const xmlPath = path.join(resPath, 'xml');

  // 确保 xml 目录存在
  if (!fs.existsSync(xmlPath)) {
    fs.mkdirSync(xmlPath, { recursive: true });
  }

  // 写入网络安全配置文件
  const configPath = path.join(xmlPath, 'network_security_config.xml');
  fs.writeFileSync(configPath, networkSecurityConfigXml);

  console.log('✅ Created network_security_config.xml');
}

/**
 * 修改 AndroidManifest.xml 添加 networkSecurityConfig 属性
 */
const withNetworkSecurityConfig = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // 获取 application 节点
    const application = androidManifest.manifest.application?.[0];
    if (application) {
      // 添加 networkSecurityConfig 属性
      application.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    }

    // 创建网络安全配置文件
    createNetworkSecurityConfig(config.modRequest.projectRoot);

    return config;
  });
};

module.exports = withNetworkSecurityConfig;
