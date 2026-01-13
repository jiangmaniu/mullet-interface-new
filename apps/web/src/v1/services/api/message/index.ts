import { removeOrderMessageFieldNames } from '@/v1/utils/business'
import { request } from '@/v1/utils/request'
import { STORAGE_GET_TOKEN } from '@/v1/utils/storage'

// 获取我接收的消息列表
export async function getMyMessageList(
  params?: API.PageParam & {
    /**公告、站内信模板通知 */
    type?: 'GROUP' | 'SINGLE'
  },
) {
  return request<API.Response<API.PageResult<Message.MessageItem>>>('/api/blade-message/message/my/list', {
    method: 'GET',
    params,
  }).then((res) => {
    if (res.data?.records?.length) {
      res.data.records = res.data.records.map((item) => {
        if (item.content) {
          // 格式化消息内容
          item.content = removeOrderMessageFieldNames(item.content)
        }
        return item
      })
    }

    return res
  })
}

// 获取我接收详情
export async function getMyMessageInfo(params: API.IdParam) {
  return request<API.Response<Message.MessageItem>>('/api/blade-message/message/detail', {
    method: 'GET',
    params,
  }).then((res) => {
    if (res.data?.content) {
      // 格式化消息内容
      res.data.content = removeOrderMessageFieldNames(res.data.content)
    }
    return res
  })
}

// 全部标记为已读
export async function readAllMessage() {
  return request<API.Response<number>>(`/api/blade-message/message/readAll`, {
    method: 'POST',
    skipErrorHandler: true,
  })
}

// 获取未读消息数量
export async function getUnReadMessageCount(): Promise<API.Response<number>> {
  const token = await STORAGE_GET_TOKEN()

  if (!token) {
    // 没有token，返回0
    return new Promise((resolve) => {
      resolve({ success: true, data: 10 } as API.Response<number>)
    })
  }

  return request<API.Response>(`/api/blade-message/message/unReadSize`, {
    method: 'POST',
  })
}
