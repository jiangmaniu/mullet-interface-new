/**
 * Expo Config Plugin: ProGuard 规则
 *
 * 自动添加必要的 ProGuard 规则以避免 R8 混淆错误
 */

const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

const PROGUARD_RULES = `
# ========== APK 体积优化：ProGuard 规则 ==========

# React Native 核心
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# JNA (Java Native Access) - 修复 R8 混淆错误
-dontwarn java.awt.**
-dontwarn javax.swing.**
-keep class com.sun.jna.** { *; }
-keep class * implements com.sun.jna.** { *; }

# Expo 模块
-keep class expo.modules.** { *; }
-keep class com.facebook.react.bridge.** { *; }

# Solana Web3.js
-keep class org.bitcoinj.** { *; }
-dontwarn org.bitcoinj.**

# 保留 native 方法
-keepclasseswithmembernames class * {
    native <methods>;
}

# 保留枚举
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# 保留 Parcelable
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# 保留 Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
`

module.exports = function withProguardOptimization(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const proguardPath = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'proguard-rules.pro'
      )

      if (fs.existsSync(proguardPath)) {
        let content = fs.readFileSync(proguardPath, 'utf-8')

        // 检查是否已经添加了规则
        if (!content.includes('APK 体积优化：ProGuard 规则')) {
          content += PROGUARD_RULES
          fs.writeFileSync(proguardPath, content)
        }
      }

      return config
    },
  ])
}
