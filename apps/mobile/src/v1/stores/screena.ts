import { getAppMetal, getMetalAllType, jigouliebiao } from '@/v1/services/cbc'
import { action, makeAutoObservable, observable } from 'mobx'

export type IHuangjin = {
  bjjg: string
  fkfs: string
  id: string
  indexstring: string
  isacceptances: string
  iscash: string
  istax: string
  pricetypename: string
  qname: string
  typename: string
  valuedate: string
  w_caizhi: string
  w_jyd: string
  w_jydcomp: string
  w_scd: string
  w_scdcomp: string
  w_xinghao: string
  zsunitname: string
  title: string
  value: string
}

export type IMetail = {
  metalid: string
  metalname: string
  metaltype: string
  metaltypename: string
}

export type IMetalType = {
  metalid: string
  metalname: string
  app_news_type: {
    typeid: string
    name: string
  }[]
  app_analysis_type: {
    typeid: string
    name: string
  }[]
  pricemenulist: string[]
  app_qh_bjjgtype: {
    bjjg: string
    updatemarktype: string
  }[]
  app_jg_bjjgtype: {
    bjjg: string
    updatemarktype: string
  }[]
}

export type IJigeliebiao = {
  id: string
  name: string
}

export class ScreenAStore {
  constructor() {
    makeAutoObservable(this)
    // this.init()
  }

  @observable huangjin: IHuangjin = {
    typename: '元/克',
    id: '8659', // 黄金 99.99%
    value: '8659', // 黄金 99.99%
    indexstring: 'Au:99.99%' // 黄金99.99%
  } as IHuangjin

  @observable metals: IMetail[] = []
  @observable metalTypes: IMetalType[] = []
  // 机构列表
  @observable jigeliebiao: IJigeliebiao[] = []

  @action setHuangjin = (huangjin: IHuangjin) => {
    this.huangjin = huangjin
  }

  @action setMetals = (metals: IMetail[]) => {
    this.metals = metals
  }

  @action setMetalTypes = (metalTypes: IMetalType[]) => {
    this.metalTypes = metalTypes
  }

  @action setJigeliebiao = (jigeliebiao: IJigeliebiao[]) => {
    this.jigeliebiao = jigeliebiao.map((item) => ({
      ...item,
      id: item.id.trim()
    }))
  }

  @action init = async () => {
    const metals = await getAppMetal()
    this.setMetals(metals)

    const metalTypes = await getMetalAllType()
    this.setMetalTypes(metalTypes)

    const jigeliebiao = await jigouliebiao()
    this.setJigeliebiao(jigeliebiao as IJigeliebiao[])
  }
}

const screenAStore = new ScreenAStore()
export default screenAStore
