export const isInStandaloneMode = () => {
  if (typeof window === 'undefined') return false
  
  // standalone：独立应用模式，这种模式下打开的应用有自己的启动图标，并且不会有浏览器的地址栏。因此看起来更像一个Native App
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-ignore Safari 判断
    (window.navigator as any)?.standalone ||
    document?.referrer?.includes?.('android-app://')
  )
}
