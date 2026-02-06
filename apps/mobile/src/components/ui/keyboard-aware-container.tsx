import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import type { ScrollViewProps } from 'react-native'

interface KeyboardAwareContainerProps extends Omit<ScrollViewProps, 'children'> {
  children: React.ReactNode
}

/**
 * KeyboardAwareContainer - 全局键盘避让容器
 *
 * 用于包装任何包含输入框的页面或组件，自动处理键盘遮挡问题
 *
 * 功能特性：
 * - 自动检测聚焦的输入框
 * - 智能滚动到可见位置，避免被键盘遮挡
 * - 支持 Android 和 iOS
 * - 零配置，开箱即用
 *
 * @example
 * ```tsx
 * export function MyScreen() {
 *   return (
 *     <KeyboardAwareContainer>
 *       <Input labelText="姓名" />
 *       <Input labelText="邮箱" />
 *       <Input labelText="密码" />
 *     </KeyboardAwareContainer>
 *   )
 * }
 * ```
 */
export function KeyboardAwareContainer({
  children,
  ...props
}: KeyboardAwareContainerProps) {
  return (
    <KeyboardAwareScrollView
      // 启用 Android 支持
      enableOnAndroid
      // 启用自动滚动到初始位置
      enableResetScrollToCoords
      // 额外的滚动高度（padding）
      extraScrollHeight={20}
      // 键盘打开动画时间（0 表示立即）
      keyboardOpeningTime={0}
      // 点击输入框时不收起键盘
      keyboardShouldPersistTaps="handled"
      // 隐藏滚动条
      showsVerticalScrollIndicator={false}
      // 启用滚动到底部时的弹性效果
      enableAutomaticScroll
      // 用户自定义 props
      {...props}
    >
      {children}
    </KeyboardAwareScrollView>
  )
}
