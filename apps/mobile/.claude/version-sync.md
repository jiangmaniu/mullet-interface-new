# 版本号同步实现

## 概述

实现了版本号的统一管理，所有版本号都基于 `package.json` 中的 `version` 字段，并在构建时添加时间戳。

## 实现细节

### 1. app.config.ts

- ✅ 从 `package.json` 读取版本号
- ✅ 生成构建时间戳（格式：YYYYMMDDHHMM）
- ✅ 将版本号设置到 `ExpoConfig.version`
- ✅ 将版本号、环境名称和构建时间添加到 `extra` 配置中

### 2. 类型定义 (types/expo.d.ts)

- ✅ 添加 `APP_VERSION: string` - 应用版本号
- ✅ 添加 `APP_ENV: string` - 环境名称 (dev/test/prod)
- ✅ 添加 `BUILD_TIME: string` - 构建时间戳

### 3. 设置页面 (settings/index.tsx)

- ✅ 从 `EXPO_ENV_CONFIG` 读取版本号、环境和构建时间
- ✅ "关于Mullet" 旁边显示动态版本号（包含构建时间）

### 4. 关于页面 (settings/about/index.tsx)

- ✅ 从 `EXPO_ENV_CONFIG` 读取版本号、环境和构建时间
- ✅ Logo 下方和检查更新处显示动态版本号（包含构建时间）

### 5. 打包脚本 (scripts/build.mjs)

- ✅ 已经从 `package.json` 读取版本号
- ✅ 打包文件名格式：`Mullet-{platform}-{version}-{env}-{timestamp}`

## 版本号显示位置

1. **设置页面** - "关于Mullet" 右侧
2. **关于页面** - Logo 下方和检查更新处
3. **打包文件名** - 构建产物的文件名

## 使用方式

只需要修改 `package.json` 中的 `version` 字段，所有地方的版本号都会自动同步：

- App 配置中的版本号
- 设置页面显示的版本号（包含构建时间）
- 关于页面显示的版本号（包含构建时间）
- 打包产物的文件名

构建时间会在每次构建时自动生成，无需手动维护。

## 示例

```json
// package.json
{
  "version": "1.0.0"
}
```

显示效果（假设构建时间为 2026年3月12日 14:30）：

- dev 环境：`v1.0.0-dev (202603121430)`
- test 环境：`v1.0.0-test (202603121430)`
- prod 环境：`v1.0.0 (202603121430)`

打包文件名：

- `Mullet-ios-1.0.0-test-202603121430.ipa`
- `Mullet-android-1.0.0-prod-202603121430.apk`
