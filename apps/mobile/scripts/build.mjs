import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import inquirer from 'inquirer'
import semver from 'semver'
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
 * 证书管理:
 *   --force-regenerate-certificates    强制重新生成证书（用于证书过期、添加新设备、修改 Capabilities）
 */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_DIR = path.resolve(__dirname, '..')

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
  ])

  return {
    platform: platformAnswer.platform,
    env: envAnswer.env,
    androidArchs: answers.androidArchs || ['arm64-v8a'],
    iosDist: answers.iosDist || 'local',
    forceRegenerateCertificates: answers.forceRegenerateCertificates || false,
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
  const { platform, env, iosDist, androidArchs, forceRegenerateCertificates } = await parseArgs()

  // 从 package.json 读取版本号
  const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'package.json'), 'utf-8'))
  const currentVersion = pkg.version
  const originalVersion = currentVersion // 保存原始版本号，用于构建失败时回滚

  // 版本号选择（构建前，确保新版本号打进包里）
  const { bumpVersion } = await inquirer.prompt([
    {
      name: 'bumpVersion',
      type: 'select',
      message: chalk.magentaBright(`是否修改版本号？(当前版本: ${currentVersion})`),
      choices: [
        { name: `跳过 ${chalk.gray(`(${currentVersion})`)}`, value: 'skip' },
        { name: `补丁 ${chalk.gray(`(${currentVersion} → ${semver.inc(currentVersion, 'patch')})`)}`, value: 'patch' },
        {
          name: `小版本 ${chalk.gray(`(${currentVersion} → ${semver.inc(currentVersion, 'minor')})`)}`,
          value: 'minor',
        },
        {
          name: `大版本 ${chalk.gray(`(${currentVersion} → ${semver.inc(currentVersion, 'major')})`)}`,
          value: 'major',
        },
        { name: `自定义 ${chalk.gray(`(x.x.x)`)}`, value: 'custom' },
      ],
    },
  ])

  let version = currentVersion
  if (bumpVersion === 'custom') {
    const { customVersion } = await inquirer.prompt([
      {
        name: 'customVersion',
        type: 'input',
        message: chalk.magentaBright('请输入版本号:'),
        validate: (input) => {
          if (!semver.valid(input)) {
            return '请输入有效的 semver 版本号，如 1.2.3'
          }
          return true
        },
      },
    ])
    version = customVersion
  } else if (bumpVersion !== 'skip') {
    version = semver.inc(currentVersion, bumpVersion)
  }

  if (version !== currentVersion) {
    pkg.version = version
    fs.writeFileSync(path.join(PROJECT_DIR, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')
    console.log(chalk.green(`  ✅ 版本号已修改: ${currentVersion} → ${version}`))
  }

  // versionCode 使用 YYYYMMDDHHMM 格式的时间戳，保证每次构建唯一且递增
  // 提前生成 versionCode 以便用于 tag 名称
  const now = new Date()
  const versionCode = [
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
  ].join('')

  // Git Tag（构建前询问，构建成功后才真正创建）
  const tag = `${platform}-${version}-${env}-${versionCode}`
  const { tagAction } = await inquirer.prompt([
    {
      name: 'tagAction',
      type: 'select',
      message: chalk.magentaBright(`是否创建 Git Tag？(${tag})`),
      choices: [
        { name: '创建 & 推送', value: 'push' },
        { name: '仅创建', value: 'create' },
        { name: '跳过', value: 'skip' },
      ],
    },
  ])

  shelljs.env.VERSION_NAME = version
  shelljs.env.VERSION_CODE = versionCode
  shelljs.env.ENV = env

  // 强制重新生成证书时设置环境变量
  if (forceRegenerateCertificates) {
    shelljs.env.FORCE_REGENERATE_CERTIFICATES = 'true'
  }

  console.log('')
  console.log(chalk.green(`✨ 开始构建 Mullet... (v${version}, 构建号: ${versionCode})`))
  console.log('')

  try {
    // Step 1: Prebuild
    console.log(chalk.magentaBright(' [1/4] 执行 expo prebuild... '))
    run(`pnpm expo-prebuild ${env} --platform ${platform} --clean`)

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
      console.log(chalk.white(`    查看状态: ${chalk.underline('https://appstoreconnect.apple.com')}`))
    } else if (platform === 'ios' && iosDist === 'adhoc') {
      console.log('')
      console.log(chalk.cyan.bold(' 📦 AdHoc IPA 已生成'))
      console.log(chalk.white('    可通过蒲公英、fir.im 等平台分发给测试人员'))
    }

    console.log('')

    // --- 构建后操作 ---

    // 版本号变更：改了就提交，推送跟着 tag 走
    if (version !== currentVersion) {
      run(`git add package.json`)
      run(`git commit -m "chore: bump version to ${version}"`)
      console.log(chalk.green(`  ✅ 版本号变更已提交`))

      if (tagAction === 'push') {
        run(`git push`)
        console.log(chalk.green(`  ✅ 版本号变更已推送到远程`))
      }
    }

    // 创建 & 推送 Git Tag
    if (tagAction !== 'skip') {
      run(`git tag ${tag}`)
      console.log(chalk.green(`  ✅ Git Tag 已创建: ${tag}`))

      if (tagAction === 'push') {
        run(`git push origin ${tag}`)
        console.log(chalk.green(`  ✅ Tag ${tag} 已推送到远程`))
      }
    }

    console.log('')
  } catch (error) {
    // 构建失败，回滚版本号
    console.log('')
    console.log(chalk.red('━'.repeat(50)))
    console.log(chalk.red.bold(' ❌ 构建失败'))
    console.log(chalk.red('━'.repeat(50)))
    console.log('')

    if (version !== originalVersion) {
      // 恢复原版本号
      const pkgPath = path.join(PROJECT_DIR, 'package.json')
      const pkgData = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      pkgData.version = originalVersion
      fs.writeFileSync(pkgPath, JSON.stringify(pkgData, null, 2) + '\n')
    }

    console.log(chalk.red(`  错误信息: ${error.message || error}`))
    console.log('')
    process.exit(1)
  }
}

main().catch((err) => {
  console.log(chalk.red('\n  • 你已取消操作，再见！ '))
  process.exit(1)
})
