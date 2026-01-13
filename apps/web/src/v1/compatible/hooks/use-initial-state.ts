import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query'
import { useRef } from 'react'

import { useStores } from '@/v1/provider/mobxProvider'

export const useInitialState = (): {
  currentUser?: User.UserInfo | null
  initialStateQueryResult: UseQueryResult<User.UserInfo | null, Error>
  fetchUserInfo?: (token?: any) => Promise<User.UserInfo | null | undefined>
} => {
  const { global, trade } = useStores()

  const handleRefreshAccount = async (currentUser?: Nilable<User.UserInfo>) => {
    // 初始化交易配置，在登录后才执行
    // console.log('fetchUserInfo init')
    // setCurrentAccountInfo 中会执行init
    await trade.init()

    // 初始化设置默认当前账号信息
    const localAccountId = trade.currentAccountInfo?.id
    const hasAccount = (currentUser?.accountList || []).some((item) => item.id === localAccountId)
    // 本地不存在账号或本地存在账号但不在登录返回的accountList中，需重新设置默认值，避免切换不同账号登录使用上一次缓存

    if (!localAccountId || (localAccountId && !hasAccount)) {
      await trade.setCurrentAccountInfo(currentUser?.accountList?.[0] as User.AccountItem)
    } else if (localAccountId) {
      // 更新本地本地存在的账号信息，确保证数据是最新的
      await trade.setCurrentAccountInfo(
        // @ts-ignore
        currentUser.accountList?.find((item) => item.id === localAccountId) as User.AccountItem,
      )
    } else {
      await trade.getSymbolList()

      // setCurrentAccountInfo 中会执行init
      // await stores.trade.init()
    }
  }

  const isFirstInitialStateRef = useRef(true)
  const initialStateQueryResult = useQuery({
    queryKey: ['initialState'],
    queryFn: async () => {
      const currentUser = await global.fetchUserInfo()

      try {
        if (isFirstInitialStateRef.current) {
          await handleRefreshAccount(currentUser)
          isFirstInitialStateRef.current = false
        }
      } catch (err) {
        console.error(err)
      }

      if (currentUser) {
        return currentUser
      }

      return null
    },
  })

  const { data: currentUser, refetch } = initialStateQueryResult

  const { mutateAsync: fetchUserInfo, isPending } = useMutation({
    mutationKey: ['fetchUserInfo'],
    mutationFn: async (refreshAccount?: boolean) => {
      if (isPending) {
        return
      }

      const { data: currentUser } = await refetch()
      // 刷新账户信息
      if (refreshAccount !== false) {
        await handleRefreshAccount(currentUser)
      }

      return currentUser
    },
  })

  return {
    currentUser: currentUser,
    initialStateQueryResult,
    fetchUserInfo: fetchUserInfo,
  }
}
