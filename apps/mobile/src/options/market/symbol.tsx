import { Trans } from '@lingui/react/macro'

import { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'

export enum SymbolFilterMode {
  All = '0',
  Favorite = '1',
}

export const SYMBOL_FILTER_MODE_OPTIONS = [
  {
    label: <Trans>全部</Trans>,
    value: SymbolFilterMode.All,
  },
  {
    label: <Trans>自选</Trans>,
    value: SymbolFilterMode.Favorite,
  },
]

/**
 * 需要与管理后台写死的枚举保持一致，管理后台有变动需要通知前端改对应的枚举
 */
export enum SymbolCategory {
  Favorite = '-1',
  All = '0',
  Forex = '30',
  Commodities = '20',
  Indices = '40',
  Stock = '50',
  Crypto = '10',
}

export type SymbolCategoryOption = {
  label: MessageDescriptor
  value: SymbolCategory
}

export const SYMBOL_CATEGORY_OPTIONS: SymbolCategoryOption[] = [
  {
    label: msg`自选`,
    value: SymbolCategory.Favorite,
  },
  {
    label: msg`全部`,
    value: SymbolCategory.All,
  },
  {
    label: msg`数字货币`,
    value: SymbolCategory.Crypto,
  },
  {
    label: msg`外汇`,
    value: SymbolCategory.Forex,
  },
  {
    label: msg`商品`,
    value: SymbolCategory.Commodities,
  },
  {
    label: msg`指数`,
    value: SymbolCategory.Indices,
  },
  {
    label: msg`股票`,
    value: SymbolCategory.Stock,
  },
]
