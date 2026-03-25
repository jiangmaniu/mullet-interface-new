/**
 * 默认导出对象 — bridge.showToast() 风格调用
 */

import {
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

import { on, destroyBridge } from './core'

const bridge = {
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
  on,
  destroy: destroyBridge,
} as const

export default bridge
