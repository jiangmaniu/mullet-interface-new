import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import dotenv from 'dotenv'
import inquirer from 'inquirer'
import shelljs from 'shelljs'

/**
 * Mullet Build Script
 *
 * 交互模式: node scripts/build.mjs
 * 命令行模式: node scripts/build.mjs <ios|android> <dev|test|prod> [选项]
 *
 * iOS 分发方式:
 *   --dist=local       本地直装 (development 签名)
 *   --dist=adhoc       AdHoc 分发 (ad-hoc 签名，可直接发 ipa)
 *   --dist=testflight  上传 TestFlight (app-store 签名)
 *
 * 清理选项:
 *   --clean            清理构建缓存 (默认)
 *   --no-clean         不清理构建缓存
 *
 * 证书管理:
 *   --force-regenerate-certificates    强制重新生成证书（用于证书过期、添加新设备、修改 Capabilities）
 *   --apple-id=<email>                 Apple Developer 账号邮箱（TestFlight 上传或重新生成证书时需要）
 *   --apple-password=<app-password>    Apple 专用密码（TestFlight 上传或重新生成证书时需要）
 */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_DIR = path.resolve(__dirname, '..')

// --- 加载环境变量 ---

/**
 * 从 fastlane/.env.[env].local 加载环境变量
 * @param {string} env - 环境名称 (dev/test/prod)
 */
function loadEnvFile(env) {
  const fileName = `.env.${env}.local`
  const envPath = path.join(PROJECT_DIR, 'fastlane', fileName)
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath })
    if (result.error) {
      console.warn(chalk.yellow(`  警告: 加载 ${fileName} 文件失败: ${result.error.message}`))
    }
    return result.parsed || {}
  }
  return {}
}

// --- 工具函数 ---

function run(cmd, cwd = PROJECT_DIR) {
  console.log(chalk.gray(`\n> ${cmd}`))
  shelljs.env.FORCE_COLOR = '1'
  const result = shelljs.exec(cmd, { cwd })
  if (result.code !== 0) {
    console.error(chalk.red(`\n命令执行失败，退出码: ${result.code}`))
    process.exit(result.code || 1)
  }
}

// --- 参数解析 ---

