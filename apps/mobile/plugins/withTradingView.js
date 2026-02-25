const { withDangerousMod, withXcodeProject } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin: 将 TradingView Advanced Charts 源文件复制到原生 assets
 *
 * Android: 复制到 android/app/src/main/assets/tradingview/
 * iOS: 复制到 ios/<projectName>/tradingview/ 并添加到 Xcode 项目
 */

const SOURCE_DIR = path.join(
  __dirname,
  '..',
  'src',
  'components',
  'tradingview-advanced',
  'lib'
);

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`TradingView source directory not found: ${src}`);
  }
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Android: 复制到 assets/tradingview/
function withTradingViewAndroid(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const assetsDir = path.join(
        config.modRequest.projectRoot,
        'android',
        'app',
        'src',
        'main',
        'assets',
        'tradingview'
      );

      // 清理旧文件
      if (fs.existsSync(assetsDir)) {
        fs.rmSync(assetsDir, { recursive: true });
      }

      console.log('📊 Copying TradingView files to Android assets...');
      copyDirSync(SOURCE_DIR, assetsDir);
      console.log('✅ TradingView Android assets ready');

      return config;
    },
  ]);
}

// iOS: 复制到 ios/<projectName>/tradingview/ 并添加到 Xcode 项目
function withTradingViewIos(config) {
  // Step 1: 复制文件
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectName = config.modRequest.projectName;
      const iosDir = path.join(
        config.modRequest.projectRoot,
        'ios',
        projectName,
        'tradingview'
      );

      if (fs.existsSync(iosDir)) {
        fs.rmSync(iosDir, { recursive: true });
      }

      console.log('📊 Copying TradingView files to iOS bundle...');
      copyDirSync(SOURCE_DIR, iosDir);
      console.log('✅ TradingView iOS files ready');

      return config;
    },
  ]);

  // Step 2: 添加到 Xcode 项目（folder reference）
  config = withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const projectName = config.modRequest.projectName;

    // 检查是否已添加
    if (xcodeProject.pbxGroupByName('tradingview')) {
      return config;
    }

    // 找到项目主 group
    const mainGroupId = xcodeProject.getFirstProject().firstProject.mainGroup;
    const mainGroup = xcodeProject.getPBXGroupByKey(mainGroupId);
    const projectGroupEntry = mainGroup.children.find(
      (c) => c.comment === projectName
    );

    if (!projectGroupEntry) {
      console.warn('⚠️  Could not find project group in Xcode project');
      return config;
    }

    const projectGroup = xcodeProject.getPBXGroupByKey(projectGroupEntry.value);

    // 创建 PBXFileReference（folder reference）
    const fileRefUuid = xcodeProject.generateUuid();
    xcodeProject.addToPbxFileReferenceSection({
      uuid: fileRefUuid,
      isa: 'PBXFileReference',
      lastKnownFileType: 'folder',
      name: 'tradingview',
      path: 'tradingview',
      sourceTree: '"<group>"',
    });

    // 添加到项目 group
    projectGroup.children.push({
      value: fileRefUuid,
      comment: 'tradingview',
    });

    // 添加到 Copy Bundle Resources build phase
    const buildFileUuid = xcodeProject.generateUuid();
    xcodeProject.addToPbxBuildFileSection({
      uuid: buildFileUuid,
      isa: 'PBXBuildFile',
      fileRef: fileRefUuid,
      fileRef_comment: 'tradingview',
    });

    const resourcesBuildPhase = xcodeProject.pbxResourcesBuildPhaseObj(
      xcodeProject.getFirstTarget().uuid
    );
    if (resourcesBuildPhase) {
      resourcesBuildPhase.files.push({
        value: buildFileUuid,
        comment: 'tradingview in Resources',
      });
    }

    console.log('✅ TradingView folder reference added to Xcode project');
    return config;
  });

  return config;
}

const withTradingView = (config) => {
  config = withTradingViewAndroid(config);
  config = withTradingViewIos(config);
  return config;
};

module.exports = withTradingView;
