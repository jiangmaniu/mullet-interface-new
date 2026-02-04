export const baseConfig = {
  // ⚠️ APP版本，每次发布更新时，需要更新版本号，否则版本更新不会触发，不在使用react-native-device-info获取否则过审权限问题较多
  VERSION: '1.2.0', // 需要跟 android/app/build.gradle 中的 versionName 保持一致
  NAMESPACE: 'stellux',
  CLIENT_ID: 'trade-app-client', // 客户端ID
  CLIENT_SECRET: 'trade-app-client-secret', // 客户端密钥
  REGISTER_APP_CODE: '123456', // 注册应用验证码 管理端后台业务线中配置获取
  ServiceTerm: '/platform/docs/serviceTerm.html', // 服务条款
  PrivacyAgreement: '/platform/docs/privacyAgreement.html', // 隐私协议
  BeiAnPage: '/platform/docs/beian.html', // 备案信息
  AboutUs: '/platform/docs/aboutUs.html', // 关于我们
  REGISTER_MODULE: true,
  SERVER_LIST: true,
  HIDE_CREATE_ACCOUNT: false, // 隐藏创建账户
  HIDE_ACCOUNT_TRANSFER: false, // 隐藏账户转账
  QUOTE_TABS: 'FAVORITE,ALL,CRYPTO,COMMODITIES,FOREX,INDICES,STOCK',
  ANDROID_PRIVACY_AGREEMENT: false, // 是否开启安卓端隐私协议
  ENABLE_AB_FACE: false, // 是否开启AB面功能
  CBC_REPLACE_TEXT: 'STX', // CBC替换文本
  CBC_LOGIN_NAME: '13800138000', // CBC登录名
  CBC_LOGIN_PASS: 'Aa123456', // CBC登录密码
  CBC_VIP_ID: '488265', // CBC会员ID: 登录输入登录名和密码后获取
  CBC_PASS: 'cbcieapp12453fgdfg546867adflopq0225', // CBC通行密钥
  CBC_SERVER: 'http://cs.cbcie.com', // CBC其他服务接口URL
  WITHOUT_PROXY: false, // 是否使用代理,否的話會將接口中的 /api 使用空字符串替換
  HIDE_LANGUAGE: false, // 隐藏语言切换
  KYC_FACE: false, // 是否开启KYC人脸识别
  ENABLE_DEFAULT_LAYOUT: true, // 使用默认布局 首页是行情 交易在一级页，关闭则是交易在二级页。首页是活动相关
  locationApi: 'https://api.ipdatacloud.com/v2/query?key=4d6e45c57a5811ef9c5f00163e167ffb', // 获取IP地址信息
  ANDROID_PRIVACY_URL: 'https://www.qawfadwd.xyz/privite-app.html' // 安卓端隐私协议
}

// 类型推导
export type IConfig = typeof baseConfig

export const Config = baseConfig
