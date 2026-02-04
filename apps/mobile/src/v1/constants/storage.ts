import { NAMESPACE } from './config'

// 本地存储-用户信息-键
export const KEY_ACCOUNT_PASSWORD = NAMESPACE + '_' + 'account_password'
export const KEY_TOKEN = NAMESPACE + '_' + 'token'
export const KEY_USER_INFO = NAMESPACE + '_' + 'userInfo'

// 打开的品种名称
export const KEY_SYMBOL_NAME_LIST = NAMESPACE + '_' + 'open_symbol_name_list'
export const KEY_ACTIVE_SYMBOL_NAME = NAMESPACE + '_' + 'active_symbol_name'

// 收藏
export const KEY_FAVORITE = NAMESPACE + '_' + 'favorite_list'

// 按账户id储存用户的设置信息：自选、打开的品种列表、激活的品种名称
export const KEY_USER_CONF_INFO = NAMESPACE + '_' + 'user_conf_info'

// 当前切换的主题色
export const KEY_THEME = NAMESPACE + '_' + 'theme'

// 红涨绿跌、绿涨红跌方向
export const KEY_DIRECTION = NAMESPACE + '_' + 'direction'

// 是否点击过引导页
export const KEY_GUIDE = NAMESPACE + '_' + 'guide'

// 当前设置的语言
export const KEY_LNG = NAMESPACE + '_' + 'lng'

// 当前登录选择的交易商服务信息
export const KEY_TRADER_SERVER = NAMESPACE + '_' + 'trader_server'

// 快速下单选择状态
export const KEY_QUICK_PLACE_ORDER_CHECKED = NAMESPACE + '_' + 'quick_place_order_checked'

// 订单二次确认弹窗
export const KEY_ORDER_CONFIRM_CHECKED = NAMESPACE + '_' + 'order_confirm_checked'

// 平仓二次确认弹窗
export const KEY_POSITION_CONFIRM_CHECKED = NAMESPACE + '_' + 'position_confirm_checked'

// 当前选中的tab
export const KEY_SELECTED_TAB = NAMESPACE + '_' + 'selected_tab'

// app 版本号
export const KEY_APP_VERSION = NAMESPACE + '_' + 'app_version'

// 历史搜索记录
export const KEY_HISTORY_SEARCH = NAMESPACE + '_' + 'history_search'

// 环境配置
export const KEY_ENV = NAMESPACE + '_' + 'envs'

// 进入k线页面时间，用来强制reload k线，避免长时间不进入k线页面空白
export const KEY_TRADINGVIEW_RELOAD_TIME = NAMESPACE + '_' + 'tradingview_reload_time'

// 授权状态
export const KEY_AUTHORIZED = NAMESPACE + '_' + 'webview_authorized'

// 定位信息
export const KEY_LOCATION_INFO = NAMESPACE + '_' + 'location_info'

// 安卓隐私政策弹窗是否展示
export const KEY_ANDROID_PRIVACY_MODAL = NAMESPACE + '_' + 'android_privacy_modal'
