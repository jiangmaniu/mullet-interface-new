export default {
  plugins: {
    'postcss-px-to-viewport-8-plugin': {
      viewportWidth: 375,
      unitPrecision: 5,
      viewportUnit: 'vw',
      fontViewportUnit: 'vw',
      minPixelValue: 1,
      mediaQuery: false,
      exclude: [/node_modules/],
      // 不转换的属性
      selectorBlackList: ['.ignore-vw'],
    },
  },
}
