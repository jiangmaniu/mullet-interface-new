import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import inquirer from 'inquirer'
import shelljs from 'shelljs'

/**
 * Mullet Build Script
 *
 * 交互模式: node scripts/build.js
 * 命令行模式: node scripts/build.js <ios|android> <dev|test|prod> [--upload]
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
    console.error(chalk.red(`\nCommand failed with exit code ${result.code}`))
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
      console.error(chalk.red("Error: platform must be 'ios' or 'android'"))
      process.exit(1)
    }
    if (!['dev', 'test', 'prod'].includes(env)) {
      console.error(chalk.red("Error: env must be 'dev', 'test', or 'prod'"))
      process.exit(1)
    }

    return {
      platform,
      env,
      upload: flags.includes('--upload'),
    }
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
        { name: '开发环境 (dev)', value: 'dev' },
        { name: '测试环境 (test)', value: 'test' },
        { name: '生产环境 (prod)', value: 'prod' },
      ],
      default: 'test',
    },
    {
      name: 'upload',
      type: 'select',
      message: chalk.magentaBright('是否上传到 TestFlight?'),
      when: (ans) => ans.platform === 'ios' && ans.env === 'prod',
      choices: [
        { name: '是', value: true },
        { name: '否', value: false },
      ],
      default: false,
    },
  ])

  return {
    platform: answers.platform,
    env: answers.env,
    upload: answers.upload || false,
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
    console.log(chalk.yellow(`  Warning: ${srcName} not found in build/`))
  }

  return outputDir
}

// --- 构建流程 ---

async function main() {
  const { platform, env, upload } = await parseArgs()

  // 从 package.json 读取版本号，注入环境变量供 fastlane 使用
  const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'package.json'), 'utf-8'))
  const version = pkg.version
  const [major, minor, patch] = version.split('.').map(Number)
  const versionCode = major * 10000 + minor * 100 + patch

  shelljs.env.VERSION_NAME = version
  shelljs.env.VERSION_CODE = String(versionCode)

  console.log('')
  console.log(chalk.green(`✨ Starting Mullet build... (v${version})`))
  console.log('')

  // Step 1: Prebuild (always clean)
  console.log(chalk.magentaBright(' [1/4] Running expo prebuild... '))
  run(`pnpm expo-prebuild ${env} --platform ${platform} --clean`)

  // Step 2: Pod Install (iOS only)
  if (platform === 'ios') {
    console.log(chalk.magentaBright(' [2/4] Installing CocoaPods... '))
    run('bundle exec pod install', path.join(PROJECT_DIR, 'ios'))
  } else {
    console.log(chalk.gray(' [2/4] Skipping pod install (Android)'))
  }

  // Step 3: Fastlane Build
  console.log(chalk.magentaBright(' [3/4] Running Fastlane... '))
  if (platform === 'ios') {
    const lane = upload ? 'beta' : 'build_only'
    run(`bundle exec fastlane ios ${lane} --env ${env}`)
  } else {
    run(`bundle exec fastlane android apk --env ${env}`)
  }

  // Step 4: Organize build artifacts
  console.log(chalk.magentaBright(' [4/4] Organizing build artifacts... '))
  const outputDir = organizeArtifacts(platform, env, version)

  console.log('')
  console.log(chalk.green(' ✅ Build Complete! '))
  console.log(chalk.green(` 📦 Output: ${path.relative(PROJECT_DIR, outputDir)}/`))
  console.log('')
}

main().catch((err) => {
  console.log(chalk.red('\n  • 你已取消操作，再见！ '))
  process.exit(1)
})
