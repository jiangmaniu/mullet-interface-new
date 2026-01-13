'use client'

import { Trans } from '@lingui/react/macro'
import { observer, useLocalObservable } from 'mobx-react'
import { useState } from 'react'
import VirtualList from 'rc-virtual-list'

import { GeneralTooltip } from '@/components/tooltip/general'
import { getMyMessageInfo, readAllMessage } from '@/services/api/message'
import { EmptyNoData } from '@/v1/components/empty/no-data'
import MessageStore from '@/v1/mobx/MessageStore'
import { useStores } from '@/v1/provider/mobxProvider'
import { Badge } from '@mullet/ui/badge'
import { IconButton } from '@mullet/ui/button'
import { IconBell, IconLanguage } from '@mullet/ui/icons'
import { cn } from '@mullet/ui/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@mullet/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@mullet/ui/tabs'
import { BNumber } from '@mullet/utils/number'

enum NotificationTabsEnum {
  NOTICE = 'NOTICE',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

export const Notification = observer(() => {
  const [value, setValue] = useState<NotificationTabsEnum>(NotificationTabsEnum.NOTICE)
  const { global } = useStores()
  const { messageList } = global
  const getMessage = (isRefresh?: boolean, key?: NotificationTabsEnum) => {
    const tabKey = key || value
    global.getMessageList(isRefresh, tabKey === 'NOTICE' ? 'SINGLE' : 'GROUP')
  }
  const ContainerHeight = messageList.length > 5 ? 500 : 400
  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    // Refer to: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#problems_and_solutions
    if (Math.abs(e.currentTarget.scrollHeight - e.currentTarget.scrollTop - ContainerHeight) <= 1) {
      getMessage(false)
    }
  }
  const messageStore = useLocalObservable(() => MessageStore)
  const unReadCount = messageStore.unReadCount

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div>
          <GeneralTooltip align={'center'} content={<Trans>站内信</Trans>}>
            <IconButton className="relative size-9">
              {BNumber.from(unReadCount).gt(0) && (
                <Badge variant={'message'} position="top-right">
                  {unReadCount}
                </Badge>
              )}
              <IconBell className="size-5" />
              <span className="sr-only">Notification</span>
            </IconButton>
          </GeneralTooltip>
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="max-h-[700px] w-[330px] p-0">
        <Tabs
          value={value}
          variant={'underline'}
          size={'md'}
          onValueChange={(value) => {
            setValue(value)
            getMessage(true, value)
          }}
        >
          <TabsList className="border-b-0 px-0">
            <TabsTrigger value={NotificationTabsEnum.NOTICE}>
              <Trans>通知</Trans>
            </TabsTrigger>
            <TabsTrigger value={NotificationTabsEnum.ANNOUNCEMENT}>
              <Trans>公告</Trans>
            </TabsTrigger>
          </TabsList>
          <div className="h-full py-3">
            <TabsContent value="notification">
              <div>通知</div>
            </TabsContent>
            <TabsContent value="announcement">
              <div>公告</div>
            </TabsContent>
            {!messageList.length ? (
              <EmptyNoData />
            ) : (
              <>
                <VirtualList
                  data={messageList}
                  height={ContainerHeight}
                  styles={{
                    verticalScrollBarThumb: {
                      width: 6,
                      borderRadius: 4,
                    },
                    verticalScrollBar: {
                      background: 'transparent',
                    },
                  }}
                  // itemHeight={41}
                  itemKey="id"
                  onScroll={onScroll}
                >
                  {(item) => {
                    return <NotificationListItem activeTab={value} item={item} key={item.id} />
                  }}
                </VirtualList>
              </>
            )}
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
})

const NotificationListItem = observer(
  ({ activeTab, item }: { activeTab: NotificationTabsEnum; item: Message.MessageItem }) => {
    const isUnRead = item.isRead === 'UNREAD'
    const { global } = useStores()
    const handleClickItem = async (id: any) => {
      const res = await getMyMessageInfo({ id })
      if (res.success) {
        MessageStore.getUnreadMessageCount()
        global.messageList = global.messageList.map((item) => {
          if (item.id === id) {
            item.isRead = 'READ'
          }
          return item
        })
      }
    }

    return (
      <div
        className={cn('gap-xs p-xl flex flex-col', {
          'hover:bg-move-in cursor-pointer': isUnRead,
          'pointer-events-none': !isUnRead,
        })}
        onClick={() => {
          if (isUnRead) {
            handleClickItem(item.id)
          }
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="text-paragraph-p2 text-content-1">{item.title}</div>
          {isUnRead && <div className="bg-market-fall size-2 rounded-full"></div>}
        </div>
        <div className="text-paragraph-p3 text-content-4">{item.content}</div>
        <div className="text-paragraph-p3 text-content-4">{item.createTime}</div>
      </div>
    )
  },
)