async function parseArgs() {
  const platformAnswer = await inquirer.prompt([
    {
      name: 'platform',
      type: 'select',
      message: chalk.magentaBright('选择构建平台'),
      choices: [
        { name: '🍎 iOS', value: 'ios' },
        { name: '🤖 Android', value: 'android' },
      ],
    },
  ])

  const envAnswer = await inquirer.prompt([
    {
      name: 'env',
      type: 'select',
      message: chalk.magentaBright('选择环境'),
      choices: [
        { name: '🟢 开发环境 (dev)', value: 'dev' },
        { name: '🟡 测试环境 (test)', value: 'test' },
        { name: '🔴 生产环境 (prod)', value: 'prod' },
      ],
      default: 'test',
    },
  ])

  // 加载对应环境的 .env 文件
  const envVars = loadEnvFile(envAnswer.env)

  const answers = await inquirer.prompt([
    {
      name: 'androidArchs',
      type: 'checkbox',
      message: chalk.magentaBright('选择 Android 架构（多选）'),
      when: () => platformAnswer.platform === 'android',
      choices: [
        { name: 'arm64-v8a (🔥 主流64位设备，覆盖95%的设备，推荐)', value: 'arm64-v8a', checked: true },
        { name: 'armeabi-v7a (旧32位设备，覆盖5%的设备)', value: 'armeabi-v7a', checked: false },
        { name: 'x86 (模拟器)', value: 'x86', checked: false },
        { name: 'x86_64 (模拟器)', value: 'x86_64', checked: false },
      ],
      validate: (answer) => {
        if (answer.length < 1) {
          return '请至少选择一个架构'
        }
        return true
      },
    },
    {
      name: 'iosDist',
      type: 'select',
      message: chalk.magentaBright('选择 iOS 分发方式'),
      when: () => platformAnswer.platform === 'ios',
      choices: [
        { name: '📱 本地直装 (development 签名)', value: 'local' },
        { name: '📦 AdHoc 分发 (发 ipa 给他人安装)', value: 'adhoc' },
        { name: '🚀 TestFlight (上传到 TestFlight)', value: 'testflight' },
      ],
      default: () => {
        if (envAnswer.env === 'dev') {
          return 'local'
        } else if (envAnswer.env === 'test') {
          return 'adhoc'
        } else {
          return 'testflight'
        }
      },
    },
    {
      name: 'forceRegenerateCertificates',
      type: 'select',
      message: chalk.magentaBright('是否强制重新生成证书？（用于证书过期、添加新设备、修改 Capabilities）'),
      default: false,
      when: () => platformAnswer.platform === 'ios',
      choices: [
        { name: '是', value: true },
        { name: '否', value: false },
      ],
    },
    {
      name: 'appleId',
      type: 'input',
      message: chalk.magentaBright('请输入 Apple Developer 账号:'),
      when: () => platformAnswer.platform === 'ios',
      default: envVars.APPLE_ID || '',
      validate: (input) => {
        if (!input || !input.includes('@')) {
          return '请输入有效的邮箱地址'
        }
        return true
      },
    },
    {
      name: 'applePassword',
      type: 'input',
      message: chalk.magentaBright('请输入 Apple 专用密码:'),
      when: (ans) => {
        const needsPassword = ans.iosDist === 'testflight' || ans.forceRegenerateCertificates
        if (needsPassword) {
          console.log('')
          console.log(chalk.gray('  💡 提示: 专用密码获取方式'))
          console.log(chalk.gray('     1. 访问 https://appleid.apple.com'))
          console.log(chalk.gray('     2. 登录后进入"安全"部分'))
          console.log(chalk.gray('     3. 点击"App 专用密码" → "生成密码"'))
          console.log(chalk.gray('     4. 格式: xxxx-xxxx-xxxx-xxxx'))
          console.log('')
        }
        return needsPassword
      },
      default: envVars.APPLE_PASSWORD || '',
      validate: (input) => {
        if (!input || input.length < 4) {
          return '请输入有效的专用密码'
        }
        return true
      },
    },
    {
      name: 'clean',
      type: 'select',
      message: chalk.magentaBright('是否清理构建缓存？'),
      default: true,
      choices: [
        { name: '是', value: true },
        { name: '否', value: false },
      ],
    },
  ])

  return {
    platform: platformAnswer.platform,
    env: envAnswer.env,
    clean: answers.clean,
    androidArchs: answers.androidArchs || ['arm64-v8a'],
    iosDist: answers.iosDist || 'local',
    forceRegenerateCertificates: answers.forceRegenerateCertificates || false,
    appleId: answers.appleId,
    applePassword: answers.applePassword,
  }
}

// --- 产物整理 ---

/**
 * 分析 APK 体积（仅 Android）
 */
function analyzeApkSize(apkPath) {
  if (!fs.existsSync(apkPath)) {
    return null
  }

  const stats = fs.statSync(apkPath)
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2)

  return {
    path: apkPath,
    size: stats.size,
    sizeMB,
  }
}

