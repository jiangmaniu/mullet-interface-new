// mullet 平台主题常量（对齐项目设计系统 Design Tokens）
// CSS 变量已通过 public/static/styles/index.css 静态覆盖，无需运行时注入
export const ThemeConst = {
  // 品牌色
  primary: '#eed94c', // brand-primary (yellow-500)
  textPrimary: '#eed94c',

  // 背景色
  black: '#060717', // background-secondary (zinc-800)
  bgPrimary: '#14172B', // background-primary (弹窗/对话框/工具栏背景)
  white: '#fff',

  // 文本色
  textContent1: '#ffffff', // content-1
  textContent2: '#bcbed3', // content-2 (zinc-50)
  textContent3: '#a6a8c0', // content-3 (zinc-100)
  textContent4: '#9093ad', // content-4 (zinc-200)

  // 图表元素色
  gridColor: 'rgba(101,104,134,0.08)', // 网格线（极淡）
  scaleTextColor: '#9093ad', // 刻度文字 (zinc-200)
  separatorColor: 'rgba(101,104,134,0.4)', // 分隔线
  crosshairColor: '#a6a8c0', // 十字线 (zinc-100)

  // 交易色
  green: '#2ebc84', // 涨 / success (green-500)
  red: '#ff112f', // 跌 / danger (red-500)
}
