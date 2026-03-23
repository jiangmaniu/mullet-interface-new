# Expo Config Plugins

本目录包含项目的 Expo Config Plugins，用于自动配置原生项目。

## Gradle JVM 内存配置

### 插件：`withGradleJvmArgs.js`

自动配置 Android Gradle 构建的 JVM 内存参数，解决 Metaspace 不足导致的 Daemon 频繁重启问题。

### 使用方式

#### 1. 使用默认配置（团队共享）

不设置任何环境变量，使用默认值：
- 堆空间：4GB
- 元空间：1GB

```bash
npm run android
```

#### 2. 通过环境变量自定义（推荐）

在 `.env.dev.local` 文件中配置（不会提交到 git）：

```bash
# 适用于 M1 Max 64GB
GRADLE_JVM_MAX_HEAP=6144m
GRADLE_JVM_MAX_METASPACE=1536m
GRADLE_JVM_EXTRA_ARGS=-XX:+UseParallelGC -XX:+HeapDumpOnOutOfMemoryError
```

然后正常运行：
```bash
npm run android
```

#### 3. 临时覆盖（单次构建）

```bash
GRADLE_JVM_MAX_HEAP=8192m npm run android
```

### 硬件配置参考

| 内存大小 | GRADLE_JVM_MAX_HEAP | GRADLE_JVM_MAX_METASPACE |
|---------|---------------------|--------------------------|
| 8-16GB  | 3072m               | 768m                     |
| 16-32GB | 4096m (默认)        | 1024m (默认)             |
| 32-64GB | 6144m               | 1536m                    |
| 64GB+   | 8192m               | 2048m                    |

### 环境变量说明

- `GRADLE_JVM_MAX_HEAP`: 最大堆空间（默认 `4096m`）
- `GRADLE_JVM_MAX_METASPACE`: 最大元空间（默认 `1024m`）
- `GRADLE_JVM_EXTRA_ARGS`: 额外的 JVM 参数（可选）

### 常用额外参数

```bash
# 并行垃圾回收（适合多核 CPU）
GRADLE_JVM_EXTRA_ARGS=-XX:+UseParallelGC

# 内存溢出时自动转储（便于调试）
GRADLE_JVM_EXTRA_ARGS=-XX:+HeapDumpOnOutOfMemoryError

# 组合使用
GRADLE_JVM_EXTRA_ARGS="-XX:+UseParallelGC -XX:+HeapDumpOnOutOfMemoryError"
```

### 注意事项

1. **配置生效时机**：修改环境变量后，需要重新运行 `npx expo prebuild` 或 `npm run android` 才会生效
2. **本地配置文件**：`.env.dev.local` 已在 `.gitignore` 中，不会提交到 git
3. **团队协作**：默认配置适合大多数开发者，个人可通过 `.env.dev.local` 覆盖

### 故障排查

如果仍然出现 Metaspace 警告：
1. 检查环境变量是否正确设置：`echo $GRADLE_JVM_MAX_METASPACE`
2. 清理并重新构建：`npx expo prebuild --clean && npm run android`
3. 增加 Metaspace 值：`GRADLE_JVM_MAX_METASPACE=2048m`
