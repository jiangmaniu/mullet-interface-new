import { Dimensions, NativeModules, Platform } from 'react-native'
export enum InputStatus {
  default = 'default',
  hover = 'hover',
  focus = 'focus',
  error = 'error',
  warning = 'warning'
}

export enum DeviceEvent {
  TOAST = 'TOAST',
  SHOW_MODAL = 'SHOW_MODAL',
  HIDE_MODAL = 'HIDE_MODAL',
  LOADING = 'LOADING',
  IMAGE_VIEWER = 'IMAGE_VIEWER',
  ACTION_SHEET = 'ACTION_SHEET',
  TAB_QUOTE_FOCUSED = 'TAB_QUOTE_FOCUSED',
  TAB_TRADE_FOCUSED = 'TAB_TRADE_FOCUSED',
  TAB_POSITION_FOCUSED = 'TAB_POSITION_FOCUSED',
  TAB_USER_CENTER_FOCUSED = 'TAB_USER_CENTER_FOCUSED',
  SWITCH_TAB = 'SWITCH_TAB',

  LOGOUT = 'LOGOUT'
}

const { width, height } = Dimensions.get('window')
export const SCREEN_WIDTH = width
export const SCREEN_HEIGHT = height

export const IS_IOS = Platform.OS === 'ios'

export const IS_ANDROID_13_OR_ABOVE = Platform.OS === 'android' && Platform.Version >= 33

const { StatusBarManager } = NativeModules
const WINDOW_DIMENSIONS = Dimensions.get('window')

export const WINDOW_WIDTH = WINDOW_DIMENSIONS.width
export const WINDOW_HEIGHT = WINDOW_DIMENSIONS.height

export const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? 0 : StatusBarManager.HEIGHT
