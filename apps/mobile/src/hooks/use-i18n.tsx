import { MessageDescriptor } from "@lingui/core"
import { useLingui } from "@lingui/react"
import { useLingui as useLinguiMacro } from "@lingui/react/macro"

/**
 * 使用 lingui 的 i18n 钩子
 * @returns 返回 i18n 实例和渲染 lingui 消息的函数
 */
export const useI18n = () => {
  const { i18n } = useLingui()
  const { t } = useLinguiMacro()

  const renderLinguiMsg = <T extends MessageDescriptor | undefined>(
    msg: T,
    fallback?: React.ReactNode,
  ): T extends MessageDescriptor ? string : React.ReactNode => {
    if (!msg) return fallback as T extends MessageDescriptor ? string : React.ReactNode
    return i18n._(msg) as T extends MessageDescriptor ? string : React.ReactNode
  }
  return { i18n, renderLinguiMsg, t }
}
