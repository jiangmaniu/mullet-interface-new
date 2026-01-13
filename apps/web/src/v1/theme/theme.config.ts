// 配色参考 https://www.tailwindcss.cn/docs/customizing-colors

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b})`
}

// 将十六进制颜色转换为空格分隔的 RGB 值，用于支持 Tailwind 透明度修饰符
export function hexToRgbSpaced(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r} ${g} ${b}`
}

const transferHexToRgb = (obj: any) => {
  const result: any = {}
  Object.keys(obj).forEach((key) => {
    result[key] = hexToRgb(obj[key])
  })

  return result
}

// 灰色 色值50 - 950 阶梯加深
export const gray = {
  50: '#F7F7F7', // 最浅
  60: '#f6f6f6',
  70: '#fafafa',
  80: '#fbfbfb',
  90: '#F3F3F3',
  95: '#F4F4F4',
  120: '#F8F8F8',
  125: '#f9f9f9',
  130: '#f0f0f0',
  150: '#EFEFEF',
  160: '#EDEDED',
  180: '#EEEEEE',
  185: '#E4E4E4',
  190: '#E8E8E8',
  195: '#E6E6E6',
  200: '#E1E1E1',
  220: '#D9DDE3',
  250: '#DADADA',
  260: '#D8D8D8',
  300: '#D8D8D8',
  340: '#C8C8C8',
  360: '#C3C3C3',
  370: '#C4C4C4',
  380: '#b1b1b1',
  400: '#9BA6AD',
  450: '#9E9E9E',
  500: '#9C9C9C',
  550: '#929292',
  560: '#454A4F',
  570: '#767E8A',
  572: '#7E7E7E',
  575: '#2A2B2E',
  578: '#2A2A32',
  580: '#424242',
  585: '#2d2d2d',
  590: '#21262A',
  600: '#6A7073',
  610: '#30373E',
  620: '#454548',
  630: '#20252A',
  650: '#514F4F',
  651: '#2E3337',
  652: '#2E2E39',
  653: '#303030',
  655: '#2B2F34',
  656: '#2E2E39',
  660: '#1D2025',
  665: '#2B2E39',
  670: '#2E3338',
  675: '#161A1E',
  680: '#23262A',
  690: '#262626',
  700: '#29292C',
  720: '#1D2125',
  730: '#1A1C1F',
  740: '#070707',
  750: '#1E2226',
  800: '#191C20',
  900: '#222222',
  950: '#000000' // 最深
} as const

export const zinc = {
  50: '#bcbed3',
  100: '#a6a8c0',
  200: '#9093ad',
  300: '#656886',
  400: '#393d60',
  500: '#0e123a',
  600: '#0b0e2e',
  700: '#080b23',
  800: '#060717',
  900: '#040511'
} as const


// 黄色 色值50 - 900 阶梯加深
export const yellow = {
  50: '#fcf7db',
  100: '#faf4c9',
  200: '#f8f0b7',
  300: '#f5e894',
  400: '#f1e170',
  500: '#eed94c',
  600: '#beae3d',
  700: '#8f822e',
  800: '#5f571e',
  900: '#474117'
} as const

// 红色 色值50 - 900 阶梯加深
export const red = {
  50: '#ffdadf',
  100: '#ffc7ce',
  200: '#ff8c99',
  300: '#ff6376',
  400: '#ff3a53',
  500: '#ff112f',
  600: '#cc0e26',
  700: '#990b1d',
  800: '#660814',
  900: '#4c060f'
} as const



// 绿色 色值50 - 900 阶梯加深
export const green = {
  50: '#d5f2e6',
  100: '#c0ebda',
  200: '#abe4ce',
  300: '#82d7b5',
  400: '#58c99d',
  500: '#2ebc84',
  600: '#25966a',
  700: '#1c714f',
  800: '#124b35',
  900: '#0e3828'
} as const


// 蓝色 色值50 - 900 阶梯加深
export const blue = {
  50: '#d2e0ff',
  100: '#bbd1ff',
  200: '#a4c2ff',
  300: '#77a3ff',
  400: '#4985ff',
  500: '#1c66ff',
  600: '#1652cc',
  700: '#113d99',
  800: '#0b2966',
  900: '#081f4c'
} as const


