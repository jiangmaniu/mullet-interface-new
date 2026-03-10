import { Platform, RefreshControlProps as RNRefreshControlProps } from 'react-native'

import { PullToRefresh } from '@sdcx/pull-to-refresh'

import { CustomPullToRefreshHeader } from './custom-pull-to-refresh-header'

type RefreshControlProps = RNRefreshControlProps

/**
 * 封装的下拉刷新控件
 * 基于 @sdcx/pull-to-refresh,提供统一的自定义样式
 *
 * @example
 * ```tsx
 * const [refreshing, setRefreshing] = useState(false)
 *
 * const handleRefresh = async () => {
 *   setRefreshing(true)
 *   try {
 *     await fetchData()
 *   } finally {
 *     setRefreshing(false)
 *   }
 * }
 *
 * <ScrollView
 *   nestedScrollEnabled
 *   refreshControl={
 *     <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
 *   }
 * >
 *   {content}
 * </ScrollView>
 * ```
 */
export function RefreshControl(props: RefreshControlProps) {
  // Android 使用库自带的 RefreshControl（内部会返回 PullToRefresh 的 DefaultHeader）
  // iOS 使用自定义的 Header 组件
  if (Platform.OS === 'android') {
    // @ts-ignore - 使用库的默认 Header
    return <PullToRefresh.DefaultHeader {...props} />
  }
  return <CustomPullToRefreshHeader {...props} />
}
