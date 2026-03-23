/**
 * Expo Config Plugin: Gradle JVM 内存配置
 *
 * 支持通过环境变量动态配置 JVM 参数：
 * - GRADLE_JVM_MAX_HEAP: 最大堆空间（默认 4096m）
 * - GRADLE_JVM_MAX_METASPACE: 最大元空间（默认 1024m）
 * - GRADLE_JVM_EXTRA_ARGS: 额外的 JVM 参数（可选）
 *
 * 使用方式：
 * 1. 在 .env.dev.local 中设置（不提交到 git）：
 *    GRADLE_JVM_MAX_HEAP=6144m
 *    GRADLE_JVM_MAX_METASPACE=1536m
 *    GRADLE_JVM_EXTRA_ARGS=-XX:+UseParallelGC
 *
 * 2. 或在命令行中设置：
 *    GRADLE_JVM_MAX_HEAP=6144m npm run android
 */

const { withGradleProperties } = require('@expo/config-plugins')

module.exports = function withGradleJvmArgs(config) {
  return withGradleProperties(config, (config) => {
    // 从环境变量读取配置，如果没有则使用默认值
    const maxHeap = process.env.GRADLE_JVM_MAX_HEAP || '4096m'
    const maxMetaspace = process.env.GRADLE_JVM_MAX_METASPACE || '1024m'
    const extraArgs = process.env.GRADLE_JVM_EXTRA_ARGS || ''

    // 构建 JVM 参数字符串
    const jvmArgs = [
      `-Xmx${maxHeap}`,
      `-XX:MaxMetaspaceSize=${maxMetaspace}`,
      extraArgs,
    ]
      .filter(Boolean)
      .join(' ')

    // 查找现有的 org.gradle.jvmargs 配置
    const jvmArgsIndex = config.modResults.findIndex(
      (item) => item.type === 'property' && item.key === 'org.gradle.jvmargs'
    )

    if (jvmArgsIndex !== -1) {
      // 更新现有配置
      config.modResults[jvmArgsIndex].value = jvmArgs
    } else {
      // 添加新配置
      config.modResults.push(
        {
          type: 'comment',
          value: ' ========== JVM 内存配置（支持环境变量） ==========',
        },
        {
          type: 'property',
          key: 'org.gradle.jvmargs',
          value: jvmArgs,
        }
      )
    }

    return config
  })
}