export const orange = {
  50: '#ffe9d6',
  100: '#ffddc2',
  200: '#ffd2ae',
  300: '#ffbc85',
  400: '#ffa55d',
  500: '#ff8f34',
  600: '#d6772a',
  700: '#ae5f1f',
  800: '#854715',
  900: '#713b10'
} as const

// 品牌色
export const colorBrandPrimary = blue['700']
// export const colorBrandSecondary = blue['500']

// 文字
export const colorTextPrimary = gray['900']
export const colorTextSecondary = gray['600']
export const colorTextWeak = gray['500']

// 其他
export const bgColorBase = gray['50']

export const colorWhite = '#fff'

// 定义全局使用的平方常规字体，优先使用pf-medium当做常规字体
export const fontFamily =
  "pf-medium, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"

// 获取系列颜色 - 使用空格分隔的 RGB 值，支持 Tailwind 透明度修饰符
export const getColors = (colors: any, name: any) => {
  const result = {}
  Object.keys(colors).forEach((key: string) => {
    // @ts-ignore
    // 转换为空格分隔的 RGB 值，如 "6 7 23"
    result[`--color-${name}-${key}`] = hexToRgbSpaced(colors[key])
  })
  return result
}

// tailwindcss颜色使用变量代替 - 使用支持透明度的格式
export const getTailwindCssVarColor = <T = any>(colors: any, name: any) => {
  const result = {} as T
  Object.keys(colors).forEach((key: string) => {
    // @ts-ignore
    // 使用 rgb(var(--xxx) / <alpha-value>) 格式支持透明度
    result[key] = `rgb(var(--color-${name}-${key}) / <alpha-value>)`
  })
  return result
}

