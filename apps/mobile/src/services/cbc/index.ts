import { getEnv } from '@/env'
import { callSoapService, itype } from '@/utils/soap'
import { stores } from '@/v1/provider/mobxProvider'

// 获取金属列表
export const getAppMetal = async () => {
  const ENVS = await getEnv()
  const res = await callSoapService('Get_APP_Metal', {
    xmlns: 'CBCWEB',
    id: 'o0',
    'c:root': '1',
    pass: itype(ENVS.CBC_PASS),
  })

  try {
    if (res) {
      const result = JSON.parse(res)
      // metaltype === 3 ：贵金属
      const data = result?.['app_metaltype_list']?.flatMap((item: any) =>
        item?.['app_metal'].map((i: any) => ({
          ...i,
          metaltype: item.metaltype,
          metaltypename: item.metaltypename,
        })),
      )
      return data
    }
  } catch (error) {
    console.error('getAppMetal error:', error)
    return []
  }
}

// 價格 - 機構列表
export const jigouliebiao = async () => {
  const ENVS = await getEnv()

  const res = await callSoapService('Get_FutureOrg_type', {
    xmlns: 'CBCWEB',
    id: 'o0',
    'c:root': '1',
    pass: itype(ENVS.CBC_PASS),
  })

  try {
    if (res) {
      const result = JSON.parse(res)
      const app_future_type = result?.['app_future_type']
      const app_orgnization_type = result?.['app_orgnization_type']
      return [...app_future_type, ...app_orgnization_type]
    }
  } catch (error) {
    console.error('shichangfenxi error:', error)
    return []
  }
}

// 获取金属列表 - 二级信息
export const getMetalAllType = async () => {
  const ENVS = await getEnv()
  const res = await callSoapService('Get_Metal_All_type', {
    xmlns: 'CBCWEB',
    id: 'o0',
    'c:root': '1',
    pass: itype(ENVS.CBC_PASS),
  })

  try {
    if (res) {
      const result = JSON.parse(res)
      const data = result?.['app_metal_hy_type']
      return data
    }
  } catch (error) {
    console.error('getMetalAllType error:', error)
    return []
  }
}

// home - 实时价格
export const shishijiage = async (pid: string) => {
  const ENVS = await getEnv()

  const res = await callSoapService('SelectChart_pricelist', {
    xmlns: 'CBCWEB',
    id: 'o0',
    'c:root': '1',
    pid: itype(pid || '8659'),
    pagesize: itype(7),
    pageindex: itype(1),
    updatemarktype: itype('3'),
    vipid: itype(ENVS.CBC_VIP_ID),
    pass: itype(ENVS.CBC_PASS),
  })

  try {
    if (res) {
      const result = JSON.parse(res)
      const data = result?.['historyprice']
      return data
    }
  } catch (error) {
    console.error('shishijiage error:', error)
    return []
  }
}
// home - 榜单
export const bangdan = async () => {
  const ENVS = await getEnv()
  const url = `${ENVS.CBC_SERVER}/app/getprice.ashx?page=1&limit=10&command=getPriceZdb&vipid=${ENVS.CBC_VIP_ID}`

  console.log('🚀 bangdan request:', url)

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`)
  }

  const data = await response.json()
  // console.log('🚀 res:', data)
  return data
}

// home - 市场分析
export const shichangfenxi = async ({
  minId = 0,
  count = 10,
  typeid = '0',
  productid,
}: { minId?: number; count?: number; typeid?: string; productid?: string } = {}) => {
  const ENVS = await getEnv()

  const _productid = stores.screenA.metals.find((item) => item.metalname === '金')?.metalid || '10643'

  const res = await callSoapService('SelectNewList', {
    xmlns: 'CBCWEB',
    id: 'o0',
    'c:root': '1',
    count: itype(count),
    productid: itype(productid || _productid),
    typeid: itype(typeid),
    minId: itype(minId),
    maxId: itype('0'),
    keyname: itype('newsjson'),
    vipid: itype(ENVS.CBC_VIP_ID),
    pass: itype(ENVS.CBC_PASS),
  })

  try {
    if (res) {
      const result = JSON.parse(res)
      const data = result?.['newsjson']
      return data
    }
  } catch (error) {
    console.error('shichangfenxi error:', error)
    return []
  }
}

// 新闻详情
export const xinwenxiangqing = async ({ webid }: { webid: number }) => {
  const ENVS = await getEnv()
  const url = `${ENVS.CBC_SERVER}/app/news.aspx?webid=${webid}&vipid=${ENVS.CBC_VIP_ID}`

  console.log('🚀 xinwenxiangqing request:', url)

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: '*/*',
      'Content-Type': 'text/xml;charset=utf-8',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`)
  }

  const data = await response.text()
  return data
}

