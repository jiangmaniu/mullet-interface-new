## Node 版本

> `v20.5.0`

## 代码分支

只维护 `master` 分支

## 项目启动

### 安装依赖

```bash
# npm i yarn -g
yarn install
```

### 本地运行

> 多个环境区分运行，因为每个项目的ws连接地址不一样

```bash
# 运行cdex项目
npm run dev:cdex
# 运行mc项目
npm run dev:mc
# 运行cc项目
npm run dev:cc
```

## 打包部署

需要区分`cdex`、`cc`、`mc`项目进行打包，因为`ws`链接不一样

### 打包部署到根目录下

例如访问地址 `http://localhost:8080`

- **cdex项目** `yarn build:cdex`
- **mc项目** `yarn build:mc`
- **cc项目** `yarn build:cc`

### 打包部署到二级目录下

例如访问地址 `http://localhost:8080/tradingview`

> - 二级目录默认文件夹名称是 `tradingview`，在NGINX（`/usr/share/nginx/html`）中创建一个`tradingview`文件夹，将打包后的静态文件放在`tradingview`文件夹下
> - 如需要修改这个名称，需要修改`package.json`中的`basePath`字段

- **打包cdex项目** `yarn build:cdex:tradingview`
- **打包mc项目** `yarn build:mc:tradingview`
- **打包cc项目** `yarn build:cc:tradingview`

### nginx部署

打包生成的静态文件在`dist`目录下，用 `nginx` 把`dist`下的文件内容放到`nginx`容器中新建的`tradingview`目录下即可

> nginx 接口转发

```bash
server {
  # 部署到一级目录
  location / {
    # 静态资源位置
    root /usr/share/nginx/html;
    # 设置默认页
    index index.html;
    # 重要：访问页面404重定向到index.html
    try_files $uri $uri/ /index.html;
  }

  #部署到二级目录，/usr/share/nginx/html 下创建一个tradingview文件夹
  location /tradingview/ {
    root /usr/share/nginx/html;
    index index.html;
  }

  # 接口地址转发
  location ~ /kline/ {
    # cdex项目的接口转发
    proxy_pass https://mt.cd-ex.com;
    # mc项目的接口转发
    # proxy_pass https://traderview.mctzglobals.com;
  }

  # mc项目的接口转发
  location ~ /socket/ {
    # 代理到后台接口服务
    proxy_pass https://traderview.mctzglobals.com;
  }
}
```

### 旧版本的tradingview线上地址

- cdex项目：https://mt.cd-ex.com/tradecdex/#/?name=BTCUSDT
- mc项目：https://traderview.mctzglobals.com/klinechart/#/?name=BTCUSDT
- cc项目：https://wap.gwcdf.com/tradecc/#/?name=BTCUSDT&theme=dark

### 关于新版本k线传参

> https://mt.cd-ex.io/tradingview/?name=BTCUSDT&theme={dark,light}&colorType={1,2}&chartType={0,1,2,3,4,5,6,7,8,9,10,12,13,14,15,16}&bgGradientStartColor=020024&bgGradientEndColor&=4f485e&lang={en,id_ID,zh_TW}&showBottomMACD={1,2}

- 主题色 theme: `dark/light`
- 设置红涨绿跌 `colorType：1、2`
  - 1绿涨红跌（默认值，国外默认是绿涨红跌）
  - 2红涨绿跌（国内习惯是红涨绿跌）
- 设置图表类型 `chartType: 0 1 2 3 4 5 6 7 8 9 10 12 13 14 15 16`
- 设置背景渐变色，注意：theme=dark/light也需要传入
  - `bgGradientStartColor`： 渐变开始色，例如#020024 传 `020024` 即可，`#`不要传
  - `bgGradientEndColor`： 渐变结束色，例如#4f485e 传 `4f485e` 即可，`#`不要传
- 设置多语言 `lang: en、id_ID、zh_TW` 默认是`en`
  - `en` 英文
  - `id_ID` 印尼语
  - `zh_TW` 繁体中文
- 是否展示底部的MACD线 `showBottomMACD`：1 展示 2 隐藏 （默认展示）

```bash
# chartType的枚举值
enum ChartStyle {
	Bar = 0,
	Candle = 1,
	Line = 2,
	Area = 3,
	Renko = 4,
	Kagi = 5,
	PnF = 6,
	LineBreak = 7,
	HeikinAshi = 8,
	HollowCandle = 9,
	Baseline = 10,
	HiLo = 12,
	Column = 13,
	LineWithMarkers = 14,
	Stepline = 15,
	HLCArea = 16
}
```

## tradingview 版本

浏览器控制台打印版本号: `TradingView.version()`

> v26.003

[tradingview 官网文档](https://www.tradingview.com/charting-library-docs/latest/tutorials/implement_datafeed_tutorial/Streaming-Implementation?_highlight=lastbar)

## 安装 vscode 插件，规范化代码

> 项目中配置了对应的 lint 插件，结合 vscode 插件保存代码格式化

- Prettier - Code formatter
- ESLint
- stylelint
- EditorConfig for VS Code

## 提交代码规范

> 使用.husky 来规范提交代码

**按 git commit 提交规范，否则限制代码提交**

- feat：新功能
- fix：修复 bug
- docs：仅仅修改了文档，比如 README、CHANGELOG 等
- style：不影响代码含义的改动，比如去掉空格、改变缩进、增删分号等
- refactor：既不新增功能，也不是修复 bug 的代码改动
- perf：提高代码性能的改动
- test：添加或修改代码的测试
- build：构建系统或外部依赖项的更改
- ci：持续集成的配置文件和脚本的修改
- chore：不修改 src 或 test 的其他修改，比如构建过程或辅助工具的变动

**使用 cz 更方便**

```bash
# 执行触发lint-staged执行lint规范检查
yarn cz
```
