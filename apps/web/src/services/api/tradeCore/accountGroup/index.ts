import qs from 'qs'

import { parseJsonFields } from '@/utils'
import {
  transformTradeFeeShow,
  transformTradeInventoryShow,
  transformTradePrepaymentConfShow,
  transformTradeTimeShow
} from '@/utils/business'
import { request } from '@/utils/request'

// 客户用户-交易账户组
export async function getAccountGroupList() {
  return request<API.Response<AccountGroup.AccountGroupItem[]>>('/api/trade-crm/crmClient/account/accountGroup', {
    method: 'GET'
  }).then((res) => {
    if (res?.success && res.data?.length) {
      res.data.forEach((item) => {
        const synopsis = item.synopsis
        if (synopsis && typeof synopsis === 'string') {
          // 解析账户介绍内容回显
          item.synopsis = JSON.parse(synopsis)
          // 兼容旧数据
          if (!Array.isArray(item.synopsis)) {
            item.synopsis = []
          }
        }
      })
    }
    return res
  })
}

// 交易账户组-分页
export async function getAccountGroupPageList(params?: AccountGroup.AccountGroupPageListParams) {
  const isSimulate = location.pathname?.indexOf('/account-group/demo') !== -1

  return request<API.Response<API.PageResult<AccountGroup.AccountGroupPageListItem>>>('/api/trade-core/coreApi/accountGroup/list', {
    method: 'GET',
    params: {
      ...params,
      // 根据路径获取真实和模拟账户的参数，用于区分真实、模拟接口
      isSimulate
    }
  })
}

// 交易账户组-详情
export async function getAccountGroupDetail(params?: API.IdParam) {
  return request<API.Response<AccountGroup.AccountGroupPageListItem>>('/api/trade-core/coreApi/accountGroup/detail', {
    method: 'GET',
    params
  })
}

// 交易账户组-新增
export async function addAccountGroup(body: AccountGroup.SubmitAccountGroupParams) {
  return request<API.Response>('/api/trade-core/coreApi/accountGroup/add', {
    method: 'POST',
    data: body
  })
}

// 交易账户组-修改
export async function updateAccountGroup(body: AccountGroup.SubmitAccountGroupParams) {
  return request<API.Response>('/api/trade-core/coreApi/accountGroup/update', {
    method: 'POST',
    data: body
  })
}

// 交易账户组-删除
export async function removeAccountGroup(body: API.IdParam) {
  return request<API.Response>(`/api/trade-core/coreApi/accountGroup/remove?${qs.stringify(body)}`, {
    method: 'GET'
  })
}

// ================================

// 交易账户组关联产品-分页
export async function getAccountGroupSymbolList(params?: AccountGroup.AccountGroupSymbolPageListParam) {
  return request<API.Response<API.PageResult<AccountGroup.AccountGroupSymbolPageListItem>>>(
    '/api/trade-core/coreApi/accountGroup/symbol/list',
    {
      method: 'GET',
      params
    }
  )
}

// 交易账户组关联产品配置-详情
export async function getAccountGroupConfigDetail(params?: API.IdParam) {
  return request<API.Response<Symbol.SymbolConf>>('/api/trade-core/coreApi/accountGroup/conf/detail', {
    method: 'GET',
    params
  }).then((res) => {
    let data: any = res?.data || {}

    if (res.success) {
      // 字符串对象转对象
      data = parseJsonFields(data, [
        'prepaymentConf', // 预付款配置
        'spreadConf', // 点差配置
        'tradeTimeConf', // 交易时间配置
        'quotationConf', // 报价配置
        'transactionFeeConf', // 手续费配置
        'holdingCostConf' // 库存费配置
      ])

      // 预付款配置回显处理
      if (data?.prepaymentConf) {
        // @ts-ignore
        data.prepaymentConf = transformTradePrepaymentConfShow(data.prepaymentConf)
      }

      // 库存费配置回显处理
      if (data?.holdingCostConf) {
        // @ts-ignore
        data.holdingCostConf = transformTradeInventoryShow(data.holdingCostConf)
      }

      // 交易时间配置回显处理
      if (data?.tradeTimeConf) {
        // @ts-ignore
        data.tradeTimeConf = transformTradeTimeShow(data.tradeTimeConf)
      }

      // 手续费配置回显处理
      if (data?.transactionFeeConf) {
        // @ts-ignore
        data.transactionFeeConf = transformTradeFeeShow(data.transactionFeeConf)
      }

      // 重新赋值
      res.data = data
    }

    return res
  })
}

// 交易账户组关联产品配置 修改
export async function updateAccountGroupConfig(body: AccountGroup.UpdateAccountGroupConfig) {
  return request<API.Response>('/api/trade-core/coreApi/accountGroup/conf/edit', {
    method: 'POST',
    data: body
  })
}

// 交易账户组关联产品-新增/修改
export async function saveAccountGroupSymbol(body: AccountGroup.AddOrUpdateAccountGroupSymbol) {
  return request<API.Response>('/api/trade-core/coreApi/accountGroup/symbol/save', {
    method: 'POST',
    data: body
  })
}

// 交易账户组关联产品 默认/自定义开关
export async function switchAccountGroupSymbolDefault(params?: AccountGroup.SwitchAccountGroupSymbol) {
  return request<API.Response>('/api/trade-core/coreApi/accountGroup/symbol/switch', {
    method: 'GET',
    params
  })
}

// 交易账户组关联产品-删除
export async function deleteAccountGroupSymbol(body: API.IdParam) {
  return request<API.Response>(`/api/trade-core/coreApi/accountGroup/symbol/delete?${qs.stringify(body)}`, {
    method: 'GET'
  })
}
