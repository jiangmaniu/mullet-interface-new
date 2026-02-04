const { inspectorBabelPlugin } = require('react-native-dev-inspector/metro');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
    plugins: [
      // 增强型源跟踪 - 注入 __callerSource prop 到 JSX 元素
      // 提供更精确的 "Open in Editor" 功能
      inspectorBabelPlugin,
      // Lingui 国际化
      '@lingui/babel-plugin-lingui-macro',
    ],
  };
};
