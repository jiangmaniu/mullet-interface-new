import { action, makeAutoObservable, observable } from 'mobx'

export class SearchStore {
  constructor() {
    makeAutoObservable(this)
  }
  @observable filterSymbol = ''

  @action
  setFilterSymbol = (symbol: string) => {
    this.filterSymbol = symbol
  }

  @action
  getFilterSymbol = () => {
    return this.filterSymbol
  }

  // ========== 全局页面初始化执行 ================
}

const search = new SearchStore()

export default search
