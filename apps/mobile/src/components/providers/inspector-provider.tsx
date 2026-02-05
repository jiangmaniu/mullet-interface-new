import { PropsWithChildren } from 'react'
import { Inspector, InspectorDevMenu } from 'react-native-dev-inspector'

interface InspectorProviderProps extends PropsWithChildren {
  /**
   * 浮动按钮位置
   * @default 'bottom-left'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /**
   * 编辑器命令
   * @default 'cursor'
   */
  editor?: string
}

/**
 * Dev Inspector Provider
 * 开发模式下提供元素检查功能，点击元素可跳转到 Cursor 编辑器对应的源代码
 *
 * 功能：
 * - 点击元素查看组件层级
 * - 查看组件的 props 和 state
 * - 点击 "Open" 跳转到源代码
 * - 支持 Uniwind (类似 NativeWind) 样式查看
 *
 * 使用方式：
 * 1. 点击左下角浮动按钮启用 Inspector
 * 2. 点击任意元素查看信息
 * 3. 点击 "Open" 在 Cursor 中打开源文件
 *
 * 其他触发方式：
 * - 摇晃设备或按 Cmd+D (iOS) / Cmd+M (Android)
 * - 选择 "Toggle Dev Inspector"
 */
export function InspectorProvider({
  children,
  position = 'bottom-left',
  editor = 'cursor'
}: InspectorProviderProps) {
  // 生产环境直接返回 children，不包裹 Inspector
  if (!__DEV__) {
    return <>{children}</>
  }

  return (
    <Inspector editor={editor}>
      {children}
      {/* 浮动按钮 - 仅开发模式 */}
      <InspectorDevMenu position={position} />
    </Inspector>
  )
}
