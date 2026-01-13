import { getMyMessageInfo, getMyMessageList, getUnReadMessageCount } from '@/v1/services/api/message'
import { action, makeAutoObservable, observable, runInAction } from 'mobx'

interface IListData {
  /** 列表数据 */
  list: Message.MessageItem[]
  /** 是否有下一页 */
  hasMore: boolean
  /** 上拉刷新 */
  refreshing: boolean
  /** 页码 */
  current: number
  /** 每页大小 */
  size: number
  /** 加载中 */
  loading: boolean
}
class MessageStore {
  constructor() {
    makeAutoObservable(this)
  }
  @observable listData: IListData = {
    list: [],
    hasMore: false,
    refreshing: false,
    current: 1,
    size: 10,
    loading: false,
  }
  @observable info = {} as Message.MessageItem
  @observable infoLoading = false
  @observable unReadCount = 0

  @action
  resetPage = () => {
    this.listData.current = 1
  }
  @action
  getList = async (loadMore?: boolean, type?: 'GROUP' | 'SINGLE') => {
    if (this.listData.refreshing) {
      return
    }
    if (loadMore) {
      if (!this.listData.hasMore) return
      this.listData.current += 1
    }
    try {
      this.listData.loading = true
      const response = await getMyMessageList({
        current: this.listData.current,
        size: this.listData.size,
        type,
      })
      if (response.success) {
        const data = response.data
        const list = data?.records as Message.MessageItem[]
        const totalPage = Number(data?.pages)
        runInAction(() => {
          this.listData.list = loadMore ? this.listData.list.concat(list) : list
          this.listData.hasMore = this.listData.current < totalPage
          this.listData.loading = false
        })
      }
    } finally {
      runInAction(() => {
        this.listData.refreshing = false
      })
    }
  }
  @action getInfo = async (params: API.IdParam) => {
    this.infoLoading = true
    this.info = {}
    const response = await getMyMessageInfo(params)
    if (response.success) {
      runInAction(() => {
        const info = response.data || {}
        this.info = info
      })
      // 更新未读数量
      this.getUnreadMessageCount()
    }
    runInAction(() => {
      this.infoLoading = false
    })

    return response
  }

  // 获取未读消息数量
  getUnreadMessageCount = async () => {
    const res = await getUnReadMessageCount()
    const count = res.data || 0

    runInAction(() => {
      this.unReadCount = count
    })
  }
}

export default new MessageStore()
