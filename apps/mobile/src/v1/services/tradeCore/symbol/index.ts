import qs from 'qs'

import { parseJsonFields } from '@/v1/utils'
import {
  formatMultipleValue,
  transformTradeFeeShow,
  transformTradeInventoryShow,
  transformTradePrepaymentConfShow,
  transformTradeTimeShow
} from '@/v1/utils/business'
import { request } from '@/v1/utils/request'

// 交易品种-新增
export async function addSymbol(body: Symbol.SubmitSymbolParams) {
  return request<API.Response>('/api/trade-core/coreApi/symbols/add', {
    method: 'POST',
    data: body
  })
}

// 交易品种-修改
export async function updateSymbol(body: Symbol.SubmitSymbolParams) {
  return request<API.Response>('/api/trade-core/coreApi/symbols/update', {
    method: 'POST',
    data: body
  })
}

// 交易品种-删除
export async function removeSymbol(body: API.IdParam) {
  return request<API.Response>(`/api/trade-core/coreApi/symbols/remove?${qs.stringify(body)}`, {
    method: 'POST'
  })
}

// 交易品种分页列表
export async function getSymbolPageList(params?: API.PageParam) {
  return request<API.Response<API.PageResult<Symbol.SymbolListItem>>>('/api/trade-core/coreApi/symbols/page', {
    method: 'GET',
    params
  })
}

// 交易品种详情页
export async function getSymbolDetail(params: API.IdParam) {
  return request<API.Response<Symbol.SymbolListItem>>('/api/trade-core/coreApi/symbols/detail', {
    method: 'GET',
    params
  }).then((res) => {
    const data = res?.data || {}
    let symbolConf = data?.symbolConf
    if (symbolConf) {
      // 字符串对象转对象
      symbolConf = parseJsonFields(symbolConf, [
        'prepaymentConf', // 预付款配置
        'spreadConf', // 点差配置
        'tradeTimeConf', // 交易时间配置
        'quotationConf', // 报价配置
        'transactionFeeConf', // 手续费配置
        'holdingCostConf' // 库存费配置
      ])

      // 格式化多选字段，转化为数组
      symbolConf = formatMultipleValue(['orderType'], symbolConf)

      // 预付款配置回显处理
      const prepaymentConf = symbolConf?.prepaymentConf
      if (prepaymentConf) {
        // @ts-ignore
        symbolConf.prepaymentConf = transformTradePrepaymentConfShow(prepaymentConf)
      }

      // 库存费配置回显处理
      const holdingCostConf = symbolConf?.holdingCostConf
      if (holdingCostConf) {
        // @ts-ignore
        symbolConf.holdingCostConf = transformTradeInventoryShow(holdingCostConf)
      }

      // 交易时间配置回显处理
      const tradeTimeConf = symbolConf?.tradeTimeConf
      if (tradeTimeConf) {
        // @ts-ignore
        symbolConf.tradeTimeConf = transformTradeTimeShow(tradeTimeConf)
      }

      // 手续费配置回显处理
      const transactionFeeConf = symbolConf?.transactionFeeConf
      if (transactionFeeConf) {
        // @ts-ignore
        symbolConf.transactionFeeConf = transformTradeFeeShow(transactionFeeConf)
      }

      res.data = {
        ...(symbolConf || {}), // 展开方便回显表单字段
        ...data
      }
    }

    return res
  })
}

// 获取后台配置的全部品种列表，用于验证汇率品种是否配置
export async function getAllSymbols(params?: API.PageParam) {
  return request<API.Response<Symbol.AllSymbolItem[]>>('/api/trade-core/coreApi/symbols/list', {
    method: 'GET',
    skipErrorHandler: true,
    params
  })
}
