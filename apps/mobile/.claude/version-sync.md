# 版本号同步实现

## 概述

实现了版本号的统一管理，所有版本号都基于 `package.json` 中的 `version` 字段。

## 实现细节

### 1. app.config.ts
- ✅ 从 `package.json` 读取版本号
- ✅ 将版本号设置到 `ExpoConfig.version`
- ✅ 将版本号和环境名称添加到 `extra` 配置中

### 2. 类型定义 (types/expo.d.ts)
- ✅ 添加 `APP_VERSION: string` - 应用版本号
- ✅ 添加 `APP_ENV: string` - 环境名称 (dev/test/prod)

### 3. 关于页面 (settings/about/index.tsx)
- ✅ 从 `EXPO_ENV_CONFIG` 读取版本号和环境
- ✅ 生成格式：
  - 生产环境：`v1.0.0`
  - 非生产环境：`v1.0.0-dev` 或 `v1.0.0-test`

### 4. 打包脚本 (scripts/build.mjs)
- ✅ 已经从 `package.json` 读取版本号
- ✅ 打包文件名格式：`Mullet-{platform}-{version}-{env}-{timestamp}`

## 使用方式

只需要修改 `package.json` 中的 `version` 字段，所有地方的版本号都会自动同步：
- App 配置中的版本号
- 设置页面显示的版本号
- 打包产物的文件名

## 示例

```json
// package.json
{
  "version": "1.0.0"
}
```

显示效果：
- dev 环境：`v1.0.0-dev`
- test 环境：`v1.0.0-test`
- prod 环境：`v1.0.0`

打包文件名：
- `Mullet-ios-1.0.0-test-202603121430.ipa`
- `Mullet-android-1.0.0-prod-202603121430.apk`