// 亮色主题变量
// 自定义组件使用的css变量，antd组件请在theme.antd.ts中定义
export const lightTheme = {
  // brand
  '--color-brand-primary': colorBrandPrimary, // 品牌主色
  '--color-brand-text-primary': colorBrandPrimary, // 品牌主色-文字颜色
  // '---color-brand-secondary': colorBrandSecondary, // 品牌主色-第二色-衍生色1
  // '---color-brand-weak': colorBrandWeak, // 品牌主色-衍生色2
  // '---color-brand-light': colorBrandLight // 品牌主色-衍生色3

  // text
  '--color-text-primary': colorTextPrimary, // 文字主色
  '--color-text-secondary': colorTextSecondary, // 文字-第二色-衍生色1
  '--color-text-weak': colorTextWeak, // 文字-衍生色2
  // '--color-text-light': colorTextLight, // 文字-第二色-衍生色3

  // button
  '--btn-primary': colorBrandPrimary, // 按钮主色
  '--btn-default-border': gray['200'], // 默认按钮边框
  '--btn-default-bg': 'hsla(0, 0%, 97%, 0.7)', // 默认按钮背景色
  '--btn-disabled-bg': gray['50'], // 禁用背景色
  '--btn-disabled-text-color': gray['500'], // 禁用按钮文字颜色
  // '--btn-disabled-bg': gray['150'], // 禁用背景色

  // input
  '--input-bg': colorWhite, // 输入框背景色
  '--input-disabled-bg': gray['50'], // 输入框禁用置灰背景色
  '--input-disabled-border': gray['150'], // 输入框禁用置灰背景色
  '--input-border': gray['200'], // 输入边框颜色
  '--input-border-hover': gray['500'], // 输入框hover边框颜色
  '--input-placeholder-text-color': colorTextSecondary, // placeholder文字颜色

  // tabs
  '--tabs-active-bg': bgColorBase, // 激活背景
  '--tabs-border-color': gray['130'], // tabs组件底部边框线颜色

  // select
  '--select-border': gray['200'], // 边框
  '--select-border-hover': gray['500'], // 边框hover
  '--select-bg': colorWhite, // 选择组件背景颜色
  '--select-dropdown-bg': colorWhite, // 选择展开的区域背景颜色
  '--select-item-hover-bg': gray['70'], // 选项hover背景颜色

  // modal
  '--modal-bg': colorWhite, // 弹窗背景颜色
  '--modal-header-bg': blue['50'], // 头部背景颜色
  '--modal-border-color': gray['200'], // 弹窗悬浮框边框颜色
  '--modal-input-border-color': gray['200'], // 弹窗上的输入框边框颜色
  '--modal-mask-bg': 'rgba(0,0,0,0.5)',

  // divider
  '--divider-line-color': zinc['500'], // 分割线条颜色

  // dropdown
  '--dropdown-bg': colorWhite, // 背景颜色
  '--dropdown-border-color': gray['200'], // 弹窗悬浮框边框颜色
  '--dropdown-item-hover-bg': gray['70'], // 选项hover背景颜色

  // border
  '--border-primary-color': gray['200'], // 通用边框颜色
  // '--border-weak-color': gray['80'], // 通用边框颜色
  // '--border-light-color': gray['80'], // 通用边框颜色

  '--ant-color-bg-container': zinc['500'],
  // 页面颜色
  '--bg-primary': zinc['500'], // 页面背景
  '--bg-base-gray': bgColorBase, // 页面背景-灰色

  // 头部渐变颜色
  '--card-gradient-header-bg': 'linear-gradient(1deg, #FFFFFF 10%, #CDE2FF 100%)', // 卡片渐变背景颜色

  // 滚动条颜色
  '--scrollbar-color': `${colorWhite} ${colorWhite}`, // 滚动条颜色
  '--scrollbar-hover-color': `rgba(0, 0, 0, 0.05) ${colorWhite}`, // hover颜色 第一个滚动条颜色、第二个滚动条轨道颜色

  // list
  '--list-item-disabled': 'rgb(246,246,246, 0.4)', // 列表项目禁用颜色
  '--list-hover-primary-bg': gray['125'], // hover主要颜色
  '--list-hover-light-bg': gray['80'], // hover-淡一点的颜色

  // 字体
  '--font-family': fontFamily,

  // 深度进度条颜色
  '--depth-buy-bg': green['100'], // 买
  '--depth-sell-bg': red['100'], // 卖

  // 默认颜色 - 使用空格分隔的 RGB 值，支持透明度修饰符
  '--color-gray': hexToRgbSpaced(gray['900']), // 默认全局黑
  '--color-green': hexToRgbSpaced(green['700']), // 默认全局绿
  '--color-red': hexToRgbSpaced(red['600']), // 默认全局红
  '--color-blue': hexToRgbSpaced(blue['700']), // 默认全局蓝
  '--color-yellow': hexToRgbSpaced(yellow['600']), // 默认全局黄
  '--color-orange': hexToRgbSpaced(orange['500']), // 默认全局橙
  '--color-zinc': hexToRgbSpaced(zinc['500']), // 默认全局zinc
  '--color-white': '255 255 255', // 默认全局白
  '--color-black': '0 0 0', // 默认全局黑

  '--color-trade-buy': 'rgb(var(--color-green-500))',
  '--color-trade-sell': 'rgb(var(--color-red-500))',
  '--color-market-rise': 'var(--color-trade-buy)',
  '--color-market-fall': 'var(--color-trade-sell)',

  // 灰色系
  ...getColors(gray, 'gray'),

  // 黄色系
  ...getColors(yellow, 'yellow'),

  ...getColors(zinc, 'zinc'),

  ...getColors(orange, 'orange'),

  // 红色系
  ...getColors(red, 'red'),

  // 绿色系
  ...getColors(green, 'green'),

  // 蓝色系
  ...getColors(blue, 'blue')
}

