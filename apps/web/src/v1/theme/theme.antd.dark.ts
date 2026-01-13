import { blue, colorWhite, darkTheme, gray, zinc } from './theme.config'

const gray500 = gray['500']
const gray600 = gray['600']
const gray900 = gray['900']

const bluePrimary = blue['700']

// antd的主题色
const colorPrimary = gray['95'] //  antd的主题色设置为黑色，页面中大部分组件使用到黑色，避免修改太多

// antd5 token主题配置 ==== 黑色主题配置
export default {
  // 全局token
  colorPrimary, // 主要颜色，影响最大，同步修改config/defaultSettings中的配置
  colorPrimaryHover: gray['95'], // 主色梯度下的悬浮态
  colorPrimaryBorderHover: gray['95'],
  // colorPrimaryBgHover: 'rgba(0, 0, 0, 0.04)',
  // colorPrimaryBg: bgColorBase,
  fontSize: 14, // 默认14
  borderRadius: 7, // 圆角
  // colorBgContainerDisabled: bgColorBase, // 禁用背景颜色
  colorText: gray['95'], // 文字主色
  colorBorder: gray['650'], // 默认使用的边框颜色, 用于分割不同的元素，例如：表单的分割线、卡片的分割线等。
  colorTextDisabled: gray['95'], // 控制禁用状态下的字体颜色。
  colorBgContainer: zinc['500'], // gray['750'] 组件的容器背景色，例如：默认按钮、输入框等。务必不要将其与 `colorBgElevated` 混淆。
  colorBgElevated: gray[680],
  motion: false, // 动画关闭，否则切换主题样式会闪烁
  colorSplit: zinc['700'],

  colorLinkActive: colorWhite, // 控制超链接被点击时的颜色
  colorLinkHover: colorWhite, // 控制超链接悬浮时的颜色

  // 组件对应的token
  Tabs: {
    itemHoverColor: gray['95'], // 标签悬浮态文本颜色
    itemActiveColor: gray['95'], // 标签激活态文本颜色
    itemSelectedColor: gray['95'],
    itemColor: gray['570'],
    inkBarColor: gray['95'], // 指示条颜色
    titleFontSize: 16,

  },
  Modal: {
    colorBgMask: 'rgba(0, 0, 0, 0.7)',
    colorBgContainer: darkTheme['--modal-bg'],
    contentBg: darkTheme['--modal-bg'],
    headerBg: darkTheme['--modal-bg'],
    footerBg: darkTheme['--modal-bg']
  },
  Button: {
    colorPrimary: bluePrimary,
    colorPrimaryHover: bluePrimary, // 主色梯度下的悬浮态
    colorPrimaryBorderHover: bluePrimary,
    colorPrimaryActive: bluePrimary, // 主色梯度下的深色激活态。
    primaryShadow: 'none' // 主要按钮默认阴影
  },
  Select: {
    multipleItemBg: 'rgba(24, 62, 252, 0.04)',
    optionActiveBg: gray['655'],
    selectorBg: gray[750],
    optionSelectedBg: gray['655'] // 选项选中时背景色
  },
  InputNumber: {
    activeBorderColor: gray500, // 激活态边框色
    handleHoverColor: gray500, // 操作按钮悬浮颜色
    hoverBorderColor: gray500, // 悬浮态边框色
    activeShadow: 'none' // 激活态阴影
  },
  Input: {
    activeBorderColor: gray500, // 激活态边框色
    hoverBorderColor: gray500, // 悬浮态边框色
    activeShadow: 'none' // 激活态阴影
  },
  Form: {
    itemMarginBottom: 0 // 表单项底部间距
  },
  Table: {
    rowHoverBg: gray[590],
    colorBgContainer: zinc['500'],
    borderColor: 'transparent',
    headerSplitColor: 'transparent',
    splitColor: zinc['500'],
    headerBg: zinc['500'],
    stickyScrollBarBg: zinc['500'],
  },
  Message: {
    contentBg: 'rgba(1,1,1,0.6)'
  },
  Dropdown: {
    zIndexPopup: 1020 // 下拉菜单 z-index
  },
  Checkbox: {
    colorPrimary: gray['650'],
    colorPrimaryBorderHover: gray['650'],
    colorPrimaryHover: gray['650'],
    colorBorder: gray['610'],
    colorBgContainer: gray[750]
  },
  Segmented: {
    itemSelectedBg: gray[651],
    itemSelectedColor: gray[95],
    // boxShadowTertiary: 'none',
    trackBg: gray[680]
  }
  // Pagination: {
  //   colorBgContainer: darkTheme['--color-brand-primary']
  // }
}
