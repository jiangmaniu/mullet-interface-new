export enum Environment {
  pc = 'pc',
  ipad = 'ipad',
  mobile = 'mobile',
  none = 'none'
}

// ws消息二进制类型变量
export const MSG_TYPE = {
  /**登录 */
  LOGIN: 10000, // use
  /**登录成功 */
  LOGIN_SUCCESS: 9999, // use
  /**市场关闭 */
  MARKET_CLOSE: 9998,
  MUTI_LOGIN: 9997,
  /**登录失败 */
  LOGIN_FAIL: 9996,
  /**用户禁用 */
  USER_DISABLED: 9995,
  /**行情取消订阅 */
  QUOTE_SUBSCRIBE_CANCEL: 8890,
  /**行情订阅 */
  QUOTE_SUBSCRIBE: 8889, // use
  /**心跳 */
  HEART_BEAT: 8888, // use
  /**Tick行情 */
  QUOTE_TICK: 51001, // use
  /**Book行情 */
  QUOTE_BOOK: 51002,
  /**Order事件 */
  ORDER_EVENT: 52001,
  /**Trade事件 */
  TRADE_EVENT: 52002,
  /**商品查询 */
  SYMBOL_QUERY: 10001, // use
  /**商品信息 */
  SYMBOL_INFO: 10002, // use
  /**商品统计查询 获取高开低收 */
  SYMBOL_STATIS_QUERY: 10003, // use
  /**商品统计信息 */
  SYMBOL_STATIS_INFO: 10004, // use
  /**发送查询资金账户信息 */
  FUND_QUERY: 10005, // use
  /**资金账户信息 */
  FUND_INFO: 10006, // use
  /**获取最新报价 */
  LATEST_PRICE_QUERY: 10007, // use
  /**最后一口价 收市报价 */
  LAST_PRICE_INFO: 10008, // use
  /**持仓查询 */
  POSITION_QUERY: 10011, // use
  /**更新持仓信息返回 */
  POSITION_INFO: 10012, // use
  /**挂单查询 */
  PENDING_QUERY: 10021, // use
  /**更新挂单信息返回 */
  PENDING_INFO: 10022, // use
  /**买入卖出等下单操作 */
  PLACE_ORDER: 10031, // use
  /**下单结果返回 eg.平仓成功返回信息、挂单成功返回信息 */
  PLACE_ORDER_RESULT: 10032, // use
  /**挂单撤销操作 */
  PENDING_CANCEL: 10033, // use
  /**挂单结果返回 eg.撤销挂单结果返回 */
  PENDING_RESULT: 10034, // use
  /**挂单修改操作 */
  PENDING_MODIFY: 10035, // use
  /**改单结果返回 eg 修改挂单返回结果 */
  PENDING_MODIFY_RESULT: 10036, // use
  /**持仓单修改操作 */
  POSITION_MODIFY: 10037, // use
  /**改仓结果返回 eg.修改止损止盈 */
  POSITION_MODIFY_RESULT: 10038 // use
}
