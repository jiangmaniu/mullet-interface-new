import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import inquirer from 'inquirer'
import shelljs from 'shelljs'

/**
 * Mullet Build Script
 *
 * 交互模式: node scripts/build.mjs
 * 命令行模式: node scripts/build.mjs <ios|android> <dev|test|prod> [--dist=local|adhoc|testflight]
 *
 * iOS 分发方式:
 *   --dist=local       本地直装 (development 签名)
 *   --dist=adhoc       AdHoc 分发 (ad-hoc 签名，可直接发 ipa)
 *   --dist=testflight  上传 TestFlight (app-store 签名)
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
  const args = process.argv.slice(2)

  // 命令行模式
  if (args.length >= 2) {
    const platform = args[0]
    const env = args[1]
    const flags = args.slice(2)

    if (!['ios', 'android'].includes(platform)) {
      console.error(chalk.red("错误: 平台必须是 'ios' 或 'android'"))
      process.exit(1)
    }
    if (!['dev', 'test', 'prod'].includes(env)) {
      console.error(chalk.red("错误: 环境必须是 'dev'、'test' 或 'prod'"))
      process.exit(1)
    }

    let iosDist = env === 'dev' ? 'local' : env === 'test' ? 'adhoc' : 'testflight'
    const distFlag = flags.find((f) => f.startsWith('--dist='))
    if (distFlag) {
      iosDist = distFlag.split('=')[1]
      if (!['local', 'adhoc', 'testflight'].includes(iosDist)) {
        console.error(chalk.red("错误: --dist 必须是 'local'、'adhoc' 或 'testflight'"))
        process.exit(1)
      }
    }

    return { platform, env, iosDist }
  }

  // 交互模式
  const answers = await inquirer.prompt([
    {
      name: 'platform',
      type: 'select',
      message: chalk.magentaBright('选择构建平台'),
      choices: [
        { name: '🍎 iOS', value: 'ios' },
        { name: '🤖 Android', value: 'android' },
      ],
    },
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
    {
      name: 'iosDist',
      type: 'select',
      message: chalk.magentaBright('选择 iOS 分发方式'),
      when: (ans) => ans.platform === 'ios',
      choices: [
        { name: '📱 本地直装 (development 签名)', value: 'local' },
        { name: '📦 AdHoc 分发 (发 ipa 给他人安装)', value: 'adhoc' },
        { name: '🚀 TestFlight (上传到 TestFlight)', value: 'testflight' },
      ],
      default: (ans) => {
        if (ans.env === 'dev') {
          return 'local'
        } else if (ans.env === 'test') {
          return 'adhoc'
        } else {
          return 'testflight'
        }
      },
    },
  ])

  return {
    platform: answers.platform,
    env: answers.env,
    iosDist: answers.iosDist || 'local',
  }
}

// --- 产物整理 ---

function organizeArtifacts(platform, env, version) {
  const now = new Date()
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
  ].join('')

  const dirName = `Mullet-${platform}-${version}-${env}-${timestamp}`
  const buildDir = path.join(PROJECT_DIR, 'build')
  const outputDir = path.join(buildDir, dirName)

  fs.mkdirSync(outputDir, { recursive: true })

  const ext = platform === 'ios' ? 'ipa' : 'apk'
  const srcName = `Mullet-${env}.${ext}`
  const src = path.join(buildDir, srcName)

  if (fs.existsSync(src)) {
    fs.renameSync(src, path.join(outputDir, `${dirName}.${ext}`))
    // iOS build also produces a dSYM zip
    if (platform === 'ios') {
      const dsym = path.join(buildDir, `Mullet-${env}.app.dSYM.zip`)
      if (fs.existsSync(dsym)) {
        fs.renameSync(dsym, path.join(outputDir, `${dirName}.app.dSYM.zip`))
      }
    }
  } else {
    console.log(chalk.yellow(`  警告: ${srcName} 未在 build/ 目录中找到`))
  }

  return outputDir
}

// --- 构建流程 ---

async function main() {
  const { platform, env, iosDist } = await parseArgs()

  // 从 package.json 读取版本号，注入环境变量供 fastlane 使用
  const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'package.json'), 'utf-8'))
  const version = pkg.version

  // versionCode 使用 YYMMDDHHMM 格式的时间戳，保证每次构建唯一且递增
  const now = new Date()
  const versionCode = [
    String(now.getFullYear()).slice(2),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
  ].join('')

  shelljs.env.VERSION_NAME = version
  shelljs.env.VERSION_CODE = versionCode

  console.log('')
  console.log(chalk.green(`✨ 开始构建 Mullet... (v${version}, 构建号: ${versionCode})`))
  console.log('')

  // Step 1: Prebuild (always clean)
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
  const outputDir = organizeArtifacts(platform, env, version)

  console.log('')
  console.log(chalk.green(' ✅ 构建完成！'))
  console.log(chalk.green(` 📦 产物目录: ${path.relative(PROJECT_DIR, outputDir)}/`))
  console.log('')
}

main().catch((err) => {
  console.log(chalk.red('\n  • 你已取消操作，再见！ '))
  process.exit(1)
})