function organizeArtifacts(platform, env, version, versionCode, selectedArchs = []) {
  // versionCode 已经是 YYYYMMDDHHMM 格式，直接使用
  const timestamp = versionCode

  const buildDir = path.join(PROJECT_DIR, 'build')

  if (platform === 'android') {
    // Android: 所有架构放在同一个目录下
    const dirName = `Mullet-android-${version}-${env}-${timestamp}`
    const outputDir = path.join(buildDir, dirName)
    fs.mkdirSync(outputDir, { recursive: true })

    const apkDir = path.join(PROJECT_DIR, 'android', 'app', 'build', 'outputs', 'apk', 'release')
    const copiedFiles = []

    if (fs.existsSync(apkDir)) {
      const allApkFiles = fs.readdirSync(apkDir).filter((f) => f.endsWith('.apk'))

      allApkFiles.forEach((apkFile) => {
        // 提取架构名称，例如 app-arm64-v8a-release.apk -> arm64-v8a
        const archMatch = apkFile.match(/app-(.+?)-release\.apk/)
        if (!archMatch) return

        const arch = archMatch[1]

        // 只复制选中的架构
        if (selectedArchs.length > 0 && !selectedArchs.includes(arch)) {
          return
        }

        // 创建新的文件名：Mullet-android-arm64-v8a-0.0.1-test-202603171243.apk
        const newFileName = `Mullet-android-${arch}-${version}-${env}-${timestamp}.apk`

        const src = path.join(apkDir, apkFile)
        const dest = path.join(outputDir, newFileName)
        fs.copyFileSync(src, dest)

        console.log(chalk.gray(`  已复制: ${arch} -> ${newFileName}`))
        copiedFiles.push({ arch, outputDir, fileName: newFileName })
      })
    }

    return copiedFiles
  } else if (platform === 'ios') {
    // iOS: 保持原有逻辑
    const dirName = `Mullet-${platform}-${version}-${env}-${timestamp}`
    const outputDir = path.join(buildDir, dirName)
    fs.mkdirSync(outputDir, { recursive: true })

    const ext = 'ipa'
    const srcName = `Mullet-${env}.${ext}`
    const src = path.join(buildDir, srcName)

    if (fs.existsSync(src)) {
      fs.renameSync(src, path.join(outputDir, `${dirName}.${ext}`))
      // iOS build also produces a dSYM zip
      const dsym = path.join(buildDir, `Mullet-${env}.app.dSYM.zip`)
      if (fs.existsSync(dsym)) {
        fs.renameSync(dsym, path.join(outputDir, `${dirName}.app.dSYM.zip`))
      }
    } else {
      console.log(chalk.yellow(`  警告: ${srcName} 未在 build/ 目录中找到`))
    }

    return [{ outputDir }]
  }

  return []
}

// --- 构建流程 ---

