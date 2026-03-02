import { MessageDescriptor } from "@lingui/core"
import { useLingui } from "@lingui/react"

/**
 * 使用 lingui 的 i18n 钩子
 * @returns 返回 i18n 实例和渲染 lingui 消息的函数
 */
export const useI18n = () => {
  const { i18n } = useLingui()
  const renderLinguiMsg = (msg?: MessageDescriptor, fallback?: React.ReactNode) => {
    if (!msg) return fallback
    return i18n._(msg)
  }
  return { i18n, renderLinguiMsg }
}
