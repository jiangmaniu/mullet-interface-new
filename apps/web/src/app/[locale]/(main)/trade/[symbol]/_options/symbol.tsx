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
