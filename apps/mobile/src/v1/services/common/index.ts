import { t } from '@lingui/core/macro'
import { request } from '@/v1/utils/request'

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
    skipErrorHandler: true,
    needToken: false
  })
}

// 查询交易品种分类列表
export async function getTradeSymbolCategory() {
  return request<API.Response<API.KEYVALUE[]>>('/api/trade-crm/crmClient/public/dictBiz/symbol_classify', {
    method: 'GET'
  }).then((res) => {
    if (res.success && res.data?.length) {
      res.data = res.data.map((item) => {
        // 动态翻译名称 - 使用最后一个逗号后面的值作为 label
        return { ...item, value: item.key, label: item.value.split(',').at(-1) || item.value }
      })
    }
    return res
  })
}

// 查找最新的版本信息
export async function getAppVersion(params: {
  /** 渠道号 */
  channelNumber: string
  /** 设备类型 */
  device: Common.VersionItem['device']
  /** 当前APP的版本号 1.0.0 */
  versionNumber: string
  /** APP版本更新、AB面控制 */
  type: 'APP' | 'AB'
}) {
  return request<API.Response<Common.VersionItem>>(`/api/blade-system/client/version/getAppVersion`, {
    method: 'GET',
    skipAllErrorHandler: true,
    needToken: false,
    params
  })
}
