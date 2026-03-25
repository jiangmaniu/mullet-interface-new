/**
 * @mullet/js-bridge/h5 — H5 端 SDK
 *
 * 用法:
 *   import bridge from '@mullet/js-bridge/h5'
 *   bridge.showToast('成功')
 *   bridge.getAuth().then(...)
 *   bridge.isInAppSync()
 *
 * 也支持具名导入:
 *   import { showToast, getAuth, isInAppSync } from '@mullet/js-bridge/h5'
 */

// 确保 core 初始化（side effect: 注册 message listener）
import './core'

export {
  isInAppSync,
  getContextSync,
  getTokenSync,
  getDeviceInfoSync,
  getThemeSync,
  getAuth,
  getUserInfo,
  fetchDeviceInfo,
  navigate,
  goBack,
  close,
  share,
  copyToClipboard,
  haptic,
  showToast,
  scanQR,
  openExternal,
  trackEvent,
  setTitle,
  setNavBarStyle,
  setStatusBar,
} from './api'

export { on, destroyBridge } from './core'

export { default } from './bridge'