// 供求 - 供應信息
export const gongyingxinxi = async ({
  count = 20,
  productid,
  gqtype = 1,
  date,
}: {
  count?: number
  productid?: string
  gqtype?: 1 | 2
  date?: string
}) => {
  const ENVS = await getEnv()

  const res = await callSoapService('SelectList_MallWeb', {
    xmlns: 'CBCWEB',
    id: 'o0',
    'c:root': '1',
    count: itype(count),
    productid: itype(productid || ''),
    gqtype: itype(gqtype),
    date: itype(date || ''),
    pass: itype(ENVS.CBC_PASS),
  })

  try {
    if (res) {
      const result = JSON.parse(res)
      const data = result?.['mallslist']
      return data
    }
  } catch (error) {
    console.error('shichangfenxi error:', error)
    return []
  }
}

// 新闻详情
export const gongqiuxiangqing = async ({ id }: { id: number }) => {
  const ENVS = await getEnv()
  const url = `${ENVS.CBC_SERVER}/app/mallinfo_show.aspx?id=${id}&vipid=${ENVS.CBC_VIP_ID}`

  console.log('🚀 gongqiuxiangqing request:', url)

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: '*/*',
      'Content-Type': 'text/xml;charset=utf-8',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`)
  }

  const data = await response.text()
  return data
}

// 價格 - 分類
export const jiagefenlei = async ({ productid }: { productid: string }) => {
  const ENVS = await getEnv()

  const res = await callSoapService('SelectAreaProduct', {
    xmlns: 'CBCWEB',
    id: 'o0',
    'c:root': '1',
    productid: itype(productid || ''),
    pass: itype(ENVS.CBC_PASS),
  })

  try {
    if (res) {
      const result = JSON.parse(res)
      const data = result?.['product']
      return data
    }
  } catch (error) {
    console.error('shichangfenxi error:', error)
    return []
  }
}

// 價格 - 現貨價格
export const xianhuojiage = async ({ productid }: { productid: string }) => {
  const ENVS = await getEnv()

  const res = await callSoapService('SelectPriceList_Area', {
    xmlns: 'CBCWEB',
    id: 'o0',
    'c:root': '1',
    count: itype(0),
    productid: itype(productid || ''),
    updatetype: itype(0),
    updatemarktype: itype(0),
    productid_big: itype(''),
    isjgf: itype('0'),
    vipid: itype(ENVS.CBC_VIP_ID),
    pass: itype(ENVS.CBC_PASS),
  })

  try {
    if (res) {
      const result = JSON.parse(res)
      const datas = result?.['priceparaminfo']
      const prices = result?.['pricevaluelist']

      return {
        datas,
        prices,
      }
    }
  } catch (error) {
    console.error('shichangfenxi error:', error)
    return []
  }
}

// home - 黄金列表
// home - 实时价格
export const huangjinliebiao = () => xianhuojiage({ productid: '10647' })

// 價格 - 價格列表
export const jiageliebiao = async ({
  productid_big,
  bjjgid,
  updatemarktype,
}: {
  productid_big: string
  bjjgid: string
  updatemarktype: string
}) => {
  const ENVS = await getEnv()

  const res = await callSoapService('SelectPriceList_qhjg', {
    xmlns: 'CBCWEB',
    id: 'o0',
    'c:root': '1',
    count: itype(0),
    productid_big: itype(productid_big || ''),
    bjjgid: itype(bjjgid),
    updatemarktype: itype(updatemarktype),
    vipid: itype(ENVS.CBC_VIP_ID),
    pass: itype(ENVS.CBC_PASS),
  })

  try {
    if (res) {
      const result = JSON.parse(res)
      const datas = result?.['priceparaminfo']
      const priceqhlist = result?.['priceqhlist']
      const priceshhj = result?.['priceshhj']
      const pricenygjs = result?.['pricenygjs']
      const pricety = result?.['pricety']
      const priceother = result?.['priceother']

      return {
        datas,
        prices: [
          ...(Array.isArray(priceqhlist) ? priceqhlist : []),
          ...(Array.isArray(priceshhj) ? priceshhj : []),
          ...(Array.isArray(pricenygjs) ? pricenygjs : []),
          ...(Array.isArray(pricety) ? pricety : []),
          ...(Array.isArray(priceother) ? priceother : []),
        ],
      }
    }
  } catch (error) {
    console.error('shichangfenxi error:', error)
    return []
  }
}
