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
  // Android 需要包裹 PullToRefresh,iOS 直接使用 Header
  if (Platform.OS === 'android') {
    return <PullToRefresh header={<CustomPullToRefreshHeader {...props} />} />
  }
  return <CustomPullToRefreshHeader {...props} />
}
