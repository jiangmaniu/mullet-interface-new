/**
 * MMKV 持久化缓存 key 统一定义
 *
 * 命名规范：MULLET:{命名空间}:{具体含义}
 */

const PREFIX = 'MULLET'

// ─── Zustand / Snapshot ─────────────────────────────────────────────────────

/** Zustand persist 根 store */
export const STORAGE_KEY_ROOT_STORE = `${PREFIX}:STORE:ROOT`

/** 行情快照（ws 断开 / App 后台时存入，启动时读取） */
export const STORAGE_KEY_SNAPSHOT_QUOTE = `${PREFIX}:SNAPSHOT:QUOTE`

/** 品种列表快照（拉取成功后存入，启动时读取） */
export const STORAGE_KEY_SNAPSHOT_SYMBOL = `${PREFIX}:SNAPSHOT:SYMBOL`

/** 所有快照 key 列表，用于批量清除 */
export const STORAGE_SNAPSHOT_KEYS = [
  STORAGE_KEY_SNAPSHOT_QUOTE,
  STORAGE_KEY_SNAPSHOT_SYMBOL,
] as const

/** 所有 MMKV 持久化 key 列表，用于完整清除（不含用户登录态） */
export const STORAGE_CLEARABLE_KEYS = [
  STORAGE_KEY_ROOT_STORE,
  ...STORAGE_SNAPSHOT_KEYS,
] as const

// ─── 业务 key ────────────────────────────────────────────────────────────────

/** 账号密码 */
export const STORAGE_KEY_ACCOUNT_PASSWORD = `${PREFIX}:ACCOUNT:PASSWORD`

/** 打开的品种名称列表 */
export const STORAGE_KEY_SYMBOL_NAME_LIST = `${PREFIX}:SYMBOL:NAME_LIST`

/** 激活的品种名称 */
export const STORAGE_KEY_ACTIVE_SYMBOL_NAME = `${PREFIX}:SYMBOL:ACTIVE_NAME`

/** 收藏列表 */
export const STORAGE_KEY_FAVORITE = `${PREFIX}:MARKET:FAVORITE`

/** 按账户 id 存储的用户配置（自选、打开的品种列表、激活品种名称） */
export const STORAGE_KEY_USER_CONF_INFO = `${PREFIX}:USER:CONF_INFO`

/** 主题色 */
export const STORAGE_KEY_THEME = `${PREFIX}:APP:THEME`

/** 涨跌颜色方向（红涨绿跌 / 绿涨红跌） */
export const STORAGE_KEY_DIRECTION = `${PREFIX}:APP:DIRECTION`

/** 语言设置 */
export const STORAGE_KEY_LNG = `${PREFIX}:APP:LNG`

/** 是否点击过引导页 */
export const STORAGE_KEY_GUIDE = `${PREFIX}:APP:GUIDE`

/** 当前登录选择的交易商服务信息 */
export const STORAGE_KEY_TRADER_SERVER = `${PREFIX}:AUTH:TRADER_SERVER`

/** 快速下单选择状态 */
export const STORAGE_KEY_QUICK_PLACE_ORDER_CHECKED = `${PREFIX}:TRADE:QUICK_ORDER_CHECKED`

/** 订单二次确认弹窗 */
export const STORAGE_KEY_ORDER_CONFIRM_CHECKED = `${PREFIX}:TRADE:ORDER_CONFIRM_CHECKED`

/** 平仓二次确认弹窗 */
export const STORAGE_KEY_POSITION_CONFIRM_CHECKED = `${PREFIX}:TRADE:POSITION_CONFIRM_CHECKED`

/** 当前选中的 tab */
export const STORAGE_KEY_SELECTED_TAB = `${PREFIX}:APP:SELECTED_TAB`

/** App 版本号 */
export const STORAGE_KEY_APP_VERSION = `${PREFIX}:APP:VERSION`

/** 历史搜索记录 */
export const STORAGE_KEY_HISTORY_SEARCH = `${PREFIX}:APP:HISTORY_SEARCH`

/** 环境配置 */
export const STORAGE_KEY_ENV = `${PREFIX}:APP:ENV`

/** TradingView 进入时间（用于强制 reload） */
export const STORAGE_KEY_TRADINGVIEW_RELOAD_TIME = `${PREFIX}:APP:TRADINGVIEW_RELOAD_TIME`

/** Webview 授权状态 */
export const STORAGE_KEY_AUTHORIZED = `${PREFIX}:APP:WEBVIEW_AUTHORIZED`

/** 定位信息 */
export const STORAGE_KEY_LOCATION_INFO = `${PREFIX}:APP:LOCATION_INFO`

/** 安卓隐私政策弹窗是否展示 */
export const STORAGE_KEY_ANDROID_PRIVACY_MODAL = `${PREFIX}:APP:ANDROID_PRIVACY_MODAL`
