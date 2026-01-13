import { useCallback, useEffect } from 'react'
import { notification } from 'antd'
import { Toast } from 'antd-mobile'

import Iconfont from '@/components/Base/Iconfont'
import { useStores } from '@/context/mobxProvider'
import MessageStore from '@/pages/webapp/pages/UserCenter/Message/MessageStore'
import { isPCByWidth } from '@/utils'
import { parseOrderMessage, removeOrderMessageFieldNames } from '@/utils/business'
import mitt from '@/utils/mitt'
import { getPathname } from '@/utils/navigator'
import { MessagePopupInfo } from '@/v1/mobx/ws.types'

// 监听ws消息
export default function useReceiveWsMessage() {
  const { ws, trade } = useStores()

  const handleWsMessagePopup = useCallback((info: any) => {
    const messagePopupInfo = info as MessagePopupInfo
    if (!messagePopupInfo?.title) return
    // 刷新消息未读数量
    MessageStore.getUnreadMessageCount()
    const content = removeOrderMessageFieldNames(messagePopupInfo?.content || '')
    console.log('更新消息通知', messagePopupInfo)

    // 公告消息不弹窗
    // if (info?.type === 'GROUP') return

    if (isPCByWidth()) {
      if (location.pathname.indexOf('/trade') === -1) return
      notification.info({
        message: <span className="text-primary font-medium">{messagePopupInfo?.title}</span>,
        description: <span className="text-secondary">{content}</span>,
        placement: 'bottomRight',
        style: {
          background: 'var(--dropdown-bg)',
        },
        showProgress: true,
      })
    } else {
      // Toast.show({
      //   content: (
      //     <div className="toast-container">
      //       {messagePopupInfo?.title}：{content}
      //     </div>
      //   ),
      //   position: 'top',
      //   duration: 3000
      // })
      // 只在这些入口页面提示消息
      const paths = ['/app/quote', '/app/trade', '/app/position', '/app/quote/kline', '/app/user-center']
      const pathname = getPathname(location.pathname)
      if (!paths.includes(pathname)) {
        return
      }

      const fields = parseOrderMessage(messagePopupInfo?.content || '')
      // const symbolIcon = trade.symbolListAll.find((item) => item.symbol === fields.symbol)?.imgUrl
      Toast.show({
        content: (
          <div
            className="flex w-full flex-col items-center"
            onClick={() => {
              Toast.clear()
              // push('/app/position')
            }}
          >
            <div className="flex w-full items-center justify-between bg-gray-50 px-[14px] py-[6px]">
              <div className="flex items-center">
                <Iconfont size={18} name="chengjiaotongzhi" />
                <span className="text-primary font-pf-medium pl-1 text-xs">
                  {/* {getIntl().formatMessage({ id: 'mt.xiaoxitongzhi' })} */}
                  {messagePopupInfo?.title}
                </span>
              </div>
              {/* <Iconfont size={18} name="anniu-gengduo" /> */}
            </div>
            <div className="flex w-full items-center justify-between px-[14px] py-[10px]">
              <div className="flex flex-col">
                <div className="flex items-center">
                  {/* <div className="flex items-center">
                    <img src={getSymbolIcon(symbolIcon)} width={20} height={20} alt="" className="rounded-full" />
                    <span className="text-primary font-semibold text-base pl-1">{fields.symbol}</span>
                  </div> */}
                  {/* <span className={cn('text-base font-pf-medium pl-2', fields.tradeDirection === 'BUY' ? 'text-green' : 'text-red')}> */}
                  {/* {fields.tradeDirection === 'BUY'
                      ? getIntl().formatMessage({ id: 'mt.mairu' })
                      : getIntl().formatMessage({ id: 'mt.maichu' })}{' '} */}
                  {/* @TODO 暂时没有杠杆支持 */}
                  {/* 20X */}
                  {/* </span> */}
                  {messagePopupInfo?.content}
                </div>
                {/* @TODO 暂时没有保证金类型、订单类型 */}
                {/* {(fields.marginType || fields.orderType) && (
                  <div className="flex items-center pt-1">
                    <span className="text-primary text-xs">
                      {fields.marginType === 'CROSS_MARGIN'
                        ? getIntl().formatMessage({ id: 'mt.quancang' })
                        : getIntl().formatMessage({ id: 'mt.zhucang' })}
                    </span>
                    {fields.orderType && (
                      <>
                        <span className="mx-1 bg-gray-500 w-[1px] h-2"></span>
                        <span className="text-primary text-xs">{getEnum().Enum.OrderType[fields.orderType]?.text}</span>
                      </>
                    )}
                  </div>
                )} */}
              </div>
              {/* <div className="text-primary text-base font-pf-medium">
                {getIntl().formatMessage({ id: 'mt.chengjiao' })} {fields.tradeVolume}
                {getIntl().formatMessage({ id: 'mt.lot' })}
              </div> */}
            </div>
          </div>
        ),
        position: 'top',
        duration: 5000,
        maskClassName: 'webapp-custom-message animate__animated animate__bounceInDown',
      })
    }
  }, [])

  useEffect(() => {
    mitt.on('ws-message-popup', handleWsMessagePopup)
    return () => {
      mitt.off('ws-message-popup', handleWsMessagePopup)
    }
  }, [])
}
