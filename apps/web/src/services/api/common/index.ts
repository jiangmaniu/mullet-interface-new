import { getIntl } from '@umijs/max'

import { request } from '@/utils/request'

// 上传文件
export async function fileUpload(body: any) {
  return request<API.Response<Common.UploadResult>>('/api/blade-resource/oss/endpoint/put-file', {
    method: 'POST',
    data: body,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 查询手机区号选择
export async function getAreaCode() {
  return request<API.Response<Common.AreaCodeItem[]>>('/api/trade-crm/crmClient/public/countryList', {
    method: 'GET',
    needToken: false
  })
}

// 查询注册方式（客户组创建客户用到）
export async function getRegisterWay() {
  return request<API.Response<API.RegisterWay>>('/api/trade-crm/crmClient/public/param/trade.recharge', {
    method: 'GET',
    needToken: false
  })
}

// 查询注册方式 根据业务线识别码
export async function getRegisterWayByBusinessLine(code: string) {
  return request<API.Response<API.RegisterWayByBusinessLine>>(`/api/trade-crm/crmClient/public/clientGroup/${code}`, {
    method: 'GET',
    needToken: false,
    skipErrorHandler: true
  })
}

// 查询交易品种分类列表
export async function getTradeSymbolCategory() {
  return request<API.Response<API.KEYVALUE[]>>('/api/trade-crm/crmClient/public/dictBiz/symbol_classify', {
    method: 'GET'
  }).then((res) => {
    if (res.success && res.data?.length) {
      res.data = res.data.map((item) => {
        // 动态翻译名称
        return { ...item, value: item.key, label: getIntl().formatMessage({ id: `mt.${item.value.split(',').at(-1)}` }) }
      })
    }
    return res
  })
}
