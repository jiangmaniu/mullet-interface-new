import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { View } from "react-native"
import { IconSpinner } from "./icons"
import { Text } from "./text"

export type LoadingOptions = {
  /** 自定义内容，不传则显示默认 spinner */
  children?: ReactNode
  /** 自动关闭时间（毫秒），不传则需手动 hide */
  duration?: number
}

type LoadingState = LoadingOptions & { visible: boolean }

type Listener = (state: LoadingState) => void

let listener: Listener | null = null

function emit(state: LoadingState) {
  listener?.(state)
}

/**
 * 全局 Loading API
 *
 * loading.show()  — 显示默认 spinner，不自动关闭
 * loading.show({ children })  — 自定义内容
 * loading.show({ duration: 3000 })  — 3 秒后自动关闭
 * loading.hide()  — 隐藏
 */
export const loading = {
  show: (options?: LoadingOptions) =>
    emit({ visible: true, children: options?.children, duration: options?.duration }),
  hide: () => emit({ visible: false }),
}

/**
 * 全局 Loading 组件，需在 root Providers 中渲染一次
 */
export function Loading() {
  const [state, setState] = useState<LoadingState>({ visible: false })

  useEffect(() => {
    listener = setState
    return () => {
      listener = null
    }
  }, [])

  useEffect(() => {
    if (!state.visible || state.duration == null) return
    const id = setTimeout(() => loading.hide(), state.duration)
    return () => clearTimeout(id)
  }, [state.visible, state.duration])

  if (!state.visible) return null

  return (
    <View className="absolute inset-0 z-50 items-center justify-center">
      <View className="rounded-large bg-special p-[32px] flex-col items-center justify-center gap-xl">
        <IconSpinner animated className="text-content-1" width={32} height={32} />
        {state.children}
      </View>
    </View>
  )
}


export function LoadingContent({ children }: { children: ReactNode }) {
  return <Text className="text-paragraph-p2 text-content-1">{children}</Text>
}