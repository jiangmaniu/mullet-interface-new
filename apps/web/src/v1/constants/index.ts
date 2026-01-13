// 系统名称 @TODO: 根据项目修改
const NAMESPACE = `client` // 命名空间

// 字体图标 替换设计提供的地址 https://blog.csdn.net/weixin_44119268/article/details/102629409
// 注意：UI图标更新后，需要重新更新地址和本地代码
export const ICONFONT_URL =
  process.env.NODE_ENV === 'development' ? '//at.alicdn.com/t/c/font_4571567_r33m06w0bz.js' : '/iconfont/iconfont.js'

// 首页
export const WEB_HOME_PAGE = '/trade' // pc端首页
export const ADMIN_HOME_PAGE = '/account'
export const MOBILE_HOME_PAGE = '/app/quote' // 移动端首页
export const WEB_LOGIN_PAGE = '/user/login' // 移动端登录页
export const MOBILE_LOGIN_PAGE = '/app/login' // 移动端登录页

// 本地存储-用户信息-键
export const KEY_ACCOUNT_PASSWORD = NAMESPACE + '_' + 'account_password'
export const KEY_TOKEN = NAMESPACE + '_' + 'token'
export const KEY_USER_INFO = NAMESPACE + '_' + 'userInfo'
export const KEY_PARAMS = NAMESPACE + '_' + 'params'
export const KEY_PWD = NAMESPACE + '_' + 'pwd'
export const KEY_NEXT_REFRESH_TOKEN_TIME = NAMESPACE + '_' + 'nextRefreshTokenTime'
export const KEY_TRADE_PAGE_SHOW_TIME = NAMESPACE + '_' + 'trade_page_show_time' // 进入交易页面时间，用来刷新k线，避免长时间不进入行情断开

// 临时缓存在sessionStorage中的语言
export const KEY_TEMP_LNG = NAMESPACE + '_' + 'temp_lang'

// 定位信息
export const KEY_LOCATION_INFO = NAMESPACE + '_' + 'location_info'

// 打开的品种名称
export const KEY_SYMBOL_NAME_LIST = NAMESPACE + '_' + 'open_symbol_name_list'
export const KEY_ACTIVE_SYMBOL_NAME = NAMESPACE + '_' + 'active_symbol_name'
// 收藏
export const KEY_FAVORITE = NAMESPACE + '_' + 'favorite_list'

// 按账户id储存用户的设置信息：自选、打开的品种列表、激活的品种名称
export const KEY_USER_CONF_INFO = NAMESPACE + '_' + 'user_conf_info'

// 当前切换的主题色
export const KEY_THEME = NAMESPACE + '_' + 'theme'
export const KEY_TRADE_THEME = NAMESPACE + '_' + 'trade_theme'

// 默认语言 en-US
export const DEFAULT_LOCALE = 'zh-TW'

// 貨幣
export const SOURCE_CURRENCY = 'USD'
export const CURRENCY = 'USDT'
export const CURRENT_YEAR = 2024
export const DEFAULT_CURRENCY_DECIMAL = 2 // 默认货币精度

// 分页默认值
export const DEFAULT_PAGE_SIZE = 10

// 快速下单选择状态
export const KEY_QUICK_PLACE_ORDER_CHECKED = NAMESPACE + '_' + 'quick_place_order_checked'

// 订单二次确认弹窗
export const KEY_ORDER_CONFIRM_CHECKED = NAMESPACE + '_' + 'order_confirm_checked'

// 平仓二次确认弹窗
export const KEY_POSITION_CONFIRM_CHECKED = NAMESPACE + '_' + 'position_confirm_checked'

// 是否弹窗展示弹窗添加桌面图标
export const KEY_SHOW_PWD_ADD_MODAL = NAMESPACE + '_' + 'pwa_added'

// 历史搜索记录
export const KEY_HISTORY_SEARCH = NAMESPACE + '_' + 'history_search'

// 记录的设备类型
export const KEY_DEVICE_TYPE = NAMESPACE + '_' + 'device_type'

// 平台配置文件
export const KEY_PLATFORM_CONFIG = NAMESPACE + '_' + 'platform_config'

// tradingview当前选择的分辨率 1/5/15...
export const KEY_TRADINGVIEW_RESOLUTION = NAMESPACE + '_' + 'tradingview_resolution'

// 注册码
export const KEY_REGISTER_CODE = NAMESPACE + '_' + 'register_code'

// 当前选择的Cluster节点
export const KEY_CLUSTER = NAMESPACE + '_' + 'solana_cluster'

// APP 弹窗宽度
export const APP_MODAL_WIDTH = 320

// 默认区号
export const DEFAULT_AREA_CODE = '86'

// 支付訂單超時時限
export const PAYMENT_ORDER_TIMEOUT = 30 * 60 * 1000

// 註冊方式
export const DEFAULT_REGISTER_WAY = 'PHONE' // PHONE | EMAIL

// 接口防重放appKey
export const REPLAY_PROTECTION_APP_KEY = 'KblZBTQ5t7TLYsif5SVs7fcJbpUj7igu'
