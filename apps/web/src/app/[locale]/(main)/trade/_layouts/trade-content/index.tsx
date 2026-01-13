'use client'

import { useEffect } from 'react'
import { useNetwork, useTitle } from 'ahooks'

import { useInitialState } from '@/v1/compatible/hooks/use-initial-state'
import usePageVisibility from '@/v1/hooks/usePageVisibility'
import useSyncDataToWorker from '@/v1/hooks/useSyncDataToWorker'
import ws from '@/v1/mobx/ws'
import { useStores } from '@/v1/provider/mobxProvider'
import { checkPageShowTime } from '@/v1/utils/business'
import { STORAGE_SET_TRADE_PAGE_SHOW_TIME } from '@/v1/utils/storage'

import { AccountDetails } from '../../[symbol]/_comps/account'
import { TradeActionPanel } from '../../[symbol]/_comps/action-panel'
import { TradeMarket } from '../../[symbol]/_comps/market'
import { Overview } from '../../[symbol]/_comps/overview'
import { TradeLayout } from '../grid-layout'
import { TradeLayoutKey } from '../grid-layout/types'

export const TradeContent = () => {
  const { ws, trade, kline } = useStores()
  // const { fetchUserInfo } = useModel('user')
  // const { pathname } = useLocation()
  // const { setMode } = useTheme()
  // const currentUser = initialState?.currentUser
  const { currentUser: currentUserState } = useInitialState()
  const currentUser = currentUserState

  const networkState = useNetwork()
  const isOnline = networkState.online

  useTitle(`${trade.activeSymbolName} | ${'交易'}`)

  // 同步数据到worker线程
  useSyncDataToWorker()

  // useEffect(() => {
  //   if (!currentUser?.accountList?.length) {
  //     push(ADMIN_HOME_PAGE)
  //   }
  // }, [currentUser])

  const onSubscribeExchangeRateQuote = () => {
    // 订阅当前激活的汇率品种行情
    setTimeout(() => {
      ws.subscribeExchangeRateQuote()
    }, 1000)
  }

  // useEffect(() => {
  //   if (!currentUser || !STORAGE_GET_TOKEN()) {
  //     replace(WEB_LOGIN_PAGE)
  //   }
  // }, [currentUser])

  useEffect(() => {
    if (trade.currentAccountInfo?.status === 'DISABLED' || trade.currentAccountInfo?.enableConnect === false) {
      // push('/account')
    }
  }, [trade.currentAccountInfo])

  useEffect(() => {
    // 提前初始化worker
    ws.initWorker()
  }, [])

  useEffect(() => {
    checkPageShowTime()

    // 如果网络断开，在连接需要重新重新建立新的连接
    if (!isOnline) {
      ws.close()
    }
    if (isOnline) {
      // 重新建立新连接
      ws.connect()
    }

    return () => {
      // 关闭ws连接
      ws.close()
    }
  }, [isOnline])

  useEffect(() => {
    onSubscribeExchangeRateQuote()

    // 查询当前品种的ticker 高开低收信息
    trade.queryTradeSymbolTicker(trade.activeSymbolName)
  }, [trade.activeSymbolName])

  usePageVisibility(
    () => {
      // 用户从后台切换回前台时执行的操作
      ws.connect()

      trade.setTradePageActive(true)

      onSubscribeExchangeRateQuote()

      // 避免多次刷新
      if (!checkPageShowTime()) return

      // ws没有返回token失效状态，需要查询一次用户信息，看当前登录态是否失效，避免长时间没有操作情况
      // fetchUserInfo(true)
    },
    () => {
      // 用户从前台切换到后台时执行的操作

      trade.setTradePageActive(false)

      // 关闭ws
      ws.close()

      STORAGE_SET_TRADE_PAGE_SHOW_TIME(Date.now())
    },
  )

  return (
    <TradeLayout
      slots={{
        // [TradeLayoutKey.Tabs]: (
        //   <div className="h-full bg-red-500">
        //     {/* <TradingPairTabs /> */}
        //     tabs
        //   </div>
        // ),
        [TradeLayoutKey.Overview]: (
          <div className="h-full">
            <Overview />
          </div>
        ),
        [TradeLayoutKey.Tradingview]: (
          <div className="h-full">
            <TradeMarket />
          </div>
        ),
        [TradeLayoutKey.Orderbooks]: (
          <div className="h-full bg-yellow-500">
            {/* <OrderBooks /> */}
            orderbooks
          </div>
        ),
        [TradeLayoutKey.Account]: (
          <div className="h-full">
            <AccountDetails />
          </div>
        ),
        [TradeLayoutKey.Action]: (
          <div className="h-full bg-zinc-50">
            <TradeActionPanel />
            {/* action */}
          </div>
        ),
        [TradeLayoutKey.Position]: <div className="h-full bg-orange-500">{/* <Records /> */}</div>,
        [TradeLayoutKey.MarginRate]: (
          <div className="h-full bg-orange-900">
            {/* <MarginRate /> */}
            marginrate
          </div>
        ),
      }}
    />
  )
}
