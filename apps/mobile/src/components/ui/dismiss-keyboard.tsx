import React from 'react'
import { Keyboard, Pressable, View, type ViewProps } from 'react-native'

export type DismissKeyboardProps = ViewProps & {
  /**
   * 是否启用点击失焦功能
   * @default true
   */
  enabled?: boolean
  /**
   * 子组件
   */
  children: React.ReactNode
}

/**
 * DismissKeyboard 组件
 *
 * 用于包裹内容区域，点击时自动收起键盘并失焦所有 input
 *
 * @example
 * ```tsx
 * <DismissKeyboard>
 *   <View>
 *     <NumberInput ... />
 *     <TextInput ... />
 *   </View>
 * </DismissKeyboard>
 * ```
 */
export const DismissKeyboard = ({
  enabled = true,
  children,
  ...props
}: DismissKeyboardProps) => {
  const handlePress = () => {
    if (enabled) {
      Keyboard.dismiss()
    }
  }

  return (
    <Pressable onPress={handlePress} style={{ flex: 1 }} {...props}>
      <View style={{ flex: 1 }} pointerEvents="box-none">
        {children}
      </View>
    </Pressable>
  )
}

DismissKeyboard.displayName = 'DismissKeyboard'
