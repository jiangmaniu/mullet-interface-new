/**
 * Bridge Action 处理器
 *
 * 自包含设计：直接从 store 读取快照，无需外部依赖注入
 * 环境信息通过 EnvSnapshot 传入（由 hook 层收集）
 */

import { Platform } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Haptics from 'expo-haptics'
import * as Linking from 'expo-linking'
import { router } from 'expo-router'
import * as Sharing from 'expo-sharing'

import { toast } from '@/components/ui/toast'
import { useRootStore } from '@/stores'
import { userAuthAccessTokenSelector, userAuthLoginInfoSelector } from '@/stores/user-slice/authSlice'
import { H5Action } from '@mullet/js-bridge/types'

/**
 * UI 相关 action 的回调接口
 * 由组件传入，handler 通过回调通知组件更新 UI 状态
 */
export interface UIActionCallbacks {
  onSetTitle?: (title: string) => void
  onSetNavBarStyle?: (style: { visible?: boolean; transparent?: boolean; backgroundColor?: string }) => void
  onSetStatusBar?: (style: { style: 'light' | 'dark'; backgroundColor?: string }) => void
}

export async function handleAction(
  action: H5Action,
  payload: unknown,
  uiCallbacks?: UIActionCallbacks,
): Promise<unknown> {
  const state = useRootStore.getState()

  switch (action) {
    // ── Auth ──
    case H5Action.GetAuth:
      return { token: userAuthAccessTokenSelector(state) || null }

    case H5Action.GetUserInfo:
      return userAuthLoginInfoSelector(state) || null

    // ── Device ──
    case H5Action.GetDeviceInfo: {
      const appVersion = Constants.expoConfig?.version
      return {
        platform: Platform.OS as 'ios' | 'android',
        osVersion: String(Platform.Version),
        appVersion: appVersion ?? '',
        deviceModel: Device.modelName ?? '',
      }
    }

    // ── Navigation ──
    case H5Action.Navigate: {
      const p = payload as { path: string; params?: Record<string, string> }
      router.push({ pathname: p.path as never, params: p.params })
      return
    }

    case H5Action.GoBack:
      router.back()
      return

    case H5Action.Close:
      router.back()
      return

    // ── UI Actions（通过回调通知组件） ──
    case H5Action.SetTitle: {
      const p = payload as { title: string }
      uiCallbacks?.onSetTitle?.(p.title)
      return
    }

    case H5Action.SetNavBarStyle: {
      const p = payload as { visible?: boolean; transparent?: boolean; backgroundColor?: string }
      uiCallbacks?.onSetNavBarStyle?.(p)
      return
    }

    case H5Action.SetStatusBar: {
      const p = payload as { style: 'light' | 'dark'; backgroundColor?: string }
      uiCallbacks?.onSetStatusBar?.(p)
      return
    }

    // ── Clipboard ──
    case H5Action.CopyToClipboard: {
      const p = payload as { text: string }
      await Clipboard.setStringAsync(p.text)
      return
    }

    // ── Haptic ──
    case H5Action.HapticFeedback: {
      const p = payload as { type: string }
      const impactMap: Record<string, Haptics.ImpactFeedbackStyle> = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      }
      const notifMap: Record<string, Haptics.NotificationFeedbackType> = {
        success: Haptics.NotificationFeedbackType.Success,
        warning: Haptics.NotificationFeedbackType.Warning,
        error: Haptics.NotificationFeedbackType.Error,
      }
      if (impactMap[p.type]) {
        await Haptics.impactAsync(impactMap[p.type])
      } else if (notifMap[p.type]) {
        await Haptics.notificationAsync(notifMap[p.type])
      }
      return
    }

    // ── Toast ──
    case H5Action.ShowToast: {
      const p = payload as { message: string; type?: 'success' | 'error' | 'info' | 'warning' }
      toast({ type: p.type ?? 'info', message: p.message })
      return
    }

    // ── Share ──
    case H5Action.Share: {
      const p = payload as { title?: string; text?: string; url?: string; image?: string }
      const fileUri = p.image ?? p.url
      if (!fileUri || !(await Sharing.isAvailableAsync())) {
        return { success: false }
      }
      await Sharing.shareAsync(fileUri, { dialogTitle: p.title })
      return { success: true }
    }

    // ── External Link ──
    case H5Action.OpenExternal: {
      const p = payload as { url: string }
      await Linking.openURL(p.url)
      return
    }

    // ── Analytics ──
    case H5Action.TrackEvent:
      // 接入实际埋点 SDK
      return

    default:
      throw new Error(`Unsupported action: ${action}`)
  }
}
