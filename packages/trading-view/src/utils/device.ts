/** 判断是否为 PC 端 */
export function isPC(): boolean {
  const userAgentInfo = navigator.userAgent
  const mobileAgents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod']
  return !mobileAgents.some((agent) => userAgentInfo.indexOf(agent) > 0)
}
