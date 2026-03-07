import { useLingui } from '@lingui/react/macro'
import { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import {
  PullToRefreshHeader,
  PullToRefreshHeaderProps,
  PullToRefreshOffsetChangedEvent,
  PullToRefreshState,
  PullToRefreshStateChangedEvent,
  PullToRefreshStateIdle,
  PullToRefreshStateRefreshing,
} from '@sdcx/pull-to-refresh'

import { Spinning } from '../ui/spinning'
import { Text } from '../ui/text'

/**
 * 自定义下拉刷新头部组件
 * 提供统一的下拉刷新样式和动画效果
 */
export function CustomPullToRefreshHeader(props: PullToRefreshHeaderProps) {
  const { onRefresh, refreshing } = props
  const { t } = useLingui()
  const [text, setText] = useState(t`下拉刷新`)
  const [opacity, setOpacity] = useState(0)

  const onStateChanged = useCallback((event: PullToRefreshStateChangedEvent) => {
    const state: PullToRefreshState = event.nativeEvent.state
    if (state === PullToRefreshStateIdle) {
      setText(t`下拉刷新`)
    } else if (state === PullToRefreshStateRefreshing) {
      setText(t`正在刷新...`)
      setOpacity(1)
    } else {
      setText(t`松开刷新`)
    }
  }, [])

  const onOffsetChanged = useCallback((event: PullToRefreshOffsetChangedEvent) => {
    const offset = event.nativeEvent.offset
    // 根据下拉距离调整透明度 (0-50px)
    const newOpacity = Math.min(1, offset / 50)
    setOpacity(newOpacity)
  }, [])

  return (
    <PullToRefreshHeader
      style={styles.container}
      onOffsetChanged={onOffsetChanged}
      onStateChanged={onStateChanged}
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      <View style={[styles.content, { opacity }]}>
        {refreshing && <Spinning width={16} height={16} className="text-content-4" />}
        <Text className="text-paragraph-p3 text-content-4">{text}</Text>
      </View>
    </PullToRefreshHeader>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
})
