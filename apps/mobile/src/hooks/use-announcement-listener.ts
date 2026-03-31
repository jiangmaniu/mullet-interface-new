import { useEffect } from 'react'

import { toast } from '@/components/ui/toast'
import { MessagePopupInfo } from '@/lib/ws/types'
import mitt from '@/utils/mitt'

/** 全局监听 ws 公告推送，弹出通知 Toast */
export function useAnnouncementListener() {
  useEffect(() => {
    const handleWsMessagePopup = (info: unknown) => {
      const data = info as MessagePopupInfo

      toast.announcement({
        id: data.messageLogId,
        title: data.title,
        content: data.content,
      })
    }

    mitt.on('ws-message-popup', handleWsMessagePopup)
    return () => {
      mitt.off('ws-message-popup', handleWsMessagePopup)
    }
  }, [])
}
