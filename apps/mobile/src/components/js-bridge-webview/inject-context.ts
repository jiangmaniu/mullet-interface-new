import { Dimensions, Platform } from 'react-native'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import type { BridgeContext } from '@mullet/js-bridge/types'

import { safeStringify } from './utils'

export interface InjectContextParams {
  safeAreaTop: number
  safeAreaBottom: number
  locale: string
  theme: 'light' | 'dark'
}

/**
 * 生成同步注入脚本
 *
 * 注入 window.__BRIDGE_CONTEXT__，特点：
 * 1. 安全序列化（防 XSS）
 * 2. Object.freeze 冻结（H5 侧不可篡改）
 * 3. 派发 jsBridgeReady 事件（H5 可监听注入时机）
 */
export function buildInjectedScript(params: InjectContextParams): string {
  const { width, height } = Dimensions.get('window')
  const appVersion = Constants.expoConfig?.version

  const ctx: BridgeContext = {
    device: {
      platform: Platform.OS as 'ios' | 'android',
      osVersion: String(Platform.Version),
      appVersion: appVersion ?? '',
      deviceModel: Device.modelName ?? '',
    },
    window: {
      screenWidth: width,
      screenHeight: height,
      safeAreaTop: params.safeAreaTop,
      safeAreaBottom: params.safeAreaBottom,
    },
    theme: params.theme,
    locale: params.locale,
    ts: Date.now(),
  }

  return `(function(){
  var c = ${safeStringify(ctx)};
  Object.freeze(c.device);
  Object.freeze(c.window);
  Object.freeze(c);
  Object.defineProperty(window, '__BRIDGE_CONTEXT__', {
    value: c,
    writable: false,
    configurable: false
  });
  window.dispatchEvent(new CustomEvent('jsBridgeReady', { detail: c }));
})(); true;`
}
