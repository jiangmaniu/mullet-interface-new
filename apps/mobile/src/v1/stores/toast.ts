// import type { IToastProps } from '@/components/Base/Modal/Toast'
import { action, configure, makeObservable, observable, runInAction } from 'mobx'

// 禁用 MobX 严格模式
configure({ enforceActions: 'never' })

// type IToastConfig = Pick<IToastProps, 'content' | 'type' | 'duration'>
type IToastConfig = Pick<any, 'content' | 'type' | 'duration'>
// 全局Toast配置

class ToastStore {
  constructor() {
    makeObservable(this) // 使用 makeObservable mobx6.0 才会更新视图
  }
  @observable config = {} as IToastConfig
  @observable visible = false
  @observable sheetModalOpen: any[] = [] // 标志SheetModal是否打开状态

  @action
  setConfig = (config: IToastConfig) => {
    runInAction(() => {
      this.config = {
        ...this.config,
        ...config
      }
    })
  }

  @action
  setVisible = (visible: boolean) => {
    runInAction(() => {
      this.visible = visible
    })
  }

  @action
  pushSheetModalOpen = (open: any) => {
    runInAction(() => {
      if (this.sheetModalOpen.length < 2) {
        this.sheetModalOpen.push(open)
      }
    })
  }

  @action
  popSheetModalOpen = () => {
    runInAction(() => {
      this.sheetModalOpen.pop()
    })
  }
}

const toast = new ToastStore()

export default toast