// 黑色主色变量
// 自定义组件使用的css变量，antd组件请在theme.antd.ts中定义
export const darkTheme = {
  ...lightTheme,
  // brand
  '--color-brand-primary': blue['500'], // 品牌主色
  '--color-brand-text-primary': blue['400'], // 品牌主色-文字颜色
  // '--color-brand-secondary': colorBrandSecondary, // 品牌主色-第二色-衍生色1
  // '--color-brand-weak': colorBrandWeak, // 品牌主色-衍生色2
  // '--color-brand-light': colorBrandLight // 品牌主色-衍生色3

  // text
  '--color-text-primary': gray['95'], // 文字主色-正文
  '--color-text-secondary': gray['570'], // 文字-第二色-衍生色1
  '--color-text-weak': gray['570'], // 文字-衍生色2
  // '--color-text-light': colorTextLight, // 文字-第二色-衍生色3

  // button
  '--btn-primary': blue['500'], // 按钮主色
  '--btn-default-border': gray['656'], // 默认按钮边框
  '--btn-default-bg': gray['620'], // 默认按钮背景色
  '--btn-disabled-bg': gray['651'], // 禁用背景色
  '--btn-disabled-text-color': gray['500'], // 禁用按钮文字颜色

  // input
  '--input-bg': gray['750'], // 输入框背景色
  '--input-disabled-bg': gray['651'], // 输入框禁用置灰背景色
  '--input-disabled-border': gray['650'], // 输入框禁用置灰背景色
  '--input-border': gray['610'], // 输入框、选择框边框颜色
  '--input-border-hover': gray['370'], // 输入框、选择框边框颜色
  '--input-placeholder-text-color': gray['570'], // placeholder文字颜色

  // tabs
  '--tabs-active-bg': gray['670'], // 激活背景
  '--tabs-border-color': '#282b2e', // tabs组件底部边框线颜色

  // select
  '--select-border': gray['665'], // 边框
  '--select-border-hover': gray['665'], // 边框hover
  '--select-bg': gray['750'], // 选择组件背景颜色
  '--select-dropdown-bg': gray['680'], // 选择展开的区域背景颜色
  '--select-item-hover-bg': gray['655'], // 选项hover背景颜色

  // modal
  '--modal-bg': gray['730'], // 弹窗背景颜色
  '--modal-header-bg': blue['50'], // 头部背景颜色
  '--modal-border-color': gray['690'], // 弹窗悬浮框边框颜色
  '--modal-input-border-color': gray['653'], // 弹窗上的输入框边框颜色
  '--modal-mask-bg': 'rgba(7,7,7,0.7)',

  // divider
  '--divider-line-color': zinc['500'], // 边框分割线条颜色

  // dropdown
  '--dropdown-bg': gray['680'], // 背景颜色
  '--dropdown-border-color': gray['665'], // 弹窗悬浮框边框颜色
  '--dropdown-item-hover-bg': gray['655'], // 选项hover背景颜色

  // border
  '--border-primary-color': gray['610'], // 通用边框颜色

  // hover
  '--hover-primary-bg': 'rgba(225, 225, 225, .2)', // hover颜色

  // 页面背景
  '--ant-color-bg-container': zinc['500'],
  // 页面颜色
  '--bg-primary': zinc['500'], // 页
  '--bg-base-gray': zinc['500'], // 页面背景-灰色

  // list
  '--list-item-disabled': gray['651'], // 列表项目禁用颜色
  '--list-hover-bg': gray['660'], // 列表项hover背景颜色

  '--list-hover-primary-bg': gray['590'], // hover主要颜色
  '--list-hover-light-bg': gray['655'], // hover-淡一点的颜色

  // 深度进度条颜色
  '--depth-buy-bg': 'rgba(41, 190, 149, 0.3)', // 买
  '--depth-sell-bg': 'rgba(250, 46, 76, 0.2)', // 卖

  // 头部渐变颜色
  '--card-gradient-header-bg': 'transparent', // 卡片渐变背景颜色

  // 滚动条颜色
  '--scrollbar-color': `${gray[675]} ${gray[675]}`, // 滚动条颜色
  '--scrollbar-hover-color': `${gray[578]} ${gray[675]}`, // hover颜色 第一个滚动条颜色、第二个滚动条轨道颜色

  // 默认颜色 - 使用空格分隔的 RGB 值，支持透明度修饰符
  '--color-gray': hexToRgbSpaced(gray['95']), // 默认全局黑
  '--color-green': hexToRgbSpaced(green['600']), // 全局绿
  '--color-red': hexToRgbSpaced(red['500']) // 全局红
}

export const setRootVars = (themeVars: any, isImportant?: boolean) => {
  let vars = ''
  Object.keys(themeVars).forEach((key) => {
    vars += isImportant ? `${key}: ${themeVars[key]} !important;\n` : `${key}: ${themeVars[key]};\n`
  })
  return vars
}

// css变量注入页面中，通过var(--color-brand-primary)使用
// 定义全局主题变量
// 黑色主题，修改<html class="dark" /> 切换主题
export const pcCssVars = `
  :root {
    ${setRootVars(lightTheme)};
  }
  :root[class=dark] {
    ${setRootVars(darkTheme)}
    color-scheme: dark;
    .adm-tabs-header-mask-left,
    .adm-tabs-header-mask-right {
      display: none !important;
    }
  }
`