async function main() {
  const { platform, env, iosDist, clean, androidArchs, forceRegenerateCertificates, appleId, applePassword } =
    await parseArgs()

  // 从 package.json 读取版本号，注入环境变量供 fastlane 使用
  const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'package.json'), 'utf-8'))
  const version = pkg.version

  // versionCode 使用 YYYYMMDDHHMM 格式的时间戳，保证每次构建唯一且递增
  const now = new Date()
  const versionCode = [
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
  ].join('')

  shelljs.env.VERSION_NAME = version
  shelljs.env.VERSION_CODE = versionCode
  shelljs.env.ENV = env

  // iOS 构建需要设置 APPLE_ID（Match 需要 username）
  if (platform === 'ios' && appleId) {
    shelljs.env.APPLE_ID = appleId
  }

  // TestFlight 上传或重新生成证书需要专用密码
  const needsPassword = (platform === 'ios' && iosDist === 'testflight') || forceRegenerateCertificates

  if (needsPassword) {
    if (!applePassword) {
      console.error(chalk.red('\n错误: TestFlight 上传或重新生成证书需要 Apple 专用密码'))
      process.exit(1)
    }
    shelljs.env.APPLE_PASSWORD = applePassword
    if (forceRegenerateCertificates) {
      shelljs.env.FORCE_REGENERATE_CERTIFICATES = 'true'
    }
  }

  console.log('')
  console.log(chalk.green(`✨ 开始构建 Mullet... (v${version}, 构建号: ${versionCode})`))
  console.log('')

  // Step 1: Prebuild
  console.log(chalk.magentaBright(' [1/4] 执行 expo prebuild... '))
  const cleanFlag = clean ? '--clean' : ''
  run(`pnpm expo-prebuild ${env} --platform ${platform} ${cleanFlag}`.trim())

  // Restore Android signing config (prebuild --clean deletes android/)
  if (platform === 'android') {
    const src = path.join(PROJECT_DIR, 'keystores', 'signing.properties')
    const dest = path.join(PROJECT_DIR, 'android', 'app', 'signing.properties')
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest)
      console.log(chalk.gray('  已恢复 android/signing.properties'))
    } else {
      console.error(chalk.red('  错误: keystores/signing.properties 未找到！'))
      console.error(chalk.red('  请将 keystores/ 目录放到 apps/mobile/ 下（从团队获取）'))
      process.exit(1)
    }
  }

  // Step 2: Pod Install (iOS only)
  if (platform === 'ios') {
    console.log(chalk.magentaBright(' [2/4] 安装 CocoaPods 依赖... '))
    run('bundle exec pod install', path.join(PROJECT_DIR, 'ios'))
  } else {
    console.log(chalk.gray(' [2/4] 跳过 pod install (Android)'))
  }

  // Step 3: Fastlane Build
  console.log(chalk.magentaBright(' [3/4] 执行 Fastlane 构建... '))
  if (platform === 'ios') {
    const iosLaneMap = {
      local: 'build_only',
      adhoc: 'adhoc',
      testflight: 'beta',
    }
    const lane = iosLaneMap[iosDist]
    run(`bundle exec fastlane ios ${lane} --env ${env}`)
  } else {
    run(`bundle exec fastlane android apk --env ${env}`)
  }

  // Step 4: Organize build artifacts
  console.log(chalk.magentaBright(' [4/4] 整理构建产物... '))
  const outputResults = organizeArtifacts(platform, env, version, versionCode, androidArchs)

  // 分析 APK 体积（仅 Android）
  const apkSizes = []
  if (platform === 'android' && outputResults.length > 0) {
    outputResults.forEach((result) => {
      const apkPath = path.join(result.outputDir, result.fileName)
      const sizeInfo = analyzeApkSize(apkPath)
      if (sizeInfo) {
        apkSizes.push({
          name: result.fileName,
          arch: result.arch,
          ...sizeInfo,
        })
      }
    })
  }

  // 构建成功汇总
  console.log('')
  console.log(chalk.green('━'.repeat(50)))
  console.log(chalk.green.bold(' ✅ 构建完成！'))
  console.log(chalk.green('━'.repeat(50)))
  console.log('')
  console.log(chalk.white(` 应用版本:  v${version} (${versionCode})`))
  console.log(chalk.white(` 构建平台:  ${platform === 'ios' ? '🍎 iOS' : '🤖 Android'}`))
  console.log(chalk.white(` 构建环境:  ${env}`))

  if (platform === 'android' && outputResults.length > 0) {
    console.log(chalk.white(` 构建架构:  ${androidArchs.join(', ')}`))
  }
  console.log(chalk.white(` 产物目录:  ${path.relative(PROJECT_DIR, outputResults[0].outputDir)}/`))

  // 显示 APK 体积信息
  if (apkSizes.length > 0) {
    console.log('')
    console.log(chalk.cyan(' 📦 生成的 APK 文件:'))
    apkSizes.forEach((apk) => {
      console.log(chalk.white(`    • ${apk.name.padEnd(40)} `) + chalk.green(`${apk.sizeMB} MB`))
    })
    console.log('')
    console.log(chalk.cyan(' 💡 体积优化提示:'))
    console.log(chalk.gray('    • 已启用 Split APKs（按架构拆分）'))
    console.log(chalk.gray('    • 已启用 R8 混淆和资源压缩'))
    console.log(chalk.gray('    • 单架构 APK 体积约为通用 APK 的 25-30%'))
    console.log(chalk.gray('    • arm64-v8a: 主流设备（覆盖 95%）'))
    console.log(chalk.gray('    • armeabi-v7a: 旧设备'))
  }

  if (platform === 'ios' && iosDist === 'testflight') {
    console.log('')
    console.log(chalk.cyan.bold(' 🚀 TestFlight 上传已提交'))
    console.log(chalk.white('    构建正在 App Store Connect 中处理，通常需要 15-30 分钟'))
    console.log(chalk.white('    处理完成后测试人员会自动收到通知'))
    console.log(chalk.white(`    查看状态: ${chalk.underline('https://appstoreconnect.apple.com')}`))
  } else if (platform === 'ios' && iosDist === 'adhoc') {
    console.log('')
    console.log(chalk.cyan.bold(' 📦 AdHoc IPA 已生成'))
    console.log(chalk.white('    可通过蒲公英、fir.im 等平台分发给测试人员'))
  }

  console.log('')
}

main().catch((err) => {
  console.log(chalk.red('\n  • 你已取消操作，再见！ '))
  process.exit(1)
})
