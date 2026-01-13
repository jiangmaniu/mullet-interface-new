import { Trans } from '@lingui/react/macro'

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
  All = '0',
  Forex = '30',
  Commodities = '20',
  Indices = '40',
  Stock = '50',
  Crypto = '10',
}

export const SYMBOL_CATEGORY_OPTIONS: {
  label: React.ReactNode
  value: SymbolCategory
}[] = [
  {
    label: <Trans>全部</Trans>,
    value: SymbolCategory.All,
  },
  {
    label: <Trans>外汇</Trans>,
    value: SymbolCategory.Forex,
  },

  {
    label: <Trans>商品</Trans>,
    value: SymbolCategory.Commodities,
  },
  {
    label: <Trans>指数</Trans>,
    value: SymbolCategory.Indices,
  },
  {
    label: <Trans>股票</Trans>,
    value: SymbolCategory.Stock,
  },

  {
    label: <Trans>数字货币</Trans>,
    value: SymbolCategory.Crypto,
  },
]
